import { Injectable } from '@nestjs/common';
import { ConcertRepo } from '../concerts/concerts.repository';

@Injectable()
export class DiscoveryService {
  constructor(private readonly concertRepo: ConcertRepo) {}

  findAll() {
    return this.concertRepo.findAll();
  }
}
