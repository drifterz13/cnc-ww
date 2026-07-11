import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
import { appConfig } from '../../common/config/app.config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({ adapter: new PrismaPg(appConfig.databaseUrl) });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
