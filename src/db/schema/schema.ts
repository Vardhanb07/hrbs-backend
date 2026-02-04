import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  primaryKey,
  integer,
  text,
  jsonb,
} from "drizzle-orm/pg-core";
import { user } from "@/src/db/schema/auth-schema";
import { config, type roomsType } from "@/src/config";

export const hotels = pgTable("hotels", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  name: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const rooms = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  hotel_id: uuid("hotel_id")
    .references(() => hotels.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  rooms: jsonb().$type<roomsType>().default(config.db.rooms).notNull(),
});

export const usersToHotels = pgTable(
  "users_to_hotels",
  {
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
      .notNull(),
    hotelId: uuid("hotel_id")
      .references(() => hotels.id, { onDelete: "cascade", onUpdate: "cascade" })
      .notNull(),
    roomId: integer("room_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.hotelId] })],
);
