import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../infrastrucure/prisma/prisma.module';
import { ConcertsController } from './concerts.controller';
import { ConcertRepo } from './concerts.repository';
import { ConcertsService } from './concerts.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ConcertsController],
  providers: [ConcertRepo, ConcertsService],
})
export class ConcertsModule {}
