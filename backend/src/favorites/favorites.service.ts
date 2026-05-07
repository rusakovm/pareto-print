import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  getFavorites(userId: number) {
    return this.prisma.favoriteItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
  }

  addFavorite(userId: number, productId: number) {
    return this.prisma.favoriteItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {},
      create: {
        userId,
        productId,
      },
      include: {
        product: true,
      },
    });
  }

  removeFavorite(userId: number, productId: number) {
    return this.prisma.favoriteItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }
}