import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthModule } from '../../src/auth/auth.module';
import { GlobalExceptionFilter } from '../../src/common/filters/global-exception.filter';
import { hashPassword } from '../../src/common/utils/password';
import {
  ReservationStatus,
  Role,
} from '../../src/infrastrucure/prisma/generated/client';
import { HistoryModule } from '../../src/history/history.module';
import { PrismaService } from '../../src/infrastrucure/prisma/prisma.service';
import { accounts, users } from '../fixtures/accounts.fixture';
import { signIn } from '../helpers/auth.helper';

describe('Personal reservation history', () => {
  const password = 'Password123!';
  let app: INestApplication;
  let prisma: PrismaService;
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await hashPassword(password);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, HistoryModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
    await app.listen(0);
    prisma = moduleFixture.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.reservation.deleteMany();
    await prisma.concert.deleteMany();
    await prisma.user.deleteMany();
    await prisma.user.createMany({
      data: [
        {
          email: accounts.admin.email,
          passwordHash,
          role: Role.ADMIN,
        },
        ...users.map((user) => ({
          email: user.email,
          passwordHash,
          role: Role.USER,
        })),
      ],
    });
    const [user, otherUser] = await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { email: users[0].email } }),
      prisma.user.findUniqueOrThrow({ where: { email: users[1].email } }),
    ]);
    const [firstConcert, secondConcert] = await Promise.all([
      prisma.concert.create({
        data: {
          name: 'My Concert',
          description: 'A free outdoor concert',
          totalSeats: 3,
          availableSeats: 2,
        },
      }),
      prisma.concert.create({
        data: {
          name: 'Another Concert',
          description: 'A free indoor concert',
          totalSeats: 3,
          availableSeats: 2,
        },
      }),
    ]);

    await prisma.reservation.createMany({
      data: [
        {
          userId: user.id,
          concertId: firstConcert.id,
          status: ReservationStatus.CANCELLED,
          reservedAt: new Date('2026-07-11T00:00:00.000Z'),
          cancelledAt: new Date('2026-07-11T01:00:00.000Z'),
        },
        {
          userId: user.id,
          concertId: secondConcert.id,
          status: ReservationStatus.ACTIVE,
          reservedAt: new Date('2026-07-12T00:00:00.000Z'),
        },
        {
          userId: otherUser.id,
          concertId: firstConcert.id,
          status: ReservationStatus.ACTIVE,
          reservedAt: new Date('2026-07-13T00:00:00.000Z'),
        },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows a user to view only their active and cancelled reservations', async () => {
    const user = users[0];
    const userSession = await signIn(app, user.email, user.password);

    const response = await request(app.getHttpServer())
      .get('/history/reservations')
      .set('Authorization', `Bearer ${userSession}`)
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body.at(0)).toMatchObject({
      status: ReservationStatus.ACTIVE,
      reservedAt: '2026-07-12T00:00:00.000Z',
      cancelledAt: null,
      concert: {
        name: 'Another Concert',
        description: 'A free indoor concert',
      },
    });
    expect(response.body.at(1)).toMatchObject({
      status: ReservationStatus.CANCELLED,
      reservedAt: '2026-07-11T00:00:00.000Z',
      cancelledAt: '2026-07-11T01:00:00.000Z',
      concert: {
        name: 'My Concert',
        description: 'A free outdoor concert',
      },
    });
  });

  it('does not allow an admin to view personal reservation history as a user', async () => {
    const adminSession = await signIn(
      app,
      accounts.admin.email,
      accounts.admin.password,
    );

    await request(app.getHttpServer())
      .get('/history/reservations')
      .set('Authorization', `Bearer ${adminSession}`)
      .expect(403);
  });
});
