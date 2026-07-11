import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastrucure/prisma/prisma.service';

@Injectable()
export class ReservationRepo {
  constructor(private readonly prisma: PrismaService) {}

  findByUserAndConcert(userId: number, concertId: number) {
    return this.prisma.getClient().reservation.findUnique({
      where: {
        userId_concertId: {
          userId,
          concertId,
        },
      },
    });
  }

  create(userId: number, concertId: number) {
    return this.prisma.getClient().reservation.create({
      data: {
        userId,
        concertId,
      },
    });
  }

  cancel(userId: number, concertId: number) {
    return this.prisma.getClient().reservation.updateMany({
      where: {
        userId,
        concertId,
        status: 'ACTIVE',
      },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });
  }
}
