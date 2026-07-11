import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../infrastrucure/prisma/prisma.module';
import { HistoryController } from './history.controller';
import { HistoryRepo } from './history.repository';
import { HistoryService } from './history.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [HistoryController],
  providers: [HistoryRepo, HistoryService],
})
export class HistoryModule {}
