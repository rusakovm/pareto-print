import {
  Body,
  Controller,
  Delete,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { TelegramService } from "./telegram.service";

@Controller("telegram")
export class TelegramController {
  constructor(private telegram: TelegramService) {}

  @UseGuards(AuthGuard("jwt"))
  @Post("link-code")
  async linkCode(@Req() req: any) {
    const userId = Number(req.user?.id ?? req.user?.userId ?? req.user?.sub);

    if (!userId) {
      throw new UnauthorizedException("Не удалось определить пользователя");
    }

    return this.telegram.createLinkCodeForUser(userId);
  }

@UseGuards(AuthGuard("jwt"))
@Delete("unlink")
async unlink(@Req() req: any) {
  const userId = Number(req.user?.id ?? req.user?.userId ?? req.user?.sub);

  if (!userId) {
    throw new UnauthorizedException("Не удалось определить пользователя");
  }

  return this.telegram.unlinkTelegram(userId);
}

  @Post("webhook")
  async webhook(@Body() update: any) {
    return this.telegram.handleTelegramUpdate(update);
  }
}