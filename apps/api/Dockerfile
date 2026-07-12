FROM node:24-alpine AS base

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.11.0 --activate

FROM base AS deps

RUN apk add --no-cache python3 make g++

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --filter @concert-wow/api... --frozen-lockfile

FROM deps AS build

ARG DATABASE_URL

ENV CI=true
ENV DATABASE_URL=${DATABASE_URL}

COPY apps/api ./apps/api
COPY packages/eslint-config ./packages/eslint-config
COPY packages/typescript-config ./packages/typescript-config

RUN ["pnpm", "--filter", "@concert-wow/api", "exec", "prisma", "generate"]
RUN ["pnpm", "--filter", "@concert-wow/api", "exec", "nest", "build"]

FROM base AS production-deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --filter @concert-wow/api... --prod --frozen-lockfile

FROM node:24-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat

COPY --from=production-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=production-deps --chown=node:node /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=production-deps --chown=node:node /app/apps/api/package.json ./apps/api/package.json
COPY --from=build --chown=node:node /app/apps/api/dist ./apps/api/dist

USER node

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["node", "dist/src/main"]
