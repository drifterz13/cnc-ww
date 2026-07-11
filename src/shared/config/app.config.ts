import { get } from 'env-var';

export const appConfig = {
  port: get('PORT').default('3000').asPortNumber(),
  redisUrl: get('REDIS_URL').default('redis://localhost:6379').asUrlString(),
} as const;
