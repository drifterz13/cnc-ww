import 'dotenv/config';
import env from 'env-var';

function secret(name: string, fallback: string): string {
  const value = env.get(name);

  if (process.env.NODE_ENV === 'production') {
    return value.required().asString();
  }

  return value.default(fallback).asString();
}

export const appConfig = {
  databaseUrl: env.get('DATABASE_URL').required().asUrlString(),
  port: env.get('PORT').default('3000').asPortNumber(),
  redisUrl: env
    .get('REDIS_URL')
    .default('redis://localhost:6379')
    .asUrlString(),
  seedPassword: secret('SEED_PASSWORD', 'myseedsecret'),
  jwtSecret: secret('JWT_SECRET', 'mysecret'),
  jwtExpiresInSeconds: env
    .get('JWT_EXPIRES_IN_SECONDS')
    .default('3600')
    .asIntPositive(),
} as const;
