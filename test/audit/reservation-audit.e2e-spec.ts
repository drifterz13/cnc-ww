import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuditModule } from '../../src/audit/audit.module';
import { AuthModule } from '../../src/auth/auth.module';
import { GlobalExceptionFilter } from '../../src/common/filters/global-exception.filter';
import { hashPassword } from '../../src/common/utils/password';
import { ReservationStatus, Role } from '../../src/generated/prisma/client';
import { PrismaService } from '../../src/infrastrucure/prisma/prisma.service';
import { accounts, users } from '../fixtures/accounts.fixture';
import { signIn } from '../helpers/auth.helper';

describe('Reservation audit', () => {
  const password = 'Password123!';
  let app: INestApplication;
  let prisma: PrismaService;
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await hashPassword(password);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, AuditModule],
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
    const [firstUser, secondUser] = await Promise.all(
      users.map((user) =>
        prisma.user.findUniqueOrThrow({ where: { email: user.email } }),
      ),
    );
    const concert = await prisma.concert.create({
      data: {
        name: 'My Concert',
        description: 'A free outdoor concert',
        totalSeats: 3,
        availableSeats: 2,
      },
    });

    await prisma.reservation.createMany({
      data: [
        {
          userId: firstUser.id,
          concertId: concert.id,
          status: ReservationStatus.ACTIVE,
          reservedAt: new Date('2026-07-11T00:00:00.000Z'),
        },
        {
          userId: secondUser.id,
          concertId: concert.id,
          status: ReservationStatus.CANCELLED,
          reservedAt: new Date('2026-07-12T00:00:00.000Z'),
          cancelledAt: new Date('2026-07-12T01:00:00.000Z'),
        },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows an admin to view all active and cancelled reservations', async () => {
    const adminSession = await signIn(
      app,
      accounts.admin.email,
      accounts.admin.password,
    );

    const response = await request(app.getHttpServer())
      .get('/audit/reservations')
      .set('Authorization', `Bearer ${adminSession}`)
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body.at(0)).toMatchObject({
      status: ReservationStatus.CANCELLED,
      reservedAt: '2026-07-12T00:00:00.000Z',
      cancelledAt: '2026-07-12T01:00:00.000Z',
      user: { email: users[1].email },
      concert: { name: 'My Concert' },
    });
    expect(response.body.at(1)).toMatchObject({
      status: ReservationStatus.ACTIVE,
      reservedAt: '2026-07-11T00:00:00.000Z',
      cancelledAt: null,
      user: { email: users[0].email },
      concert: { name: 'My Concert' },
    });
  });

  it('does not allow a user to view all reservation history', async () => {
    const user = users[0];
    const userSession = await signIn(app, user.email, user.password);

    await request(app.getHttpServer())
      .get('/audit/reservations')
      .set('Authorization', `Bearer ${userSession}`)
      .expect(403);
  });
});
