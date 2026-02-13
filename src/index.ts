import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { config } from "@/src/config";
import { logger } from "hono/logger";
import { auth } from "@/src/utils/auth";
import type { Env } from "@/src/utils/types";
import { cors } from "hono/cors";
import { swaggerUI } from "@hono/swagger-ui";
import authRoute from "@/src/routes/auth";
import hosts from "@/src/routes/hosts";
import hotels from "@/src/routes/hotels";
import rooms from "@/src/routes/rooms";

const app = new Hono<Env>();

const openApiDoc = {
  openapi: "3.0.0",
  info: {
    title: "API Documentation",
    version: "1.0.0",
    description: "API documentation for hrbs",
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
    },
  },
};

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
  return c.redirect("/api/v1/auth");
});
app.get("/doc", (c) => c.json(openApiDoc));
app.get("/ui", swaggerUI({ url: "/doc" }));
app.get("/health", (c) => c.text("OK"));

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
app.route("/api/v1/hosts", hosts);
app.route("/api/v1/hotels", hotels);
app.route("/api/v1/rooms", rooms);

serve(
  {
    fetch: app.fetch,
    port: config.api.port,
  },
  (info) => {
    console.log(`Server running at http://localhost:${info.port}`);
  },
);
