import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CartService } from "./cart.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";

@Controller("cart")
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(user.id);
  }

  @Post(":productId")
  addToCart(@CurrentUser() user: any, @Param("productId") productId: string) {
    return this.cartService.addToCart(user.id, Number(productId));
  }

  @Patch(":productId")
  updateQuantity(
    @CurrentUser() user: any,
    @Param("productId") productId: string,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateQuantity(user.id, Number(productId), Number(body.quantity));
  }

  @Delete(":productId")
  removeFromCart(@CurrentUser() user: any, @Param("productId") productId: string) {
    return this.cartService.removeFromCart(user.id, Number(productId));
  }

  @Delete()
  clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user.id);
  }
}