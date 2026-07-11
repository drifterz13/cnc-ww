import { rm } from 'node:fs/promises';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { testEnvironmentPath } from './helpers/test-environment.helper';

type TestGlobal = typeof globalThis & {
  postgres?: StartedPostgreSqlContainer;
};

export default async function globalTeardown(): Promise<void> {
  const postgres = (globalThis as TestGlobal).postgres;

  if (postgres) {
    await postgres.stop();
  }

  await rm(testEnvironmentPath, { force: true });
}
