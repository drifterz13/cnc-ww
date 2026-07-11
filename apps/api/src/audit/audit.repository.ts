import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastrucure/prisma/prisma.service';

@Injectable()
export class AuditRepo {
  constructor(private readonly prisma: PrismaService) {}

  findAllReservationHistory() {
    return this.prisma.getClient().reservation.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        concert: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { reservedAt: 'desc' },
    });
  }
}
