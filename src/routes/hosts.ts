import { Hono } from "hono";
import type { Env } from "@/src/utils/types";
import { auth } from "@/src/utils/auth";
import { insertHost, selectHostWithUserId } from "@/src/db/queries/hosts";
import { validator } from "hono/validator";
import * as z from "zod";

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
  return c.json({ error: "unauthorized request" }, 401);
});

router.get(
  "/:userId",
  validator("param", (value, c) => {
    const schema = z.object({
      userId: z.string(),
    });
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: "invalid params" }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { userId } = c.req.param();
    const [result] = await selectHostWithUserId(userId);
    return c.json(result);
  },
);

export default router;
