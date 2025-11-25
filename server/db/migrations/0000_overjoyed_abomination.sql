CREATE TABLE "authenticators" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"credential_id" text NOT NULL,
	"credential_public_key" text NOT NULL,
	"counter" integer NOT NULL,
	"credential_device_type" text NOT NULL,
	"credential_backed_up" boolean NOT NULL,
	"transports" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "authenticators_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text,
	"current_challenge" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "authenticators" ADD CONSTRAINT "authenticators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;