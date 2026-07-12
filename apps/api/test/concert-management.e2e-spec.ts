import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { AuthRepo } from '../src/auth/auth.repo';
import { ConcertsModule } from '../src/concerts/concerts.module';
import { ConcertRepo } from '../src/concerts/concerts.repository';
import { Role } from '../src/infrastrucure/prisma/generated/client';
import { hashPassword } from '../src/common/utils/password';
import { accounts } from './fixtures/accounts.fixture';
import { signInAsAdmin, signInAsUser } from './helpers/auth.helper';

describe('Concert management', () => {
  const concertRepo = {
    create: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn().mockResolvedValue({ id: 1 }),
    hasReservationHistory: jest.fn().mockResolvedValue(false),
  };
  const authRepo = {
    findByEmail: jest.fn(),
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
      imports: [AuthModule, ConcertsModule],
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

  it('allows an admin to sign in', async () => {
    await expect(signInAsAdmin(app)).resolves.toEqual(expect.any(String));
  });

  it('does not sign in an account with incorrect credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: accounts.admin.email,
        password: 'InvalidPassword123!',
      })
      .expect(401);
  });

  it('requires a signed-in admin to manage concert listings', async () => {
    await request(app.getHttpServer()).get('/concerts/manage').expect(401);

    await request(app.getHttpServer())
      .post('/concerts')
      .send({
        name: 'My Concert',
        description: 'A free outdoor concert',
        totalSeats: 200,
      })
      .expect(401);

    expect(concertRepo.create).not.toHaveBeenCalled();
  });

  it('allows an admin to view concert listings', async () => {
    const adminSession = await signInAsAdmin(app);
    concertRepo.findAll.mockResolvedValue([
      {
        id: 1,
        name: 'My Concert',
        description: 'A free outdoor concert',
        totalSeats: 200,
        availableSeats: 200,
      },
    ]);

    const response = await request(app.getHttpServer())
      .get('/concerts/manage')
      .set('Authorization', `Bearer ${adminSession}`)
      .expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({ id: 1, name: 'My Concert' }),
    ]);
    expect(concertRepo.findAll).toHaveBeenCalledTimes(1);
  });

  it('prevents a user from viewing admin concert listings', async () => {
    const userSession = await signInAsUser(app);

    await request(app.getHttpServer())
      .get('/concerts/manage')
      .set('Authorization', `Bearer ${userSession}`)
      .expect(403);

    expect(concertRepo.findAll).not.toHaveBeenCalled();
  });

  it('allows an admin to create a concert listing with its total seat capacity', async () => {
    const adminSession = await signInAsAdmin(app);
    concertRepo.create.mockResolvedValue({
      id: 1,
      name: 'My Concert',
      description: 'A free outdoor concert',
      totalSeats: 200,
    });

    const response = await request(app.getHttpServer())
      .post('/concerts')
      .set('Authorization', `Bearer ${adminSession}`)
      .send({
        name: ' My Concert ',
        description: ' A free outdoor concert ',
        totalSeats: 200,
      })
      .expect(201);

    expect(response.body).toEqual({
      id: 1,
      name: 'My Concert',
      description: 'A free outdoor concert',
      totalSeats: 200,
    });
    expect(concertRepo.create).toHaveBeenCalledWith({
      name: 'My Concert',
      description: 'A free outdoor concert',
      totalSeats: 200,
    });
  });

  it('rejects a concert listing without a concert name', async () => {
    const adminSession = await signInAsAdmin(app);

    await request(app.getHttpServer())
      .post('/concerts')
      .set('Authorization', `Bearer ${adminSession}`)
      .send({
        description: 'A free outdoor concert',
        totalSeats: 200,
      })
      .expect(400);

    expect(concertRepo.create).not.toHaveBeenCalled();
  });

  it('prevents a user from creating a concert listing', async () => {
    const userSession = await signInAsUser(app);

    await request(app.getHttpServer())
      .post('/concerts')
      .set('Authorization', `Bearer ${userSession}`)
      .send({
        name: 'My Concert',
        description: 'A free outdoor concert',
        totalSeats: 200,
      })
      .expect(403);

    expect(concertRepo.create).not.toHaveBeenCalled();
  });

  it('allows an admin to remove a concert listing', async () => {
    const adminSession = await signInAsAdmin(app);
    concertRepo.delete.mockResolvedValue({ id: 1 });

    await request(app.getHttpServer())
      .delete('/concerts/1')
      .set('Authorization', `Bearer ${adminSession}`)
      .expect(204);

    expect(concertRepo.delete).toHaveBeenCalledWith(1);
    expect(concertRepo.findById).toHaveBeenCalledWith(1);
    expect(concertRepo.hasReservationHistory).toHaveBeenCalledWith(1);
  });

  it('prevents a user from removing a concert listing', async () => {
    const userSession = await signInAsUser(app);

    await request(app.getHttpServer())
      .delete('/concerts/1')
      .set('Authorization', `Bearer ${userSession}`)
      .expect(403);

    expect(concertRepo.delete).not.toHaveBeenCalled();
  });
});
