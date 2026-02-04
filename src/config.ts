import { loadEnvFile, env } from "process";

loadEnvFile();

const envOrThrow = (field: string) => {
  if (!env[field]) {
    throw new Error(`${field} is missing`);
  }
  return env[field];
};

export type roomsType = {
  rooms: {
    room_no: number;
    user_id: string | null;
  }[];
};

const rooms: roomsType = {
  rooms: [],
};

for (let i = 1; i <= 100; i++) {
  rooms.rooms.push({
    room_no: i,
    user_id: null,
  });
}

type DBConfig = {
  url: string;
  rooms: roomsType;
};

type APIConfig = {
  port: number;
};

type CORSConfig = {
  origin: string
}

export const config: {
  db: DBConfig;
  api: APIConfig;
  cors: CORSConfig
} = {
  db: {
    url: envOrThrow("DATABASE_URL"),
    rooms: rooms
  },
  api: {
    port: parseInt(envOrThrow("PORT")),
  },
  cors: {
    origin: envOrThrow("ORIGIN")
  }
};
