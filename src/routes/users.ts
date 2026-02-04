import { Hono } from "hono";
import { auth } from "@/src/utils/auth";
import type { Env } from "@/src/utils/types";

const router = new Hono<Env>();

router.get("/", (c) => {
  const user = c.get("user");
  if (!user) return c.body(null, 401);
  return c.json({ message: "in-progress" });
});

router.get("/:hotelId", (c) => {
  const user = c.get("user");
  if (!user) return c.body(null, 401);
  const { hotelId } = c.req.param();
  return c.json({ message: "in-progress" });
});

router.post("/:hotelId", (c) => {
  const user = c.get("user");
  if (!user) return c.body(null, 401);
  const { hotelId } = c.req.param();
  c.status(201);
  return c.json({ message: "in-progress" });
});

export default router;
