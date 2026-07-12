# Concert Wow

Concert Wow is a pnpm-workspace monorepo containing a NestJS API and a Next.js web app.

## Requirements

- Node.js 24
- pnpm 11.11.0
- PostgreSQL for local API development

## Workspace layout

- `apps/api` — NestJS API, Prisma schema, and API tests
- `apps/web` — Next.js App Router web application
- `packages/typescript-config` — shared TypeScript configuration
- `packages/eslint-config` — shared ESLint flat configuration

## Install and run

```bash
docker compose up -d
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm db:migrate:deploy
pnpm dev
```

The API runs at `http://localhost:3000` and the web app at `http://localhost:3001`.
Run either application independently with `pnpm dev:api` or `pnpm dev:web`.
The web server reads `API_URL` and defaults to `http://localhost:3000`.
New users can register at `http://localhost:3001/signup`; seeded users can sign in
with the addresses in `apps/api/prisma/seed.ts` and the configured `SEED_PASSWORD`.

Docker Compose runs the local PostgreSQL service. The API and web app
run directly on the host with `pnpm dev`.

```bash
docker compose up -d
```

## Production-image integration test

Build and run the production API and web images together, including a one-shot
Prisma migration job:

```bash
JWT_SECRET=replace-with-a-long-random-value \
SEED_PASSWORD=Password123! \
docker compose -f docker-compose.prod.yml up --build
```

The web app is available at `http://localhost:3001`; the API is available at
`http://localhost:3000`. The Compose file has test database credentials only;
provide deployment-specific infrastructure and secrets outside this stack.

## Common commands

```bash
pnpm build
pnpm lint
pnpm test
pnpm test:e2e
pnpm db:gen
pnpm db:migrate
pnpm db:migrate:deploy
pnpm db:seed
```
