import { hosts, type NewHost } from "@/src/db/schema/schema";
import { user } from "@/src/db/schema/auth-schema";
import { db } from "@/src/db/index";
import { eq } from "drizzle-orm";

export async function insertHost(host: NewHost) {
  await db.update(user).set({ isHost: true }).where(eq(user.id, host.userId));
  return await db.insert(hosts).values(host).onConflictDoNothing().returning();
}
