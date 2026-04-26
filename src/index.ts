import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { config } from "./config";
import authRoute from "./routes/auth";
import bookings from "./routes/bookings";
import hosts from "./routes/hosts";
import hotels from "./routes/hotels";
import rooms from "./routes/rooms";
import { auth } from "./utils/auth";
import type { Env } from "./utils/types";

const app = new Hono<Env>();

app.use(
	cors({
		origin: config.cors.origin,
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS", "DELETE", "PUT", "PATCH"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);
app.use(logger());
app.get("/", (c) => {
	return c.redirect("/api/v1/auth");
});
app.get("/health", (c) => c.text("OK"));

app.use("*", async (c, next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	if (session) {
		c.set("user", session.user);
		c.set("session", session.session);
		await next();
		return;
	}

	c.set("user", null);
	c.set("session", null);
	await next();
});

app.route("/api/auth", authRoute);
app.route("/api/v1/hosts", hosts);
app.route("/api/v1/hotels", hotels);
app.route("/api/v1/rooms", rooms);
app.route("/api/v1/bookings", bookings);

serve(
	{
		fetch: app.fetch,
		port: config.api.port,
	},
	(info) => {
		console.log(`Server running at http://localhost:${info.port}`);
	},
);
