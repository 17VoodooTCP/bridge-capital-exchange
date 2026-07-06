import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (e) {
      // Allow the API to boot even if the DB is not yet provisioned (demo mode)
      console.warn('⚠️  Prisma could not connect to the database — running in degraded mode.');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
