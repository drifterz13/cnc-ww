import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthModule } from '../../src/auth/auth.module';
import { AuthRepo } from '../../src/auth/auth.repo';
import { ConcertRepo } from '../../src/concerts/concerts.repository';
import { hashPassword } from '../../src/common/utils/password';
import { DiscoveryModule } from '../../src/discovery/discovery.module';
import { Role } from '../../src/generated/prisma/client';
import { accounts } from '../fixtures/accounts.fixture';
import { signInAsAdmin, signInAsUser } from '../helpers/auth.helper';

describe('Concert discovery', () => {
  const authRepo = {
    findByEmail: jest.fn(),
  };
  const concertRepo = {
    findAll: jest.fn(),
  };
  const accountsByEmail = {
    [accounts.admin.email]: {
      id: 1,
      email: accounts.admin.email,
      passwordHash: '',
      role: Role.ADMIN,
    },
    [accounts.user.email]: {
      id: 2,
      email: accounts.user.email,
      passwordHash: '',
      role: Role.USER,
    },
  };
  let app: INestApplication;

  beforeAll(async () => {
    accountsByEmail[accounts.admin.email].passwordHash = await hashPassword(
      accounts.admin.password,
    );
    accountsByEmail[accounts.user.email].passwordHash = await hashPassword(
      accounts.user.password,
    );
    authRepo.findByEmail.mockImplementation((email: string) => {
      return accountsByEmail[email] ?? null;
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, DiscoveryModule],
    })
      .overrideProvider(AuthRepo)
      .useValue(authRepo)
      .overrideProvider(ConcertRepo)
      .useValue(concertRepo)
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows a signed-in user to discover available and fully booked concerts', async () => {
    const userSession = await signInAsUser(app);
    concertRepo.findAll.mockResolvedValue([
      {
        id: 2,
        name: 'Sold Out Concert',
        description: 'All free tickets are reserved',
        totalSeats: 3,
        availableSeats: 0,
        createdAt: new Date('2026-07-12T00:00:00.000Z'),
      },
      {
        id: 1,
        name: 'My Concert',
        description: 'Free tickets are available',
        totalSeats: 3,
        availableSeats: 2,
        createdAt: new Date('2026-07-11T00:00:00.000Z'),
      },
    ]);

    const response = await request(app.getHttpServer())
      .get('/concerts')
      .set('Authorization', `Bearer ${userSession}`)
      .expect(200);

    expect(response.body).toEqual([
      {
        id: 2,
        name: 'Sold Out Concert',
        description: 'All free tickets are reserved',
        totalSeats: 3,
        availableSeats: 0,
        createdAt: '2026-07-12T00:00:00.000Z',
      },
      {
        id: 1,
        name: 'My Concert',
        description: 'Free tickets are available',
        totalSeats: 3,
        availableSeats: 2,
        createdAt: '2026-07-11T00:00:00.000Z',
      },
    ]);
  });

  it('requires a user to sign in before discovering concerts', async () => {
    await request(app.getHttpServer()).get('/concerts').expect(401);

    expect(concertRepo.findAll).not.toHaveBeenCalled();
  });

  it('does not allow an admin to discover concerts as a user', async () => {
    const adminSession = await signInAsAdmin(app);

    await request(app.getHttpServer())
      .get('/concerts')
      .set('Authorization', `Bearer ${adminSession}`)
      .expect(403);

    expect(concertRepo.findAll).not.toHaveBeenCalled();
  });
});
