import { Hono } from "hono";
import type { Env } from "@/src/utils/types";
import { auth } from "@/src/utils/auth";
import { insertHost } from "@/src/db/queries/hosts";

const router = new Hono<Env>();

router.get("/", async (c) => {
  const user = c.get("user") as typeof auth.$Infer.Session.user;
  const [result] = await insertHost({
    userId: user.id,
  });
  return c.json(result);
});

export default router;
