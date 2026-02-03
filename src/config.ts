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

export const config: {
  db: DBConfig;
} = {
  db: {
    url: envOrThrow("DATABASE_URL"),
  },
};
