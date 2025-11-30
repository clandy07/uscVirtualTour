CREATE TABLE "geometries" (
	"id" serial PRIMARY KEY NOT NULL,
	"polygon" geometry(point)
);
--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "name" varchar(150) NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "geometry_id" integer;--> statement-breakpoint
ALTER TABLE "user_org_relations" ADD COLUMN "can_set_member_permissions" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "polygon_idx" ON "geometries" USING gist ("polygon");--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_geometry_id_geometries_id_fk" FOREIGN KEY ("geometry_id") REFERENCES "public"."geometries"("id") ON DELETE set null ON UPDATE no action;