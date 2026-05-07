import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.service.findMany({
      orderBy: { order: "asc" },
    });
  }

  create(data: any) {
    return this.prisma.service.create({
      data: {
        title: String(data.title),
        shortText: String(data.shortText),
        fullText: String(data.fullText),
        image: String(data.image),
        order: Number(data.order ?? 0),
      },
    });
  }

  async update(id: number, data: any) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException("Service not found");

    return this.prisma.service.update({
      where: { id },
      data: {
        title: String(data.title),
        shortText: String(data.shortText),
        fullText: String(data.fullText),
        image: String(data.image),
        order: Number(data.order ?? 0),
      },
    });
  }

  async remove(id: number) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException("Service not found");

    await this.prisma.service.delete({ where: { id } });
    return { ok: true };
  }
}