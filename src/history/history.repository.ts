import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastrucure/prisma/prisma.service';

@Injectable()
export class HistoryRepo {
  constructor(private readonly prisma: PrismaService) {}

  findReservationHistory(userId: number) {
    return this.prisma.getClient().reservation.findMany({
      where: { userId },
      include: {
        concert: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: { reservedAt: 'desc' },
    });
  }
}
