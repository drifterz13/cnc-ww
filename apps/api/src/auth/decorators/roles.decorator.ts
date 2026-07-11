import { SetMetadata } from '@nestjs/common';
import { Role } from '../../infrastrucure/prisma/generated/client';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export const AdminOnly = () => Roles(Role.ADMIN);

export const UserOnly = () => Roles(Role.USER);
