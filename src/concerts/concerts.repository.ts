import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastrucure/prisma/prisma.service';

export type CreateConcertData = {
  name: string;
  description: string;
  totalSeats: number;
};

@Injectable()
export class ConcertRepo {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateConcertData) {
    return this.prisma.getClient().concert.create({
      data: {
        ...data,
        availableSeats: data.totalSeats,
      },
    });
  }

  delete(id: number) {
    return this.prisma.getClient().concert.delete({ where: { id } });
  }

  findAll() {
    return this.prisma.getClient().concert.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  decrementAvailableSeats(concertId: number) {
    return this.prisma.getClient().concert.updateMany({
      where: {
        id: concertId,
        availableSeats: { gt: 0 },
      },
      data: {
        availableSeats: { decrement: 1 },
      },
    });
  }

  incrementAvailableSeats(concertId: number) {
    return this.prisma.getClient().concert.update({
      where: { id: concertId },
      data: {
        availableSeats: { increment: 1 },
      },
    });
  }
}
