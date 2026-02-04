import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { config } from "./src/config";

export default defineConfig({
  out: "./src/db/migrations/",
  schema: "./src/db/schema",                                               
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
