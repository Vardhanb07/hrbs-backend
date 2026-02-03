import { Hono } from "hono";
import { auth } from "./utils/auth.js";
import { serve } from "@hono/node-server";
import { config } from "./config.js";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.get("/", (c) => {
  return c.text("hello from hono!");
});

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

serve(
  {
    fetch: app.fetch,
    port: config.api.port,
  },
  (info) => {
    console.log(`Server running at http://localhost:${info.port}`);
  },
);
