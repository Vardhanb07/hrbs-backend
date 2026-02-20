ALTER TABLE "rooms" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users_to_hotels" ADD COLUMN "check_in" date;--> statement-breakpoint
ALTER TABLE "users_to_hotels" ADD COLUMN "check_out" date;