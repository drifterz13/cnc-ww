import { resolve } from 'node:path';

export type TestEnvironment = {
  databaseUrl: string;
};

export const testEnvironmentPath = resolve(
  process.cwd(),
  'test/.runtime/environment.json',
);
