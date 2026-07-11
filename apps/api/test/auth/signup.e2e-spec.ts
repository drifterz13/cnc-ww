import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthModule } from '../../src/auth/auth.module';
import { AuthRepo } from '../../src/auth/auth.repo';
import { verifyPassword } from '../../src/common/utils/password';
import { Role } from '../../src/infrastrucure/prisma/generated/client';

describe('Account signup', () => {
  const authRepo = {
    createUser: jest.fn(),
    findByEmail: jest.fn(),
  };
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(AuthRepo)
      .useValue(authRepo)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    authRepo.findByEmail.mockResolvedValue(null);
    authRepo.createUser.mockImplementation((data) => ({
      ...data,
      id: 3,
      role: Role.USER,
    }));
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a user with a normalized email and hashed password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        fullName: ' Concert Fan ',
        email: ' FAN@EXAMPLE.COM ',
        password: 'Password123!',
      })
      .expect(201);

    expect(response.body).toEqual({ accessToken: expect.any(String) });
    expect(authRepo.findByEmail).toHaveBeenCalledWith('fan@example.com');
    expect(authRepo.createUser).toHaveBeenCalledWith({
      fullName: 'Concert Fan',
      email: 'fan@example.com',
      passwordHash: expect.any(String),
    });

    const { passwordHash } = authRepo.createUser.mock.calls[0][0] as {
      passwordHash: string;
    };
    await expect(verifyPassword('Password123!', passwordHash)).resolves.toBe(
      true,
    );
  });

  it('rejects an email that already has an account', async () => {
    authRepo.findByEmail.mockResolvedValue({ id: 1 });

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        fullName: 'Concert Fan',
        email: 'fan@example.com',
        password: 'Password123!',
      })
      .expect(409);

    expect(authRepo.createUser).not.toHaveBeenCalled();
  });

  it('validates the required full name and password length', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        fullName: ' ',
        email: 'fan@example.com',
        password: 'short',
      })
      .expect(400);

    expect(authRepo.createUser).not.toHaveBeenCalled();
  });
});
