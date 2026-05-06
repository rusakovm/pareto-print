import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('telegram')
export class TelegramController {
  constructor(private telegram: TelegramService) {}

  // 1) получить код привязки (только для залогиненного)
  @UseGuards(AuthGuard('jwt'))
  @Post('link-code')
  async linkCode(@Req() req: any) {
    const userId = req.user?.sub;
    return this.telegram.createLinkCodeForUser(userId);
  }

  // 2) webhook от Telegram
  @Post('webhook')
  async webhook(@Body() update: any) {
    return this.telegram.handleTelegramUpdate(update);
  }
}