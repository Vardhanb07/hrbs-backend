import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index";
import { config } from "../config";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    resetPasswordTokenExpiresIn: 3600,
  },
  trustedOrigins: [config.cors.origin],
  user: {
    additionalFields: {
      isHost: {
        type: "boolean",
      },
    },
  },
});
