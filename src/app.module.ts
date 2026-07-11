import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConcertsModule } from './concerts/concerts.module';
import { AuditModule } from './audit/audit.module';
import { DiscoveryModule } from './discovery/discovery.module';
import { ReservationModule } from './reservation/reservation.module';
import { HistoryModule } from './history/history.module';
import { RedisModule } from './infrastrucure/redis/redis.module';

@Module({
  imports: [
    RedisModule,
    ConcertsModule,
    AuditModule,
    DiscoveryModule,
    ReservationModule,
    HistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
