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
  date,
  time,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { relations } from "drizzle-orm";

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

export const bookingStatuses: [string, ...string[]] = [
  "pending",
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
];

export const bookingStatusEnum = pgEnum("booking_status", bookingStatuses);

export const paymentStatuses: [string, ...string[]] = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

export const paymentStatusEnum = pgEnum("payment_status", paymentStatuses);

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
    checkIn: date("check_in"),
    checkOut: date("check_out"),
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

export const hostsRelations = relations(user, ({ one }) => ({
  hosts: one(user),
}));

export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  name: text("name").notNull(),
  hotelId: uuid("hotel_id")
    .references(() => hotels.id)
    .notNull(),
  priceInInr: integer("price_in_inr").notNull(),
  cleaningFeeInInr: integer("cleaning_fee_in_inr").notNull().default(0),
  maxGuests: integer("max_guests").notNull().default(2),
  checkInTime: time("check_in_time").notNull().default("15:00:00"),
  checkOutTime: time("check_out_time").notNull().default("11:00:00"),
  isReserved: boolean("is_reserved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: text("user_id")
      .references(() => user.id)
      .notNull(),
    hotelId: uuid("hotel_id")
      .references(() => hotels.id)
      .notNull(),
    roomId: uuid("room_id")
      .references(() => rooms.id)
      .notNull(),
    checkInDate: date("check_in_date").notNull(),
    checkOutDate: date("check_out_date").notNull(),
    checkInTime: time("check_in_time").notNull(),
    checkOutTime: time("check_out_time").notNull(),
    guests: integer("guests").notNull().default(1),
    nightlyPriceInInr: integer("nightly_price_in_inr").notNull(),
    cleaningFeeInInr: integer("cleaning_fee_in_inr").notNull().default(0),
    totalPriceInInr: integer("total_price_in_inr").notNull(),
    status: bookingStatusEnum("status").notNull().default("confirmed"),
    actualCheckInAt: timestamp("actual_check_in_at"),
    actualCheckOutAt: timestamp("actual_check_out_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("bookings_roomId_idx").on(table.roomId),
    index("bookings_userId_idx").on(table.userId),
    index("bookings_hotelId_idx").on(table.hotelId),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    bookingId: uuid("booking_id")
      .references(() => bookings.id)
      .notNull()
      .unique(),
    userId: text("user_id")
      .references(() => user.id)
      .notNull(),
    amountInInr: integer("amount_in_inr").notNull(),
    status: paymentStatusEnum("status").notNull().default("pending"),
    provider: text("provider"),
    transactionRef: text("transaction_ref").unique(),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("payments_bookingId_idx").on(table.bookingId),
    index("payments_userId_idx").on(table.userId),
  ],
);

export type NewHost = typeof hosts.$inferInsert;
export type NewHotel = typeof hotels.$inferInsert;
export type NewRoom = typeof rooms.$inferInsert;
export type NewBooking = typeof bookings.$inferInsert;
export type NewPayment = typeof payments.$inferInsert;
