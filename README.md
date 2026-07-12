# Concert Wow

## Architecture

- `apps/web`: Next.js App Router frontend. Server Components fetch protected data; Server Actions call the API.
- `apps/api`: NestJS REST API organised by feature modules. JWT and role guards protect endpoints; services contain use-case logic; repositories access PostgreSQL through Prisma.
- `Testing`: Testcontainers provides isolated PostgreSQL databases for API E2E tests. Mock Service Worker (MSW) and Testing Library provide web integration tests with mocked API calls.
- `Database`: PostgreSQL, with the Prisma schema and migrations managing persistence.

## Installation

Requirements: Node.js 24, pnpm 11.11.0, and Docker.

```sh
pnpm install
cp apps/api/.env.example apps/api/.env
docker-compose up -d
pnpm --filter @concert-wow/api db:migrate:deploy
pnpm --filter @concert-wow/api db:seed
```

## Run locally

```sh
pnpm dev
```

Web: http://localhost:3001  
API: http://localhost:3000

## Run in production containers

```sh
JWT_SECRET='replace-with-a-long-random-value' \
SEED_PASSWORD='P@ssw0rd' \
docker-compose -f docker-compose.prod.yml up --build -d
```

Web: http://localhost:3001  
API: http://localhost:3000

Stop the production stack:

```sh
docker-compose -f docker-compose.prod.yml down
```

## Tests

```sh
pnpm run test:web
pnpm run test:api
```

## Login credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@concert-wow.test` | `P@ssw0rd` |
| User | `user1@concert-wow.test` | `P@ssw0rd` |

## Scaling strategy

- For millions of rows, I would first analyze slow queries and add indexes
  around the queries that need them.
- I would introduce Redis for data that does not change too often, so repeated
  read requests do not always hit the database.
- For larger datasets, such as tens of millions of rows, I would consider
  database partitioning. This lets PostgreSQL prune irrelevant partitions and
  use indexes more efficiently.
- For high-traffic search or more complex read requirements, I would introduce
  a separate read model using Elasticsearch or a similar tool. The read model
  can be indexed and shaped for the queries we need.

## Concurrency strategy

- PostgreSQL uses `READ COMMITTED` isolation level by default.
- Each reservation is handled in a database transaction.
- Seat allocation uses an atomic update with a condition such as
  `availableSeats > 0`.
- The update locks the concert row while it is in progress. Concurrent
  reservation writes for the same concert wait, then re-check the condition.
- If 1,000 users reserve the last 10 seats, only 10 updates succeed. The
  remaining requests fail without over-booking.
- The unique user-and-concert constraint also prevents duplicate reservations.

