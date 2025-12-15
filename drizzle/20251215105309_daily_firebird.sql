CREATE TABLE "indoor_edges" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_node_id" text NOT NULL,
	"target_node_id" text NOT NULL,
	"cost_meters" integer NOT NULL,
	"reverse_cost_meters" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "indoor_nodes" (
	"id" text PRIMARY KEY NOT NULL,
	"building_id" integer,
	"floor_level" integer,
	"geom_point" geometry(point)
);
--> statement-breakpoint
ALTER TABLE "indoor_nodes" ADD CONSTRAINT "indoor_nodes_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE no action ON UPDATE no action;