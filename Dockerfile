FROM node:24-alpine AS base

WORKDIR /app

ENV COREPACK_HOME=/pnpm

RUN corepack enable && corepack prepare pnpm@11.11.0 --activate && chown -R node:node /pnpm

FROM base AS dependencies

RUN apk add --no-cache python3 make g++

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile && chown -R node:node /app

FROM dependencies AS development

COPY --chown=node:node . .

USER node

CMD ["sh", "-c", "pnpm db:gen && pnpm exec prisma migrate deploy && pnpm start:dev"]

FROM dependencies AS build

ARG DATABASE_URL

COPY --chown=node:node . .

USER node

RUN DATABASE_URL="$DATABASE_URL" CI=true pnpm db:gen && pnpm build && pnpm prune --prod

FROM node:24-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist

USER node

CMD ["node", "dist/src/main"]
