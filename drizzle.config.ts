import "dotenv/config";
import { defineConfig } from "drizzle-kit";
// @ts-ignore
import { config } from "./src/config";

export default defineConfig({
  out: "./src/db/migrations/",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: config.db.url,
  },
  migrations: {
    table: "__drizzle_migrations__",
    schema: "drizzle",
  },
  strict: true,
});
