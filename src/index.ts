import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { config } from "@/src/config";
import { logger } from "hono/logger";
import authRoute from "@/src/routes/auth";
import { auth } from "@/src/utils/auth";
import users from "@/src/routes/users";
import type { Env } from "@/src/utils/types";

const app = new Hono<Env>();

app.use(logger());
app.get("/", (c) => {
  return c.json({ message: "in-progress" });
});

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    c.set("user", null);
    c.set("session", null);
    await next();
    return;
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

app.route("/api/auth", authRoute);
app.route("/api/users", users);

serve(
  {
    fetch: app.fetch,
    port: config.api.port,
  },
  (info) => {
    console.log(`Server running at http://localhost:${info.port}`);
  },
);
