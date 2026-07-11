import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { accounts } from '../fixtures/accounts.fixture';

export async function signIn(
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
  return signIn(app, accounts.admin.email, accounts.admin.password);
}

export function signInAsUser(app: INestApplication): Promise<string> {
  return signIn(app, accounts.user.email, accounts.user.password);
}
