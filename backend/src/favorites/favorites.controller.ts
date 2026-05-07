import { Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { FavoritesService } from "./favorites.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";

@Controller("favorites")
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  getFavorites(@CurrentUser() user: any) {
    return this.favoritesService.getFavorites(user.id);
  }

  @Post(":productId")
  addFavorite(@CurrentUser() user: any, @Param("productId") productId: string) {
    return this.favoritesService.addFavorite(user.id, Number(productId));
  }

  @Delete(":productId")
  removeFavorite(@CurrentUser() user: any, @Param("productId") productId: string) {
    return this.favoritesService.removeFavorite(user.id, Number(productId));
  }
}