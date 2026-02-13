import { hosts, type NewHost } from "@/src/db/schema/schema";
import { db } from "@/src/db/index";

export async function insertHost(host: NewHost) {
  return await db.insert(hosts).values(host).onConflictDoNothing().returning();
}