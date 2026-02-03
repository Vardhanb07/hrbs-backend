import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { config } from "./config.js";
import { logger } from "hono/logger";
import authRoute from "./routes/auth.js";
import { auth } from "./utils/auth.js";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

app.use(logger());
app.get("/", (c) => {
  return c.text("hello from hono!");
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

const routes = [authRoute];

routes.forEach((route) => {
  app.basePath("/api").route("/", route);
});

serve(
  {
    fetch: app.fetch,
    port: config.api.port,
  },
  (info) => {
    console.log(`Server running at http://localhost:${info.port}`);
  },
);
