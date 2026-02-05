import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "@/src/config";
import * as schema from "@/src/db/schema/db-schema";

const conn = postgres(config.db.url);
export const db = drizzle(conn, { schema,  });
