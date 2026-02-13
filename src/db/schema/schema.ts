import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  primaryKey,
  pgEnum,
  index,
  integer,
} from "drizzle-orm/pg-core";
import { user } from "@/src/db/schema/auth-schema";

export const states: [string, ...string[]] = [
  "andhra_pradesh",
  "arunachal_pradesh",
  "assam",
  "bihar",
  "chhattisgarh",
  "goa",
  "gujarat",
  "haryana",
  "himachal_pradesh",
  "jharkhand",
  "karnataka",
  "kerala",
  "madhya_pradesh",
  "maharashtra",
  "manipur",
  "meghalaya",
  "mizoram",
  "nagaland",
  "odisha",
  "punjab",
  "rajasthan",
  "sikkim",
  "tamil_nadu",
  "telangana",
  "tripura",
  "uttar_pradesh",
  "uttarakhand",
  "west_bengal",
];

export const stateEnum = pgEnum("state", states);

export const usersToHotels = pgTable(
  "users_to_hotels",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    hotelId: uuid("hotel_id")
      .references(() => hotels.id)
      .notNull(),
    roomId: uuid("room_id")
      .references(() => rooms.id)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.hotelId] })],
);

export const hotels = pgTable(
  "hotels",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    state: stateEnum("state").notNull(),
    hostId: uuid("host_id")
      .references(() => hosts.id)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("hotels_hostId_idx").on(table.hostId)],
);

export const hosts = pgTable(
  "hosts",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: text("user_id")
      .references(() => user.id)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("hosts_userId_idx").on(table.userId)],
);

export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  hotelId: uuid("hotel_id")
    .references(() => hotels.id)
    .notNull(),
  priceInInr: integer("price_in_inr").notNull(),
  isReserved: boolean("is_reserved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type NewHost = typeof hosts.$inferInsert;
export type NewHotel = typeof hotels.$inferInsert;
export type NewRoom = typeof rooms.$inferInsert;
