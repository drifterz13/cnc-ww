import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthModule } from '../../src/auth/auth.module';
import { AuthRepo } from '../../src/auth/auth.repo';
import { ConcertRepo } from '../../src/concerts/concerts.repository';
import { GlobalExceptionFilter } from '../../src/common/filters/global-exception.filter';
import { hashPassword } from '../../src/common/utils/password';
import { ReservationStatus, Role } from '../../src/generated/prisma/client';
import { ReservationModule } from '../../src/reservation/reservation.module';
import { ReservationRepo } from '../../src/reservation/reservation.repository';
import { PrismaService } from '../../src/infrastrucure/prisma/prisma.service';
import { seededConcertgoers } from '../fixtures/accounts.fixture';
import { signIn } from '../helpers/auth.helper';

describe('Concert reservation', () => {
  const authRepo = {
    findByEmail: jest.fn(),
  };
  const reservationRepo = {
    findByUserAndConcert: jest.fn(),
    create: jest.fn(),
  };
  const concertRepo = {
    decrementAvailableSeats: jest.fn(),
  };
  const prisma = {
    runInTransaction: jest.fn(),
  };
  const concertgoers = Object.fromEntries(
    seededConcertgoers.map((concertgoer, index) => [
      concertgoer.email,
      {
        id: index + 1,
        email: concertgoer.email,
        passwordHash: '',
        role: Role.USER,
      },
    ]),
  );
  let app: INestApplication;

  beforeAll(async () => {
    await Promise.all(
      seededConcertgoers.map(async (concertgoer) => {
        concertgoers[concertgoer.email].passwordHash = await hashPassword(
          concertgoer.password,
        );
      }),
    );
    authRepo.findByEmail.mockImplementation((email: string) => {
      return concertgoers[email] ?? null;
    });
    prisma.runInTransaction.mockImplementation((work) => work());

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, ReservationModule],
    })
      .overrideProvider(AuthRepo)
      .useValue(authRepo)
      .overrideProvider(ReservationRepo)
      .useValue(reservationRepo)
      .overrideProvider(ConcertRepo)
      .useValue(concertRepo)
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

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
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('does not give a concertgoer a second reservation for the same concert', async () => {
    reservationRepo.findByUserAndConcert
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 1 });
    concertRepo.decrementAvailableSeats.mockResolvedValue({ count: 1 });
    reservationRepo.create.mockResolvedValue({
      id: 1,
      userId: 1,
      concertId: 1,
      status: ReservationStatus.ACTIVE,
      reservedAt: new Date(),
      cancelledAt: null,
    });
    const concertgoer = seededConcertgoers[0];
    const concertgoerSession = await signIn(
      app,
      concertgoer.email,
      concertgoer.password,
    );

    const firstReservation = await request(app.getHttpServer())
      .post('/concerts/1/reservations')
      .set('Authorization', `Bearer ${concertgoerSession}`);

    const secondReservation = await request(app.getHttpServer())
      .post('/concerts/1/reservations')
      .set('Authorization', `Bearer ${concertgoerSession}`);

    expect(firstReservation.status).toBe(201);
    expect(firstReservation.body.status).toBe(ReservationStatus.ACTIVE);
    expect(secondReservation.status).toBe(409);
    expect(secondReservation.body.statusCode).toBe(409);
  });

  it('gives the first three concertgoers the three remaining seats when five try at once', async () => {
    let availableSeats = 3;
    const reservedConcertgoers = new Set<number>();

    reservationRepo.findByUserAndConcert.mockImplementation(
      async (userId: number) => {
        if (reservedConcertgoers.has(userId)) {
          return { id: userId };
        }

        return null;
      },
    );
    concertRepo.decrementAvailableSeats.mockImplementation(async () => {
      if (availableSeats === 0) {
        return { count: 0 };
      }

      availableSeats -= 1;

      return { count: 1 };
    });
    reservationRepo.create.mockImplementation(
      async (userId: number, concertId: number) => {
        reservedConcertgoers.add(userId);

        return {
          id: userId,
          userId,
          concertId,
          status: ReservationStatus.ACTIVE,
          reservedAt: new Date(),
          cancelledAt: null,
        };
      },
    );

    const concertgoerSessions = await Promise.all(
      seededConcertgoers.map((concertgoer) =>
        signIn(app, concertgoer.email, concertgoer.password),
      ),
    );

    const reservationAttempts = await Promise.all(
      concertgoerSessions.map((session) =>
        request(app.getHttpServer())
          .post('/concerts/1/reservations')
          .set('Authorization', `Bearer ${session}`),
      ),
    );

    expect(reservationAttempts.at(0)?.status).toBe(201);
    expect(reservationAttempts.at(0)?.body.status).toBe(
      ReservationStatus.ACTIVE,
    );
    expect(reservationAttempts.at(1)?.status).toBe(201);
    expect(reservationAttempts.at(1)?.body.status).toBe(
      ReservationStatus.ACTIVE,
    );
    expect(reservationAttempts.at(2)?.status).toBe(201);
    expect(reservationAttempts.at(2)?.body.status).toBe(
      ReservationStatus.ACTIVE,
    );
    expect(reservationAttempts.at(3)?.status).toBe(409);
    expect(reservationAttempts.at(3)?.body.statusCode).toBe(409);
    expect(reservationAttempts.at(4)?.status).toBe(409);
    expect(reservationAttempts.at(4)?.body.statusCode).toBe(409);
    expect(availableSeats).toBe(0);
    expect(reservedConcertgoers).toEqual(new Set([1, 2, 3]));
  });
});
