import { Hono } from "hono";
import type { Env } from "@/src/utils/types";
import { auth } from "@/src/utils/auth";
import { insertHost, selectHostWithUserId } from "@/src/db/queries/hosts";

const router = new Hono<Env>();

router.post("/", async (c) => {
  const user = c.get("user") as typeof auth.$Infer.Session.user;
  if (user.isHost) {
    return c.json({ msg: "done" });
  }
  const [result] = await insertHost({
    userId: user.id,
  });
  return c.json(result);
});

router.use(async (c, next) => {
  const user = c.get("user");
  if (user?.isHost) {
    await next();
  }
  return c.json({ error: "bad request" }, 400);
});

router.get("/:userId", async (c) => {
  const { userId } = c.req.param();
  const [result] = await selectHostWithUserId(userId);
  return c.json(result);
});

export default router;
