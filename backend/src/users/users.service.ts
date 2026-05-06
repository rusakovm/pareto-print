import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });
  }

  async createUser(email: string, passwordHash: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already exists');

    return this.prisma.user.create({
      data: { email, passwordHash },
    });
  }

  async ensureRole(name: string) {
    return this.prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  async addRoleToUser(userId: number, roleName: string) {
    const role = await this.ensureRole(roleName);

    return this.prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId: role.id } },
      update: {},
      create: { userId, roleId: role.id },
    });
  }
}