import { Hono } from "hono";
import type { Env } from "@/src/utils/types";
import * as z from "zod";
import { validator } from "hono/validator";
import {
  selectRoomsOfHotel,
  selectRooms,
  insertRooms,
  updateRooms,
  deleteRooms,
} from "@/src/db/queries/rooms";

const router = new Hono<Env>();

router.use(async (c, next) => {
  const user = c.get("user");
  if (user?.isHost) {
    await next();
  }
  return c.json({ error: "bad request" }, 400);
});

router.get("/", async (c) => {
  const result = await selectRooms();
  return c.json(result);
});

router.get("/:hotelId", async (c) => {
  const { hotelId } = c.req.param();
  const result = await selectRoomsOfHotel(hotelId);
  return c.json(result);
});

router.post(
  "/",
  validator("json", (value, c) => {
    const schema = z.object({
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
    const { hotelId, priceInInr } = c.req.valid("json");
    const [result] = await insertRooms({
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
  "/",
  validator("json", (value, c) => {
    const schema = z.object({
      id: z.uuid(),
    });
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: "invalid body" }, 401);
    }
    return parsed.data;
  }),
  async (c) => {
    const { id } = c.req.valid("json");
    const [result] = await deleteRooms(id);
    return c.json(result);
  },
);

export default router;
