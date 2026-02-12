import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { config } from "@/src/config";
import { logger } from "hono/logger";
import authRoute from "@/src/routes/auth";
import hosts from "@/src/routes/hosts";
import hotels from "@/src/routes/hotels";
import { auth } from "@/src/utils/auth";
import users from "@/src/routes/users";
import type { Env } from "@/src/utils/types";
import { cors } from "hono/cors";

const app = new Hono<Env>();

app.use(
  cors({
    origin: config.cors.origin,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);
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

app.route("/api/v1/auth", authRoute);
app.route("/api/v1/users", users);
app.route("/api/v1/hosts", hosts);
app.route("/api/v1/hotels", hotels);

serve(
  {
    fetch: app.fetch,
    port: config.api.port,
  },
  (info) => {
    console.log(`Server running at http://localhost:${info.port}`);
  },
);
