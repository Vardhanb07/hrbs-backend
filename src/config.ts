import { loadEnvFile, env } from "process";

loadEnvFile();

const envOrThrow = (field: string) => {
  if (!env[field]) {
    throw new Error(`${field} is missing`);
  }
  return env[field];
};

type DBConfig = {
  url: string;
};

type APIConfig = {
  port: number;
};

export const config: {
  db: DBConfig;
  api: APIConfig;
} = {
  db: {
    url: envOrThrow("DATABASE_URL"),
  },
  api: {
    port: parseInt(envOrThrow("PORT")),
  },
};
