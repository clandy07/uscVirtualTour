ALTER TABLE "buildings" ADD COLUMN "total_rooms" smallint;--> statement-breakpoint
ALTER TABLE "buildings" ADD COLUMN "facilities" jsonb;--> statement-breakpoint
ALTER TABLE "buildings" ADD COLUMN "accessibility_features" jsonb;--> statement-breakpoint
ALTER TABLE "buildings" ADD COLUMN "fun_facts" jsonb;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "operating_hours" text;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "contact_number" varchar(50);--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "website_url" text;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "images" jsonb;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "amenities" jsonb;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "tags" jsonb;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "updated_at" timestamp with time zone;