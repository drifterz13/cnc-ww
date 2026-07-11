import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../infrastrucure/prisma/prisma.module';
import { AuditController } from './audit.controller';
import { AuditRepo } from './audit.repository';
import { AuditService } from './audit.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [AuditController],
  providers: [AuditRepo, AuditService],
})
export class AuditModule {}
