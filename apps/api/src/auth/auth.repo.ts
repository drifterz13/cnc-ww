import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastrucure/prisma/prisma.service';
import { Role } from '../infrastrucure/prisma/generated/client';

@Injectable()
export class AuthRepo {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  createUser(data: { fullName: string; email: string; passwordHash: string }) {
    return this.prisma.user.create({
      data: { ...data, role: Role.USER },
    });
  }
}
