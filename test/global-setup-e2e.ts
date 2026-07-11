import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { promisify } from 'node:util';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import {
  TestEnvironment,
  testEnvironmentPath,
} from './helpers/test-environment.helper';

const execFileAsync = promisify(execFile);

type TestGlobal = typeof globalThis & {
  postgres?: StartedPostgreSqlContainer;
};

export default async function globalSetup(): Promise<void> {
  const postgres = await new PostgreSqlContainer('postgres:18.4-alpine')
    .withDatabase('concert_wow_test')
    .withUsername('concert_wow')
    .withPassword('concert-wow-test')
    .start();
  const environment: TestEnvironment = {
    databaseUrl: postgres.getConnectionUri(),
  };

  await execFileAsync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: environment.databaseUrl,
    },
  });
  await mkdir(dirname(testEnvironmentPath), { recursive: true });
  await writeFile(testEnvironmentPath, JSON.stringify(environment));
  (globalThis as TestGlobal).postgres = postgres;
}
