import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ConcertsModule } from '../../src/concerts/concerts.module';
import { ConcertRepo } from '../../src/concerts/concerts.repository';

describe('Concert management', () => {
  let app: INestApplication;
  const concertRepo = {
    create: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConcertsModule],
    })
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

  it('creates a concert listing with its total seat capacity', async () => {
    concertRepo.create.mockResolvedValue({
      id: 1,
      name: 'My Concert',
      description: 'A free outdoor concert',
      totalSeats: 200,
    });

    const response = await request(app.getHttpServer())
      .post('/concerts')
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
    await request(app.getHttpServer())
      .post('/concerts')
      .send({
        description: 'A free outdoor concert',
        totalSeats: 200,
      })
      .expect(400);

    expect(concertRepo.create).not.toHaveBeenCalled();
  });
});
