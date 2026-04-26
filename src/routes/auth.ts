import { Hono } from "hono";
import { auth } from "../utils/auth";

const router = new Hono();

router.on(["POST", "GET"], "/*", (c) => {
	return auth.handler(c.req.raw);
});

export default router;
