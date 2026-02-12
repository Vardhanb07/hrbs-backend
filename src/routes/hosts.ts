import { Hono } from "hono";
import type { Env } from "@/src/utils/types";
import { auth } from "@/src/utils/auth";
import { insertHost } from "@/src/db/queries/hosts";

const router = new Hono<Env>();

router.use(async (c, next) => {
  const user = c.get("user");
  if (user?.isHost) {
    next();
  }
  return c.text("Bad request", 400);
});

router.post("/", async (c) => {
  const user = c.get("user") as typeof auth.$Infer.Session.user;
  const [result] = await insertHost({
    userId: user.id,
  });
  return c.json({ user: result }, 201);
});

export default router;
