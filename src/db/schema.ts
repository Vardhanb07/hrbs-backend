import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  primaryKey,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  name: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const hotels = pgTable("hotels", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  name: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const usersToHotels = pgTable(
  "users_to_hotels",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" })
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
