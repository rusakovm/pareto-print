import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TelegramModule } from './telegram/telegram.module';
import { CalculatorModule } from './calculator/calculator.module';
import { ProductsModule } from './products/products.module';
import { ServicesModule } from './services/services.module';
import { EmployeesModule } from './employees/employees.module';
import { ServicesService } from './services/services.service';
import { CartModule } from './cart/cart.module';
import { FavoritesModule } from './favorites/favorites.module';


@Module({
  imports: [PrismaModule, UsersModule, AuthModule,CalculatorModule, TelegramModule, ProductsModule, ServicesModule, EmployeesModule, CartModule, FavoritesModule],
  controllers: [AppController],
  providers: [AppService, ServicesService],
})
export class AppModule {}