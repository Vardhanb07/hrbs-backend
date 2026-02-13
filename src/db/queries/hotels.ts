import { hotels, type NewHotel } from "@/src/db/schema/schema";
import { db } from "@/src/db/index";
import { eq } from "drizzle-orm";

export async function insertHotel(hotel: NewHotel) {
  return await db
    .insert(hotels)
    .values(hotel)
    .onConflictDoNothing()
    .returning();
}

export async function selectHotels() {
  return await db.select().from(hotels);
}

export async function selectHotelsWithHostId(hostId: string) {
  return await db.select().from(hotels).where(eq(hotels.hostId, hostId));
}

export async function updateHotels(id: string, name: string, state: string) {
  return await db
    .update(hotels)
    .set({
      name: name,
      state: state,
    })
    .where(eq(hotels.id, id))
    .returning();
}

export async function deleteHotel(id: string) {
  return await db.delete(hotels).where(eq(hotels.id, id)).returning();
}
