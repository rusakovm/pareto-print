import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const url = process.env.DATABASE_URL;

    if (!url) {
      throw new Error('DATABASE_URL is missing. Check backend/.env and restart the server.');
    }

    const adapter = new PrismaPg({ connectionString: url });
    super({ adapter });
  }
}