import { HttpStatus, Injectable } from '@nestjs/common';
import { ConcertRepo } from '../concerts/concerts.repository';
import { AppError } from '../common/errors/app.error';
import { PrismaService } from '../infrastrucure/prisma/prisma.service';
import { ReservationRepo } from './reservation.repository';

@Injectable()
export class ReservationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly concertRepo: ConcertRepo,
    private readonly reservationRepo: ReservationRepo,
  ) {}

  reserveSeat(userId: number, concertId: number) {
    return this.prisma.runInTransaction(async () => {
      const existingReservation =
        await this.reservationRepo.findByUserAndConcert(userId, concertId);

      if (existingReservation) {
        throw new AppError(
          'You already have a reservation for this concert',
          HttpStatus.CONFLICT,
        );
      }

      const seatAllocation = await this.concertRepo.decrementAvailableSeats(
        concertId,
      );

      if (seatAllocation.count === 0) {
        throw new AppError('This concert is fully booked', HttpStatus.CONFLICT);
      }

      return this.reservationRepo.create(userId, concertId);
    });
  }

  cancelReservation(userId: number, concertId: number) {
    return this.prisma.runInTransaction(async () => {
      const cancellation = await this.reservationRepo.cancel(userId, concertId);

      if (cancellation.count === 0) {
        throw new AppError(
          'No active reservation was found for this concert',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.concertRepo.incrementAvailableSeats(concertId);
    });
  }
}
