import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  seededAdminAccount,
  seededUserAccount,
} from '../fixtures/accounts.fixture';

async function signIn(
  app: INestApplication,
  email: string,
  password: string,
): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(201);

  return response.body.accessToken;
}

export function signInAsAdmin(app: INestApplication): Promise<string> {
  return signIn(app, seededAdminAccount.email, seededAdminAccount.password);
}

export function signInAsUser(app: INestApplication): Promise<string> {
  return signIn(app, seededUserAccount.email, seededUserAccount.password);
}
