import { hotels, type NewHotel } from "@/src/db/schema/schema";
import { db } from "@/src/db/index";

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