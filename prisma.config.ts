import { defineConfig } from "prisma/config";
import { appConfig } from "./src/common/config/app.config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: appConfig.databaseUrl,
  },
});
