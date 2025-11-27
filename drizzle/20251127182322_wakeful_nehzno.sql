ALTER TABLE "locations" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."category";--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('buildings', 'food', 'facilities', 'transport_parking', 'study_areas', 'dorms_residences', 'sports_recreation');--> statement-breakpoint
ALTER TABLE "locations" ALTER COLUMN "category" SET DATA TYPE "public"."category" USING "category"::"public"."category";