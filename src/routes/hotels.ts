import { Hono } from "hono";
import type { Env } from "@/src/utils/types";
import {
  selectHotelsWithHostId,
  insertHotel,
  updateHotels,
  deleteHotel,
  selectLimitedHotels,
} from "@/src/db/queries/hotels";
import { selectReversedRoomsWithHotelId } from "@/src/db/queries/rooms";
import * as z from "zod";
import { validator } from "hono/validator";
import { states } from "@/src/db/schema/schema";

const router = new Hono<Env>();

router.get(
  "/",
  validator("query", (value, c) => {
    const schema = z.object({
      state: z.enum(states),
      limit: z.string(),
    });
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: "invalid query" }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { limit, state } = c.req.valid("query");
    let hotels = await selectLimitedHotels(limit);
    if (state) {
      hotels = hotels.filter((hotel) => hotel.state === state);
    }
    return c.json(hotels);
  },
);

router.use(async (c, next) => {
  const user = c.get("user");
  if (user?.isHost) {
    await next();
  }
  return c.json({ error: "unauthorized request" }, 401);
});

router.get(
  "/:hostId",
  validator("param", (value, c) => {
    const schema = z.object({
      hostId: z.uuid(),
    });
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: "invalid params" }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const hostId = c.req.param("hostId");
    const hotels = await selectHotelsWithHostId(hostId);
    return c.json(hotels);
  },
);

router.post(
  "/",
  validator("json", (value, c) => {
    const schema = z.object({
      hostId: z.uuid(),
      name: z.string(),
      state: z.enum(states),
    });
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: "invalid body" }, 401);
    }
    return parsed.data;
  }),
  async (c) => {
    const { hostId, name, state } = c.req.valid("json");
    const [result] = await insertHotel({
      hostId: hostId,
      name: name,
      state: state,
    });
    return c.json(result);
  },
);
router.put(
  "/",
  validator("json", (value, c) => {
    const schema = z.object({
      id: z.uuid(),
      name: z.string(),
      state: z.enum(states),
    });
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: "invalid body" }, 401);
    }
    return parsed.data;
  }),
  async (c) => {
    const { id, name, state } = c.req.valid("json");
    const [result] = await updateHotels(id, name, state);
    return c.json(result);
  },
);

router.delete(
  "/:hotelId",
  validator("param", (value, c) => {
    const schema = z.object({
      hotelId: z.uuid(),
    });
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: "invalid params" }, 401);
    }
    return parsed.data;
  }),
  async (c) => {
    const { hotelId } = c.req.valid("param");
    const rooms = await selectReversedRoomsWithHotelId(hotelId);
    if (rooms.length > 0) {
      return c.json({
        error: "unable to delete property as it has reversed rooms",
      });
    }
    const [result] = await deleteHotel(hotelId);
    return c.json(result);
  },
);

export default router;
