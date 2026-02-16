import { Hono } from "hono";
import type { Env } from "@/src/utils/types";
import {
  selectHotels,
  selectHotelsWithHostId,
  insertHotel,
  updateHotels,
  deleteHotel,
} from "@/src/db/queries/hotels";
import * as z from "zod";
import { validator } from "hono/validator";
import { states } from "@/src/db/schema/schema";

const router = new Hono<Env>();

router.get("/", async (c) => {
  const hotels = await selectHotels();
  return c.json(hotels);
});

router.use(async (c, next) => {
  const user = c.get("user");
  if (user?.isHost) {
    await next();
  }
  return c.json({ error: "bad request" }, 400);
});

router.get("/:hostId", async (c) => {
  const hostId = c.req.param("hostId");
  const hotels = await selectHotelsWithHostId(hostId);
  return c.json(hotels);
});

router.post(
  "/",
  validator("json", (value, c) => {
    const schema = z.object({
      hostId: z.uuid(),
      name: z.string(),
      state: z.enum(states),
    });
    const parsed = schema.safeParse(value);
    console.log(parsed);
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
    const [result] = await deleteHotel(id);
    return c.json(result);
  },
);

export default router;
