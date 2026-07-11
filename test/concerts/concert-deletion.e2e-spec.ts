import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthModule } from '../../src/auth/auth.module';
import { ConcertsModule } from '../../src/concerts/concerts.module';
import { GlobalExceptionFilter } from '../../src/common/filters/global-exception.filter';
import { hashPassword } from '../../src/common/utils/password';
import { ReservationStatus, Role } from '../../src/generated/prisma/client';
import { PrismaService } from '../../src/infrastrucure/prisma/prisma.service';
import { accounts, users } from '../fixtures/accounts.fixture';
import { signIn } from '../helpers/auth.helper';

describe('Concert deletion', () => {
  const password = 'Password123!';
  let app: INestApplication;
  let prisma: PrismaService;
  let passwordHash: string;
  let concertId: number;

  beforeAll(async () => {
    passwordHash = await hashPassword(password);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, ConcertsModule],
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

  it('returns not found when an admin removes a concert that does not exist', async () => {
    const adminSession = await signIn(
      app,
      accounts.admin.email,
      accounts.admin.password,
    );

    const response = await request(app.getHttpServer())
      .delete(`/concerts/${concertId + 100000}`)
      .set('Authorization', `Bearer ${adminSession}`)
      .expect(404);

    expect(response.body).toMatchObject({
      statusCode: 404,
      message: 'Concert not found',
    });
  });

  it('does not remove a concert that has reservation history', async () => {
    const adminSession = await signIn(
      app,
      accounts.admin.email,
      accounts.admin.password,
    );
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: users[0].email },
    });

    await prisma.reservation.create({
      data: {
        userId: user.id,
        concertId,
        status: ReservationStatus.ACTIVE,
      },
    });

    const response = await request(app.getHttpServer())
      .delete(`/concerts/${concertId}`)
      .set('Authorization', `Bearer ${adminSession}`)
      .expect(409);

    expect(response.body).toMatchObject({
      statusCode: 409,
      message: 'The concert cannot be removed because it has reservation history',
    });
    await expect(
      prisma.concert.findUnique({ where: { id: concertId } }),
    ).resolves.not.toBeNull();
  });
});
