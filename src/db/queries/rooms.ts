import { rooms, type NewRoom } from "@/src/db/schema/schema";
import { db } from "@/src/db/index";
import { eq } from "drizzle-orm";

export async function selectRoomsOfHotel(hotelId: string) {
  return await db.select().from(rooms).where(eq(rooms.hotelId, hotelId));
}

export async function selectRooms() {
  return await db.select().from(rooms);
}

export async function insertRooms(room: NewRoom) {
  return await db.insert(rooms).values(room).onConflictDoNothing().returning();
}

export async function updateRooms(id: string, priceInInr: number) {
  return await db
    .update(rooms)
    .set({
      priceInInr: priceInInr,
    })
    .where(eq(rooms.id, id))
    .returning();
}

export async function deleteRooms(id: string) {
  return await db.delete(rooms).where(eq(rooms.id, id)).returning();
}
