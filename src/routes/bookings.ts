import { Hono } from "hono";
import type { Env } from "../utils/types";
import * as z from "zod";
import { validator } from "hono/validator";
import { db } from "../db/index";
import { bookings, payments, rooms } from "../db/schema/schema";
import { and, eq, gt, lt, ne } from "drizzle-orm";
import { selectBookingsWithUserId } from "../db/queries/bookings";

const router = new Hono<Env>();

router.use("*", async (c, next) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "unauthorized request" }, 401);
  }

  await next();
});

const staySchema = z.object({
  roomId: z.uuid(),
  checkInDate: z.iso.date(),
  checkOutDate: z.iso.date(),
  guests: z.number().int().positive().optional(),
});

const parseDay = (value: string) => new Date(`${value}T00:00:00.000Z`);

const calculateNights = (checkInDate: string, checkOutDate: string) => {
  const checkIn = parseDay(checkInDate).getTime();
  const checkOut = parseDay(checkOutDate).getTime();
  return Math.ceil((checkOut - checkIn) / 86_400_000);
};

router.get("/me", async (c) => {
  const user = c.get("user");
  const result = await selectBookingsWithUserId(user!.id);
  return c.json(result);
});

router.get(
  "/availability",
  validator("query", (value, c) => {
    const schema = staySchema.pick({
      roomId: true,
      checkInDate: true,
      checkOutDate: true,
    });
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: "invalid query" }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { roomId, checkInDate, checkOutDate } = c.req.valid("query");
    const conflicts = await db
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

    return c.json({
      available: conflicts.length === 0,
    });
  },
);

router.post(
  "/",
  validator("json", (value, c) => {
    const parsed = staySchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: "invalid body" }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const user = c.get("user");
    const {
      roomId,
      checkInDate,
      checkOutDate,
      guests = 1,
    } = c.req.valid("json");

    if (calculateNights(checkInDate, checkOutDate) <= 0) {
      return c.json({ error: "checkOutDate must be after checkInDate" }, 400);
    }

    const result = await db.transaction(async (tx) => {
      const [room] = await tx.select().from(rooms).where(eq(rooms.id, roomId));

      if (!room) {
        return c.json({ error: "room not found" }, 404);
      }

      if (guests > room.maxGuests) {
        return c.json({ error: "guest count exceeds room capacity" }, 400);
      }

      const conflicts = await tx
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

      if (conflicts.length > 0) {
        return c.json(
          { error: "room is already booked for the selected dates" },
          409,
        );
      }

      const nights = calculateNights(checkInDate, checkOutDate);
      const totalPriceInInr = nights * room.priceInInr + room.cleaningFeeInInr;

      const [booking] = await tx
        .insert(bookings)
        .values({
          userId: user!.id,
          hotelId: room.hotelId,
          roomId,
          checkInDate,
          checkOutDate,
          checkInTime: room.checkInTime,
          checkOutTime: room.checkOutTime,
          guests,
          nightlyPriceInInr: room.priceInInr,
          cleaningFeeInInr: room.cleaningFeeInInr,
          totalPriceInInr,
          status: "confirmed",
        })
        .returning();

      if (!booking) {
        return c.json({ error: "unable to create booking" }, 500);
      }

      const [payment] = await tx
        .insert(payments)
        .values({
          bookingId: booking.id,
          userId: user!.id,
          amountInInr: totalPriceInInr,
          status: "paid",
          provider: "manual",
          paidAt: new Date(),
        })
        .returning();

      return c.json({ booking, payment }, 201);
    });

    return result;
  },
);

router.patch(
  "/:bookingId/check-in",
  validator("param", (value, c) => {
    const schema = z.object({ bookingId: z.uuid() });
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: "invalid params" }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const user = c.get("user");
    const { bookingId } = c.req.valid("param");

    const result = await db.transaction(async (tx) => {
      const [booking] = await tx
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId));

      if (!booking) {
        return c.json({ error: "booking not found" }, 404);
      }

      if (booking.userId !== user!.id) {
        return c.json({ error: "unauthorized request" }, 401);
      }

      if (booking.status !== "confirmed") {
        return c.json({ error: "booking cannot be checked in" }, 400);
      }

      const [updatedBooking] = await tx
        .update(bookings)
        .set({
          status: "checked_in",
          actualCheckInAt: new Date(),
        })
        .where(eq(bookings.id, bookingId))
        .returning();

      await tx
        .update(rooms)
        .set({ isReserved: true })
        .where(eq(rooms.id, booking.roomId));

      return c.json(updatedBooking);
    });

    return result;
  },
);

router.patch(
  "/:bookingId/check-out",
  validator("param", (value, c) => {
    const schema = z.object({ bookingId: z.uuid() });
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: "invalid params" }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const user = c.get("user");
    const { bookingId } = c.req.valid("param");

    const result = await db.transaction(async (tx) => {
      const [booking] = await tx
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId));

      if (!booking) {
        return c.json({ error: "booking not found" }, 404);
      }

      if (booking.userId !== user!.id) {
        return c.json({ error: "unauthorized request" }, 401);
      }

      if (booking.status !== "checked_in") {
        return c.json({ error: "booking cannot be checked out" }, 400);
      }

      const [updatedBooking] = await tx
        .update(bookings)
        .set({
          status: "checked_out",
          actualCheckOutAt: new Date(),
        })
        .where(eq(bookings.id, bookingId))
        .returning();

      await tx
        .update(rooms)
        .set({ isReserved: false })
        .where(eq(rooms.id, booking.roomId));

      return c.json(updatedBooking);
    });

    return result;
  },
);

router.patch(
  "/:bookingId/cancel",
  validator("param", (value, c) => {
    const schema = z.object({ bookingId: z.uuid() });
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: "invalid params" }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const user = c.get("user");
    const { bookingId } = c.req.valid("param");

    const result = await db.transaction(async (tx) => {
      const [booking] = await tx
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId));

      if (!booking) {
        return c.json({ error: "booking not found" }, 404);
      }

      if (booking.userId !== user!.id) {
        return c.json({ error: "unauthorized request" }, 401);
      }

      if (booking.status === "cancelled" || booking.status === "checked_out") {
        return c.json({ error: "booking cannot be cancelled" }, 400);
      }

      const [updatedBooking] = await tx
        .update(bookings)
        .set({ status: "cancelled" })
        .where(eq(bookings.id, bookingId))
        .returning();

      if (booking.status === "checked_in") {
        await tx
          .update(rooms)
          .set({ isReserved: false })
          .where(eq(rooms.id, booking.roomId));
      }

      return c.json(updatedBooking);
    });

    return result;
  },
);

export default router;
