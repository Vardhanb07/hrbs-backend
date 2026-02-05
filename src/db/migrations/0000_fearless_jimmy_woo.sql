CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hotels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hotel_id" uuid NOT NULL,
	"rooms" jsonb DEFAULT '{"rooms":[{"room_no":1,"user_id":null},{"room_no":2,"user_id":null},{"room_no":3,"user_id":null},{"room_no":4,"user_id":null},{"room_no":5,"user_id":null},{"room_no":6,"user_id":null},{"room_no":7,"user_id":null},{"room_no":8,"user_id":null},{"room_no":9,"user_id":null},{"room_no":10,"user_id":null},{"room_no":11,"user_id":null},{"room_no":12,"user_id":null},{"room_no":13,"user_id":null},{"room_no":14,"user_id":null},{"room_no":15,"user_id":null},{"room_no":16,"user_id":null},{"room_no":17,"user_id":null},{"room_no":18,"user_id":null},{"room_no":19,"user_id":null},{"room_no":20,"user_id":null},{"room_no":21,"user_id":null},{"room_no":22,"user_id":null},{"room_no":23,"user_id":null},{"room_no":24,"user_id":null},{"room_no":25,"user_id":null},{"room_no":26,"user_id":null},{"room_no":27,"user_id":null},{"room_no":28,"user_id":null},{"room_no":29,"user_id":null},{"room_no":30,"user_id":null},{"room_no":31,"user_id":null},{"room_no":32,"user_id":null},{"room_no":33,"user_id":null},{"room_no":34,"user_id":null},{"room_no":35,"user_id":null},{"room_no":36,"user_id":null},{"room_no":37,"user_id":null},{"room_no":38,"user_id":null},{"room_no":39,"user_id":null},{"room_no":40,"user_id":null},{"room_no":41,"user_id":null},{"room_no":42,"user_id":null},{"room_no":43,"user_id":null},{"room_no":44,"user_id":null},{"room_no":45,"user_id":null},{"room_no":46,"user_id":null},{"room_no":47,"user_id":null},{"room_no":48,"user_id":null},{"room_no":49,"user_id":null},{"room_no":50,"user_id":null},{"room_no":51,"user_id":null},{"room_no":52,"user_id":null},{"room_no":53,"user_id":null},{"room_no":54,"user_id":null},{"room_no":55,"user_id":null},{"room_no":56,"user_id":null},{"room_no":57,"user_id":null},{"room_no":58,"user_id":null},{"room_no":59,"user_id":null},{"room_no":60,"user_id":null},{"room_no":61,"user_id":null},{"room_no":62,"user_id":null},{"room_no":63,"user_id":null},{"room_no":64,"user_id":null},{"room_no":65,"user_id":null},{"room_no":66,"user_id":null},{"room_no":67,"user_id":null},{"room_no":68,"user_id":null},{"room_no":69,"user_id":null},{"room_no":70,"user_id":null},{"room_no":71,"user_id":null},{"room_no":72,"user_id":null},{"room_no":73,"user_id":null},{"room_no":74,"user_id":null},{"room_no":75,"user_id":null},{"room_no":76,"user_id":null},{"room_no":77,"user_id":null},{"room_no":78,"user_id":null},{"room_no":79,"user_id":null},{"room_no":80,"user_id":null},{"room_no":81,"user_id":null},{"room_no":82,"user_id":null},{"room_no":83,"user_id":null},{"room_no":84,"user_id":null},{"room_no":85,"user_id":null},{"room_no":86,"user_id":null},{"room_no":87,"user_id":null},{"room_no":88,"user_id":null},{"room_no":89,"user_id":null},{"room_no":90,"user_id":null},{"room_no":91,"user_id":null},{"room_no":92,"user_id":null},{"room_no":93,"user_id":null},{"room_no":94,"user_id":null},{"room_no":95,"user_id":null},{"room_no":96,"user_id":null},{"room_no":97,"user_id":null},{"room_no":98,"user_id":null},{"room_no":99,"user_id":null},{"room_no":100,"user_id":null}]}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_to_hotels" (
	"user_id" text NOT NULL,
	"hotel_id" uuid NOT NULL,
	"room_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_to_hotels_user_id_hotel_id_pk" PRIMARY KEY("user_id","hotel_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users_to_hotels" ADD CONSTRAINT "users_to_hotels_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users_to_hotels" ADD CONSTRAINT "users_to_hotels_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");