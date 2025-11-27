ALTER TABLE "locations" ADD COLUMN "latitude" varchar(50);--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "longitude" varchar(50);--> statement-breakpoint
ALTER TABLE "buildings" ADD CONSTRAINT "building_location_unique" UNIQUE("location_id");