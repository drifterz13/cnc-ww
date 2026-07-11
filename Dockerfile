FROM node:24-alpine AS base

WORKDIR /app

ENV COREPACK_HOME=/pnpm

RUN corepack enable && corepack prepare pnpm@11.11.0 --activate && chown -R node:node /pnpm

FROM base AS dependencies

RUN apk add --no-cache python3 make g++

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json

RUN pnpm install --frozen-lockfile && chown -R node:node /app

FROM dependencies AS development

COPY --chown=node:node . .

USER node

CMD ["sh", "-c", "pnpm db:gen && pnpm --filter @concert-wow/api exec prisma migrate deploy && pnpm dev:api"]

FROM dependencies AS build

ARG DATABASE_URL

COPY --chown=node:node . .

USER node

RUN DATABASE_URL="$DATABASE_URL" CI=true pnpm db:gen && pnpm --filter @concert-wow/api build

FROM node:24-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build --chown=node:node /app/apps/api/package.json ./apps/api/package.json
COPY --from=build --chown=node:node /app/apps/api/dist ./apps/api/dist

USER node

WORKDIR /app/apps/api

CMD ["node", "dist/src/main"]
