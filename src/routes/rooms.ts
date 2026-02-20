import { Hono } from "hono";
import type { Env } from "@/src/utils/types";
import * as z from "zod";
import { validator } from "hono/validator";
import {
  selectRoomsWithHotelId,
  selectRooms,
  insertRooms,
  updateRooms,
  deleteRooms,
  selectRoomsWithId,
} from "@/src/db/queries/rooms";

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
    const { hotelId } = c.req.valid('param')
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
      priceInInr: z.number(),
    });
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: "invalid body" }, 401);
    }
    return parsed.data;
  }),
  async (c) => {
    const { name, hotelId, priceInInr } = c.req.valid("json");
    const [result] = await insertRooms({
      name: name,
      hotelId: hotelId,
      priceInInr: priceInInr,
    });
    return c.json(result);
  },
);

router.put(
  "/",
  validator("json", (value, c) => {
    const schema = z.object({
      id: z.uuid(),
      priceInInr: z.number(),
    });
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: "invalid body" }, 401);
    }
    return parsed.data;
  }),
  async (c) => {
    const { id, priceInInr } = c.req.valid("json");
    const [result] = await updateRooms(id, priceInInr);
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
    if (room.isReserved) {
      return c.json(
        { error: "unable to delete room is currently reserved" },
        400,
      );
    }
    const [result] = await deleteRooms(roomId);
    return c.json(result);
  },
);

export default router;
