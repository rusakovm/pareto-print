import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TelegramModule } from './telegram/telegram.module';
import { CalculatorModule } from './calculator/calculator.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule,CalculatorModule, TelegramModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}