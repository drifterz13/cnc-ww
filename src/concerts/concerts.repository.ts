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
    return this.prisma.concert.create({ data });
  }

  delete(id: number) {
    return this.prisma.concert.delete({ where: { id } });
  }
}
