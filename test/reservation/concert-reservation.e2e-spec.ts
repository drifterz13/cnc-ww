import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthModule } from '../../src/auth/auth.module';
import { GlobalExceptionFilter } from '../../src/common/filters/global-exception.filter';
import { hashPassword } from '../../src/common/utils/password';
import { ReservationStatus, Role } from '../../src/generated/prisma/client';
import { PrismaService } from '../../src/infrastrucure/prisma/prisma.service';
import { ReservationModule } from '../../src/reservation/reservation.module';
import { users } from '../fixtures/accounts.fixture';
import { signIn } from '../helpers/auth.helper';

describe('Concert reservation', () => {
  const password = 'Password123!';
  let app: INestApplication;
  let prisma: PrismaService;
  let passwordHash: string;
  let concertId: number;

  beforeAll(async () => {
    passwordHash = await hashPassword(password);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, ReservationModule],
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
      data: users.map((user) => ({
        email: user.email,
        passwordHash,
        role: Role.USER,
      })),
    });
    const concert = await prisma.concert.create({
      data: {
        name: 'My Concert',
        description: 'A free outdoor concert',
        totalSeats: 3,
        availableSeats: 3,
      },
    });

    concertId = concert.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('does not give a user a second reservation for the same concert', async () => {
    const user = users[0];
    const userSession = await signIn(app, user.email, user.password);

    const firstReservation = await request(app.getHttpServer())
      .post(`/concerts/${concertId}/reservations`)
      .set('Authorization', `Bearer ${userSession}`);
    const secondReservation = await request(app.getHttpServer())
      .post(`/concerts/${concertId}/reservations`)
      .set('Authorization', `Bearer ${userSession}`);

    expect(firstReservation.status).toBe(201);
    expect(firstReservation.body.status).toBe(ReservationStatus.ACTIVE);
    expect(secondReservation.status).toBe(409);
    expect(secondReservation.body.statusCode).toBe(409);
    await expect(
      prisma.reservation.count({ where: { concertId } }),
    ).resolves.toBe(1);
  });

  it('allocates only three reservations when five users reserve at once', async () => {
    const userSessions = await Promise.all(
      users.map((user) => signIn(app, user.email, user.password)),
    );
    const reservationAttempts = await Promise.all(
      userSessions.map((session) =>
        request(app.getHttpServer())
          .post(`/concerts/${concertId}/reservations`)
          .set('Authorization', `Bearer ${session}`),
      ),
    );
    const concert = await prisma.concert.findUniqueOrThrow({
      where: { id: concertId },
    });

    expect(
      reservationAttempts.filter(({ status }) => status === 201),
    ).toHaveLength(3);
    expect(
      reservationAttempts.filter(({ status }) => status === 409),
    ).toHaveLength(2);
    expect(await prisma.reservation.count({ where: { concertId } })).toBe(3);
    expect(concert.availableSeats).toBe(0);
  });
});
