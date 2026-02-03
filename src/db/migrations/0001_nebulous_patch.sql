ALTER TABLE "users_to_hotels" DROP CONSTRAINT "users_to_hotels_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users_to_hotels" DROP CONSTRAINT "users_to_hotels_hotel_id_hotels_id_fk";
--> statement-breakpoint
ALTER TABLE "users_to_hotels" ADD CONSTRAINT "users_to_hotels_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users_to_hotels" ADD CONSTRAINT "users_to_hotels_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE cascade;