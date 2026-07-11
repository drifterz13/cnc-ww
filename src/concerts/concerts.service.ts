import { Injectable } from '@nestjs/common';
import { CreateConcertDto } from './dto/create-concert.dto';
import { ConcertRepo } from './concerts.repository';

@Injectable()
export class ConcertsService {
  constructor(private readonly concertRepo: ConcertRepo) {}

  create(dto: CreateConcertDto) {
    return this.concertRepo.create(dto);
  }

  delete(id: number) {
    return this.concertRepo.delete(id);
  }
}
