import { and, eq, gt, lt, ne } from "drizzle-orm";
import { db } from "../index";
import { bookings } from "../schema/schema";

export async function selectBookingsWithRoomId(roomId: string) {
  return await db.select().from(bookings).where(eq(bookings.roomId, roomId));
}

export async function selectBookingsWithHotelId(hotelId: string) {
  return await db.select().from(bookings).where(eq(bookings.hotelId, hotelId));
}

export async function selectBookingsWithUserId(userId: string) {
  return await db.select().from(bookings).where(eq(bookings.userId, userId));
}

export async function selectOverlappingBookings(
  roomId: string,
  checkInDate: string,
  checkOutDate: string,
) {
  return await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.roomId, roomId),
        ne(bookings.status, "cancelled"),
        lt(bookings.checkInDate, checkOutDate),
        gt(bookings.checkOutDate, checkInDate),
      ),
    );
}
