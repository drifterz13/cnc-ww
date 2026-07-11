import { HttpStatus, Injectable } from '@nestjs/common';
import { AppError } from '../common/errors/app.error';
import { CreateConcertDto } from './dto/create-concert.dto';
import { ConcertRepo } from './concerts.repository';

@Injectable()
export class ConcertsService {
  constructor(private readonly concertRepo: ConcertRepo) {}

  create(dto: CreateConcertDto) {
    return this.concertRepo.create(dto);
  }

  async delete(id: number) {
    const concert = await this.concertRepo.findById(id);

    if (!concert) {
      throw new AppError('Concert not found', HttpStatus.NOT_FOUND);
    }

    if (await this.concertRepo.hasReservationHistory(id)) {
      throw new AppError(
        'The concert cannot be removed because it has reservation history',
        HttpStatus.CONFLICT,
      );
    }

    return this.concertRepo.delete(id);
  }
}
