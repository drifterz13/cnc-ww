import 'dotenv/config';
import { readFileSync } from 'node:fs';
import {
  TestEnvironment,
  testEnvironmentPath,
} from './helpers/test-environment.helper';

const environment = JSON.parse(
  readFileSync(testEnvironmentPath, 'utf8'),
) as TestEnvironment;

process.env.DATABASE_URL = environment.databaseUrl;
