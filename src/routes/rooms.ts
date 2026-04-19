import { Hono } from "hono";
import type { Env } from "../utils/types";
import * as z from "zod";
import { validator } from "hono/validator";
import {
  selectRoomsWithHotelId,
  selectRooms,
  insertRooms,
  updateRooms,
  deleteRooms,
  selectRoomsWithId,
} from "../db/queries/rooms";
import { selectBookingsWithRoomId } from "../db/queries/bookings";

const router = new Hono<Env>();

router.use(async (c, next) => {
  const user = c.get("user");
  if (user?.isHost) {
    await next();
  }
  return c.json({ error: "unauthorized request" }, 401);
});

router.get("/", async (c) => {
  const result = await selectRooms();
  return c.json(result);
});

router.get(
  "/:hotelId",
  validator("param", (value, c) => {
    const schema = z.object({
      hotelId: z.uuid(),
    });
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: "invalid params" }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { hotelId } = c.req.valid("param");
    const result = await selectRoomsWithHotelId(hotelId);
    return c.json(result);
  },
);

router.post(
  "/",
  validator("json", (value, c) => {
    const schema = z.object({
      name: z.string(),
      hotelId: z.uuid(),
      priceInInr: z.number().int().positive(),
      cleaningFeeInInr: z.number().int().nonnegative().optional(),
      maxGuests: z.number().int().positive().optional(),
      checkInTime: z.iso.time().optional(),
      checkOutTime: z.iso.time().optional(),
    });
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: "invalid body" }, 401);
    }
    return parsed.data;
  }),
  async (c) => {
    const {
      name,
      hotelId,
      priceInInr,
      cleaningFeeInInr,
      maxGuests,
      checkInTime,
      checkOutTime,
    } = c.req.valid("json");
    const [result] = await insertRooms({
      name: name,
      hotelId: hotelId,
      priceInInr: priceInInr,
      ...(cleaningFeeInInr !== undefined
        ? { cleaningFeeInInr: cleaningFeeInInr }
        : {}),
      ...(maxGuests !== undefined ? { maxGuests: maxGuests } : {}),
      ...(checkInTime !== undefined ? { checkInTime: checkInTime } : {}),
      ...(checkOutTime !== undefined ? { checkOutTime: checkOutTime } : {}),
    });
    return c.json(result);
  },
);

router.put(
  "/",
  validator("json", (value, c) => {
    const schema = z.object({
      id: z.uuid(),
      priceInInr: z.number().int().positive(),
      name: z.string(),
      cleaningFeeInInr: z.number().int().nonnegative().optional(),
      maxGuests: z.number().int().positive().optional(),
      checkInTime: z.iso.time().optional(),
      checkOutTime: z.iso.time().optional(),
    });
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: "invalid body" }, 401);
    }
    return parsed.data;
  }),
  async (c) => {
    const {
      id,
      priceInInr,
      name,
      cleaningFeeInInr,
      maxGuests,
      checkInTime,
      checkOutTime,
    } = c.req.valid("json");
    const [result] = await updateRooms(id, name, priceInInr, {
      cleaningFeeInInr,
      maxGuests,
      checkInTime,
      checkOutTime,
    });
    return c.json(result);
  },
);

router.delete(
  "/:roomId",
  validator("param", (value, c) => {
    const schema = z.object({
      roomId: z.uuid(),
    });
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: "invalid param" }, 401);
    }
    return parsed.data;
  }),
  async (c) => {
    const { roomId } = c.req.valid("param");
    const [room] = await selectRoomsWithId(roomId);
    if (!room) {
      return c.json({ error: "no room exists with provided roomId" }, 404);
    }
    const bookings = await selectBookingsWithRoomId(roomId);
    if (room.isReserved || bookings.length > 0) {
      return c.json(
        {
          error:
            "unable to delete room as it has active or historical bookings",
        },
        400,
      );
    }
    const [result] = await deleteRooms(roomId);
    return c.json(result);
  },
);

export default router;
