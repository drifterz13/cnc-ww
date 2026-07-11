import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastrucure/prisma/prisma.module';
import { ConcertsController } from './concerts.controller';
import { ConcertRepo } from './concerts.repository';
import { ConcertsService } from './concerts.service';

@Module({
  imports: [PrismaModule],
  controllers: [ConcertsController],
  providers: [ConcertRepo, ConcertsService],
})
export class ConcertsModule {}
