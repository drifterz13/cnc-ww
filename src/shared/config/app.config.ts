import 'dotenv/config';
import env from 'env-var';

export const appConfig = {
  databaseUrl: env.get('DATABASE_URL').required().asUrlString(),
  port: env.get('PORT').default('3000').asPortNumber(),
  redisUrl: env
    .get('REDIS_URL')
    .default('redis://localhost:6379')
    .asUrlString(),
  seedPassword: env.get('SEED_PASSWORD').required().asString(),
} as const;
