import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { hashPassword } from '../src/common/utils/password';
import {
  ReservationStatus,
  Role,
} from '../src/infrastrucure/prisma/generated/client';
import { PrismaService } from '../src/infrastrucure/prisma/prisma.service';
import { ReservationModule } from '../src/reservation/reservation.module';
import { accounts, users } from './fixtures/accounts.fixture';
import { signIn } from './helpers/auth.helper';

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
      data: [
        {
          fullName: 'Concert Wow Admin',
          email: accounts.admin.email,
          passwordHash,
          role: Role.ADMIN,
        },
        ...users.map((user) => ({
          fullName: user.email,
          email: user.email,
          passwordHash,
          role: Role.USER,
        })),
      ],
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

  it('does not allow a user to reserve the same concert after cancellation', async () => {
    const user = users[0];
    const userSession = await signIn(app, user.email, user.password);

    await request(app.getHttpServer())
      .post(`/concerts/${concertId}/reservations`)
      .set('Authorization', `Bearer ${userSession}`)
      .expect(201);
    await request(app.getHttpServer())
      .delete(`/concerts/${concertId}/reservations`)
      .set('Authorization', `Bearer ${userSession}`)
      .expect(204);

    await request(app.getHttpServer())
      .post(`/concerts/${concertId}/reservations`)
      .set('Authorization', `Bearer ${userSession}`)
      .expect(409);

    const concert = await prisma.concert.findUniqueOrThrow({
      where: { id: concertId },
    });

    expect(concert.availableSeats).toBe(3);
  });

  it('allows a user to cancel an active reservation and restore an available ticket', async () => {
    const user = users[0];
    const userSession = await signIn(app, user.email, user.password);

    await request(app.getHttpServer())
      .post(`/concerts/${concertId}/reservations`)
      .set('Authorization', `Bearer ${userSession}`)
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/concerts/${concertId}/reservations`)
      .set('Authorization', `Bearer ${userSession}`)
      .expect(204);

    const userAccount = await prisma.user.findUniqueOrThrow({
      where: { email: user.email },
    });
    const reservation = await prisma.reservation.findUniqueOrThrow({
      where: {
        userId_concertId: {
          userId: userAccount.id,
          concertId,
        },
      },
    });
    const concert = await prisma.concert.findUniqueOrThrow({
      where: { id: concertId },
    });

    expect(reservation.status).toBe(ReservationStatus.CANCELLED);
    expect(reservation.cancelledAt).toEqual(expect.any(Date));
    expect(concert.availableSeats).toBe(3);
  });

  it('does not cancel a reservation that is already cancelled', async () => {
    const user = users[0];
    const userSession = await signIn(app, user.email, user.password);

    await request(app.getHttpServer())
      .post(`/concerts/${concertId}/reservations`)
      .set('Authorization', `Bearer ${userSession}`)
      .expect(201);
    await request(app.getHttpServer())
      .delete(`/concerts/${concertId}/reservations`)
      .set('Authorization', `Bearer ${userSession}`)
      .expect(204);

    const response = await request(app.getHttpServer())
      .delete(`/concerts/${concertId}/reservations`)
      .set('Authorization', `Bearer ${userSession}`)
      .expect(404);
    const concert = await prisma.concert.findUniqueOrThrow({
      where: { id: concertId },
    });

    expect(response.body.statusCode).toBe(404);
    expect(concert.availableSeats).toBe(3);
  });

  it('does not allow an admin to cancel a user reservation', async () => {
    const user = users[0];
    const userSession = await signIn(app, user.email, user.password);
    const adminSession = await signIn(
      app,
      accounts.admin.email,
      accounts.admin.password,
    );

    await request(app.getHttpServer())
      .post(`/concerts/${concertId}/reservations`)
      .set('Authorization', `Bearer ${userSession}`)
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/concerts/${concertId}/reservations`)
      .set('Authorization', `Bearer ${adminSession}`)
      .expect(403);

    const concert = await prisma.concert.findUniqueOrThrow({
      where: { id: concertId },
    });

    expect(concert.availableSeats).toBe(2);
  });

  it('returns not found when a user reserves a seat at a concert that does not exist', async () => {
    const user = users[0];
    const userSession = await signIn(app, user.email, user.password);

    const response = await request(app.getHttpServer())
      .post(`/concerts/${concertId + 100000}/reservations`)
      .set('Authorization', `Bearer ${userSession}`)
      .expect(404);

    expect(response.body).toMatchObject({
      statusCode: 404,
      message: 'Concert not found',
    });
  });

  it('gives a user only one reservation when they request two seats at once', async () => {
    const user = users[0];
    const userSession = await signIn(app, user.email, user.password);

    const reservationResponses = await Promise.all([
      request(app.getHttpServer())
        .post(`/concerts/${concertId}/reservations`)
        .set('Authorization', `Bearer ${userSession}`),
      request(app.getHttpServer())
        .post(`/concerts/${concertId}/reservations`)
        .set('Authorization', `Bearer ${userSession}`),
    ]);
    const concert = await prisma.concert.findUniqueOrThrow({
      where: { id: concertId },
    });

    expect(
      reservationResponses.filter(({ status }) => status === 201),
    ).toHaveLength(1);
    expect(
      reservationResponses.filter(({ status }) => status === 409),
    ).toHaveLength(1);
    expect(await prisma.reservation.count({ where: { concertId } })).toBe(1);
    expect(concert.availableSeats).toBe(2);
  });

  it('returns one seat when a user cancels the same reservation twice at once', async () => {
    const user = users[0];
    const userSession = await signIn(app, user.email, user.password);

    await request(app.getHttpServer())
      .post(`/concerts/${concertId}/reservations`)
      .set('Authorization', `Bearer ${userSession}`)
      .expect(201);

    const cancellationResponses = await Promise.all([
      request(app.getHttpServer())
        .delete(`/concerts/${concertId}/reservations`)
        .set('Authorization', `Bearer ${userSession}`),
      request(app.getHttpServer())
        .delete(`/concerts/${concertId}/reservations`)
        .set('Authorization', `Bearer ${userSession}`),
    ]);
    const concert = await prisma.concert.findUniqueOrThrow({
      where: { id: concertId },
    });

    expect(
      cancellationResponses.filter(({ status }) => status === 204),
    ).toHaveLength(1);
    expect(
      cancellationResponses.filter(({ status }) => status === 404),
    ).toHaveLength(1);
    expect(concert.availableSeats).toBe(3);
  });

  it('given three total seats, allocates only three reservations when five users reserve at once', async () => {
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
