import { defineConfig } from "prisma/config";
import { appConfig } from "./src/shared/config/app.config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: appConfig.databaseUrl,
  },
});
