import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';

function generateCode6(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private prisma: PrismaService,
    private telegram: TelegramService,
  ) {}

  async register(email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.users.createUser(email, passwordHash);

    await this.users.addRoleToUser(user.id, 'CUSTOMER');

    return this.issueToken(user.id, email, ['CUSTOMER']);
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const roles = user.roles.map((ur) => ur.role.name);
    return this.issueToken(user.id, user.email, roles);
  }

  // ✅ Запросить код восстановления (придёт в Telegram)
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // не раскрываем, существует ли email
    if (!user) return { ok: true };

    // если Telegram не привязан — просто ок (можно добавить email восстановление позже)
    if (!user.telegramChatId) return { ok: true };

    const code = generateCode6();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 минут
    const codeHash = await bcrypt.hash(code, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetCode: codeHash,
        passwordResetExpiresAt: expires,
      },
    });

    await this.telegram.safeReply(
      Number(user.telegramChatId),
      `🔐 Код для восстановления: ${code}\nДействует 10 минут.`,
    );

    return { ok: true };
  }

  // ✅ Сменить пароль по коду
  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordResetCode || !user.passwordResetExpiresAt) {
      throw new BadRequestException('Неверный код или срок истёк');
    }

    if (user.passwordResetExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Неверный код или срок истёк');
    }

    const ok = await bcrypt.compare(code, user.passwordResetCode);
    if (!ok) {
      throw new BadRequestException('Неверный код или срок истёк');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetCode: null,
        passwordResetExpiresAt: null,
      },
    });

    if (user.telegramChatId) {
      await this.telegram.safeReply(Number(user.telegramChatId), '✅ Пароль изменён');
    }

    return { ok: true };
  }

  private issueToken(userId: number, email: string, roles: string[]) {
    const accessToken = this.jwt.sign({ sub: userId, email, roles });
    return { accessToken };
  }

  async getMe(userId: number) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) throw new UnauthorizedException();

  return {
    id: user.id,
    email: user.email,
    roles: user.roles.map((ur) => ur.role.name),
    telegramLinked: Boolean(user.telegramChatId),
  };
}

}

