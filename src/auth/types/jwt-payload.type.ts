import { Role } from '../../infrastrucure/prisma/generated/client';

export type JwtPayload = {
  sub: number;
  role: Role;
};

export type AuthenticatedUser = {
  id: number;
  role: Role;
};
