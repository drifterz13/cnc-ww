import { Role } from '../../generated/prisma/client';

export type JwtPayload = {
  sub: number;
  role: Role;
};

export type AuthenticatedUser = {
  id: number;
  role: Role;
};
