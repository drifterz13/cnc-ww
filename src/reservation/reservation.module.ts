import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ConcertsModule } from '../concerts/concerts.module';
import { PrismaModule } from '../infrastrucure/prisma/prisma.module';
import { ReservationController } from './reservation.controller';
import { ReservationRepo } from './reservation.repository';
import { ReservationService } from './reservation.service';

@Module({
  imports: [AuthModule, ConcertsModule, PrismaModule],
  controllers: [ReservationController],
  providers: [ReservationRepo, ReservationService],
})
export class ReservationModule {}
