import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ConcertsModule } from '../concerts/concerts.module';
import { DiscoveryController } from './discovery.controller';
import { DiscoveryService } from './discovery.service';

@Module({
  imports: [AuthModule, ConcertsModule],
  controllers: [DiscoveryController],
  providers: [DiscoveryService],
})
export class DiscoveryModule {}
