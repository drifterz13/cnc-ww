import "dotenv/config";
import { defineConfig } from "prisma/config";

const localDatabaseUrl =
  "postgresql://wow:P%40ssw0rd@localhost:5432/concert_wow?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? localDatabaseUrl,
  },
});
