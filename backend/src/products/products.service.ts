import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findHero() {
    return this.prisma.product.findMany({
      where: { isHero: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findMerch() {
    return this.prisma.product.findMany({
      where: { isMerch: true },
      orderBy: { createdAt: "desc" },
    });
  }

  private normalize(data: any) {
    const price = Number(data.price);

    if (!data.title?.trim()) {
      throw new BadRequestException("Название товара обязательно");
    }

    if (!Number.isFinite(price) || price <= 0) {
      throw new BadRequestException("Цена должна быть положительным числом");
    }

    if (!data.image?.trim()) {
      throw new BadRequestException("Картинка обязательна");
    }

    return {
      title: String(data.title).trim(),
      author: data.author ? String(data.author).trim() : null,
      description: data.description ? String(data.description).trim() : null,
      price,
      image: String(data.image).trim(),
      category: data.category || "Новинки",
      cover: data.cover || "hard",
      stock: data.stock || "in",
      isHero: data.isHero === true,
      isMerch: data.isMerch === true,
    };
  }

  async create(data: any) {
    return this.prisma.product.create({
      data: this.normalize(data),
    });
  }

  async update(id: number, data: any) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Product not found");
    }

    return this.prisma.product.update({
      where: { id },
      data: this.normalize(data),
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Product not found");
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { ok: true };
  }
}