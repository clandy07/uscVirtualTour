DROP TABLE "user_profiles" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_student" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;