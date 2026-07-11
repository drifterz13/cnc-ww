FROM node:24-alpine AS base

WORKDIR /app

ENV COREPACK_HOME=/pnpm
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare pnpm@11.11.0 --activate && chown -R node:node /pnpm

FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json

RUN pnpm install --frozen-lockfile && chown -R node:node /app

FROM dependencies AS development

COPY --chown=node:node . .

USER node

WORKDIR /app/apps/web

CMD ["pnpm", "exec", "next", "dev", "--hostname", "0.0.0.0", "--port", "3001"]

FROM dependencies AS build

COPY --chown=node:node . .

USER node

RUN pnpm --filter @concert-wow/web build

FROM node:24-alpine AS production

WORKDIR /app

ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001

COPY --from=build --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static

USER node

CMD ["node", "apps/web/server.js"]
