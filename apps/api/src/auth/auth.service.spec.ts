import { ConflictException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import { verifyPassword } from '../common/utils/password';
import { Role } from '../infrastrucure/prisma/generated/client';
import type { AuthRepo } from './auth.repo';
import type { AuthService } from './auth.service';

describe('AuthService', () => {
  const authRepo = {
    createUser: jest.fn(),
    findByEmail: jest.fn(),
  };
  const jwtService = {
    signAsync: jest.fn(),
  };
  let authService: AuthService;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.JWT_SECRET = 'test-secret';
    process.env.SEED_PASSWORD = 'test-password';
    const { AuthService: AuthServiceClass } = await import('./auth.service');

    authService = new AuthServiceClass(
      authRepo as unknown as AuthRepo,
      jwtService as unknown as JwtService,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a user with a password hash and returns a session', async () => {
    authRepo.findByEmail.mockResolvedValue(null);
    authRepo.createUser.mockImplementation((data) => ({
      ...data,
      id: 3,
      role: Role.USER,
    }));
    jwtService.signAsync.mockResolvedValue('signed-token');

    await expect(
      authService.signup({
        fullName: 'Concert Fan',
        email: 'fan@example.com',
        password: 'Password123!',
      }),
    ).resolves.toEqual({ accessToken: 'signed-token' });

    const createdUser = authRepo.createUser.mock.calls[0][0] as {
      passwordHash: string;
    };
    await expect(
      verifyPassword('Password123!', createdUser.passwordHash),
    ).resolves.toBe(true);
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 3,
      role: Role.USER,
    });
  });

  it('does not create a duplicate email account', async () => {
    authRepo.findByEmail.mockResolvedValue({ id: 1 });

    await expect(
      authService.signup({
        fullName: 'Concert Fan',
        email: 'fan@example.com',
        password: 'Password123!',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(authRepo.createUser).not.toHaveBeenCalled();
  });
});
