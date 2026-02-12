import { Hono } from "hono";
import type { Env } from "@/src/utils/types";

const router = new Hono<Env>();

export default router;
