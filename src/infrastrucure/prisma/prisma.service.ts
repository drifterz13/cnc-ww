import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '../../generated/prisma/client';
import { appConfig } from '../../common/config/app.config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly transactionStorage =
    new AsyncLocalStorage<Prisma.TransactionClient>();

  constructor() {
    super({ adapter: new PrismaPg(appConfig.databaseUrl) });
  }

  getClient(): Prisma.TransactionClient | this {
    return this.transactionStorage.getStore() ?? this;
  }

  runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    const transaction = this.transactionStorage.getStore();

    if (transaction) {
      return work();
    }

    return this.$transaction((newTransaction) =>
      this.transactionStorage.run(newTransaction, work),
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
