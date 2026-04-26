import { eq } from "drizzle-orm";
import { db } from "../index";
import { user } from "../schema/auth-schema";
import { hosts, type NewHost } from "../schema/schema";

export async function insertHost(host: NewHost) {
	await db.update(user).set({ isHost: true }).where(eq(user.id, host.userId));
	return await db.insert(hosts).values(host).onConflictDoNothing().returning();
}

export async function selectHostWithUserId(userId: string) {
	return await db.select().from(hosts).where(eq(hosts.userId, userId));
}
