import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { randomBytes } from "crypto";

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(private prisma: PrismaService) {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN is missing in .env");
    }
  }

  private ttlMinutes(): number {
    const v = Number(process.env.TELEGRAM_LINK_TTL_MINUTES ?? 10);

    return Number.isFinite(v) && v > 0 ? v : 10;
  }

  // =========================
  // Генерация кода привязки
  // =========================

  async createLinkCodeForUser(userId: number) {
    const code = `PARETO-${randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;

    const expiresAt = new Date(
      Date.now() + this.ttlMinutes() * 60 * 1000,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        telegramLinkCode: code,
        telegramLinkExpiresAt: expiresAt,
      },
    });

    return {
      code,
      expiresAt,
      botUsername: process.env.TELEGRAM_BOT_USERNAME,
    };
  }

  // =========================
  // TELEGRAM WEBHOOK
  // =========================

  async handleTelegramUpdate(update: any) {
    const msg = update?.message;
    const text: string | undefined = msg?.text;
    const chatId = msg?.chat?.id;

    if (!text || !chatId) {
      return { ok: true };
    }

    const trimmed = text.trim();

    if (!trimmed.startsWith("/start")) {
      await this.safeReply(
        chatId,
        "Привет! Чтобы привязать аккаунт, отправь: /start PARETO-XXXXXX",
      );

      return { ok: true };
    }

    const parts = trimmed.split(/\s+/);
    const code = parts[1];

    if (!code) {
      await this.safeReply(
        chatId,
        "Нужен код. Пример: /start PARETO-7F3A1C",
      );

      return { ok: true };
    }

    const user = await this.prisma.user.findFirst({
      where: {
        telegramLinkCode: code,
        telegramLinkExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      await this.safeReply(
        chatId,
        "Код не найден или истёк. Сгенерируй новый в профиле.",
      );

      return { ok: true };
    }

    const chatIdString = String(chatId);

    // если этот telegram уже был у другого аккаунта —
    // отвязываем
    await this.prisma.user.updateMany({
      where: {
        telegramChatId: chatIdString,
        NOT: {
          id: user.id,
        },
      },
      data: {
        telegramChatId: null,
      },
    });

    // привязываем
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        telegramChatId: chatIdString,
        telegramLinkCode: null,
        telegramLinkExpiresAt: null,
      },
    });

    await this.safeReply(
      chatId,
      "✅ Аккаунт успешно привязан!",
    );

    return { ok: true };
  }

  // =========================
  // ОТВЯЗАТЬ TELEGRAM
  // =========================

  async unlinkTelegram(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        telegramChatId: null,
      },
    });

    return {
      ok: true,
    };
  }

  // =========================
  // Отправка сообщения
  // =========================

  async sendToUser(userId: number, text: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.telegramChatId) {
      throw new BadRequestException(
        "Telegram is not linked",
      );
    }

    await this.safeReply(
      Number(user.telegramChatId),
      text,
    );

    return { ok: true };
  }

  // =========================
  // SAFE REPLY
  // =========================

  async safeReply(chatId: number, text: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      this.logger.error(
        "TELEGRAM_BOT_TOKEN is missing",
      );

      return;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const payload = {
      chat_id: chatId,
      text,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const raw = await res.text();

    this.logger.log(
      `[TG] status=${res.status} response=${raw}`,
    );

    if (!res.ok) {
      throw new Error(
        `Telegram sendMessage failed: ${raw}`,
      );
    }
  }
}