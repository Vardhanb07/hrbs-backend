import { rooms, type NewRoom } from "../schema/schema";
import { db } from "../index";
import { eq, and } from "drizzle-orm";

export async function selectRoomsWithHotelId(hotelId: string) {
  return await db.select().from(rooms).where(eq(rooms.hotelId, hotelId));
}

export async function selectReversedRoomsWithHotelId(hotelId: string) {
  return await db
    .select()
    .from(rooms)
    .where(and(eq(rooms.hotelId, hotelId), eq(rooms.isReserved, true)));
}

export async function selectRooms() {
  return await db.select().from(rooms);
}

export async function selectRoomsWithId(roomId: string) {
  return await db.select().from(rooms).where(eq(rooms.id, roomId));
}

export async function insertRooms(room: NewRoom) {
  return await db.insert(rooms).values(room).onConflictDoNothing().returning();
}

export async function updateRooms(
  roomId: string,
  name: string,
  priceInInr: number,
  roomDetails?: {
    cleaningFeeInInr?: number;
    maxGuests?: number;
    checkInTime?: string;
    checkOutTime?: string;
  },
) {
  return await db
    .update(rooms)
    .set({
      name: name,
      priceInInr: priceInInr,
      ...(roomDetails?.cleaningFeeInInr !== undefined
        ? { cleaningFeeInInr: roomDetails.cleaningFeeInInr }
        : {}),
      ...(roomDetails?.maxGuests !== undefined
        ? { maxGuests: roomDetails.maxGuests }
        : {}),
      ...(roomDetails?.checkInTime !== undefined
        ? { checkInTime: roomDetails.checkInTime }
        : {}),
      ...(roomDetails?.checkOutTime !== undefined
        ? { checkOutTime: roomDetails.checkOutTime }
        : {}),
    })
    .where(eq(rooms.id, roomId))
    .returning();
}

export async function deleteRooms(id: string) {
  return await db.delete(rooms).where(eq(rooms.id, id)).returning();
}
