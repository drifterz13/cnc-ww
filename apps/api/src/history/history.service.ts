import { Injectable } from '@nestjs/common';
import { HistoryRepo } from './history.repository';

@Injectable()
export class HistoryService {
  constructor(private readonly historyRepo: HistoryRepo) {}

  findReservationHistory(userId: number) {
    return this.historyRepo.findReservationHistory(userId);
  }
}
