import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.employee.findMany({
      orderBy: { order: "asc" },
      include: {
        pages: {
          orderBy: { order: "asc" },
        },
      },
    });
  }

  create(data: any) {
    return this.prisma.employee.create({
      data: {
        name: String(data.name),
        role: String(data.role),
        exp: String(data.exp),
        skill: String(data.skill),
        photo: data.photo || null,
        bio: data.bio || null,
        order: Number(data.order ?? 0),
        pages: {
          create: [
            {
              title: "О работе",
              text: data.about || "",
              order: 1,
            },
            {
              title: "Цитата",
              text: data.quote || "",
              order: 2,
            },
            {
              title: "Фокус",
              text: data.focus || "",
              order: 3,
            },
          ],
        },
      },
      include: { pages: true },
    });
  }

  async update(id: number, data: any) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) throw new NotFoundException("Employee not found");

    await this.prisma.employeePage.deleteMany({
      where: { employeeId: id },
    });

    return this.prisma.employee.update({
      where: { id },
      data: {
        name: String(data.name),
        role: String(data.role),
        exp: String(data.exp),
        skill: String(data.skill),
        photo: data.photo || null,
        bio: data.bio || null,
        order: Number(data.order ?? 0),
        pages: {
          create: [
            {
              title: "О работе",
              text: data.about || "",
              order: 1,
            },
            {
              title: "Цитата",
              text: data.quote || "",
              order: 2,
            },
            {
              title: "Фокус",
              text: data.focus || "",
              order: 3,
            },
          ],
        },
      },
      include: { pages: true },
    });
  }

  async remove(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) throw new NotFoundException("Employee not found");

    await this.prisma.employee.delete({
      where: { id },
    });

    return { ok: true };
  }
}