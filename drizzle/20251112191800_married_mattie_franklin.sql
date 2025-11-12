CREATE TYPE "public"."visibility" AS ENUM('everyone', 'only_students', 'only_organization_members');--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('buildings', 'events', 'food', 'facilities', 'transport_parking', 'study_areas', 'dorms_residences', 'sports_recreation');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('student', 'admin');--> statement-breakpoint
CREATE TABLE "buildings" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"campus_id" integer,
	"location_id" integer,
	"basement_count" smallint,
	"floor_count" smallint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "campuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"school_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "event_group_location_relations" (
	"location_id" integer,
	"event_group_id" integer,
	CONSTRAINT "location_event_group_composite_pk" PRIMARY KEY("location_id","event_group_id")
);
--> statement-breakpoint
CREATE TABLE "event_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"date_time_start" timestamp with time zone,
	"date_time_end" timestamp with time zone,
	"custom_marker" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "event_location_relations" (
	"location_id" integer,
	"event_id" integer,
	CONSTRAINT "location_event_composite_pk" PRIMARY KEY("location_id","event_id")
);
--> statement-breakpoint
CREATE TABLE "event_room_relations" (
	"event_id" integer,
	"room_id" integer,
	CONSTRAINT "event_room_composite_pk" PRIMARY KEY("event_id","room_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"date_time_start" timestamp with time zone NOT NULL,
	"date_time_end" timestamp with time zone,
	"custom_marker" text,
	"event_group_id" integer,
	"org_id" integer,
	"visibility" "visibility",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" "category",
	"description" text,
	"campus_id" integer
);
--> statement-breakpoint
CREATE TABLE "offices" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"department_id" integer,
	"school_id" integer
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"logo" text,
	"is_student_org" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"building_id" integer,
	"office_id" integer,
	"description" text,
	"floor_level" smallint
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_org_relations" (
	"user_id" integer,
	"org_id" integer,
	"can_post_events" boolean,
	"can_add_members" boolean,
	"can_remove_members" boolean,
	CONSTRAINT "user_org_composite_pk" PRIMARY KEY("user_id","org_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_or_admin_id" integer,
	"first_name" varchar(255) NOT NULL,
	"mid_name" varchar(255),
	"last_name" varchar(255) NOT NULL,
	"password_hash" text,
	"role" "role",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "users_student_or_admin_id_role_composite_unique" UNIQUE("student_or_admin_id","role")
);
--> statement-breakpoint
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_group_location_relations" ADD CONSTRAINT "event_group_location_relations_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_group_location_relations" ADD CONSTRAINT "event_group_location_relations_event_group_id_event_groups_id_fk" FOREIGN KEY ("event_group_id") REFERENCES "public"."event_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_location_relations" ADD CONSTRAINT "event_location_relations_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_location_relations" ADD CONSTRAINT "event_location_relations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_room_relations" ADD CONSTRAINT "event_room_relations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_room_relations" ADD CONSTRAINT "event_room_relations_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_event_group_id_event_groups_id_fk" FOREIGN KEY ("event_group_id") REFERENCES "public"."event_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offices" ADD CONSTRAINT "offices_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offices" ADD CONSTRAINT "offices_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_org_relations" ADD CONSTRAINT "user_org_relations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_org_relations" ADD CONSTRAINT "user_org_relations_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "building_name_idx" ON "buildings" USING btree ("name");--> statement-breakpoint
CREATE INDEX "campus_idx" ON "buildings" USING btree ("campus_id");--> statement-breakpoint
CREATE INDEX "campus_name_idx" ON "campuses" USING btree ("name");--> statement-breakpoint
CREATE INDEX "department_name_idx" ON "departments" USING btree ("name");--> statement-breakpoint
CREATE INDEX "school_of_department_idx" ON "departments" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "location_event_group_composite_idx" ON "event_group_location_relations" USING btree ("location_id","event_group_id");--> statement-breakpoint
CREATE INDEX "event_group_date_time_start_idx" ON "event_groups" USING btree ("date_time_start");--> statement-breakpoint
CREATE INDEX "event_group_date_time_end_idx" ON "event_groups" USING btree ("date_time_end");--> statement-breakpoint
CREATE INDEX "location_event_composite_idx" ON "event_location_relations" USING btree ("location_id","event_id");--> statement-breakpoint
CREATE INDEX "event_room_composite_idx" ON "event_room_relations" USING btree ("event_id","room_id");--> statement-breakpoint
CREATE INDEX "event_date_time_start_idx" ON "events" USING btree ("date_time_start");--> statement-breakpoint
CREATE INDEX "event_date_time_end_idx" ON "events" USING btree ("date_time_end");--> statement-breakpoint
CREATE INDEX "event_group_idx" ON "events" USING btree ("event_group_id");--> statement-breakpoint
CREATE INDEX "org_idx" ON "events" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "location_name_idx" ON "locations" USING btree ("name");--> statement-breakpoint
CREATE INDEX "category_campus_idx" ON "locations" USING btree ("category","campus_id");--> statement-breakpoint
CREATE INDEX "department_idx" ON "offices" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "school_of_office_idx" ON "offices" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "office_idx" ON "rooms" USING btree ("office_id");--> statement-breakpoint
CREATE INDEX "name_building_composite_idx" ON "rooms" USING btree ("name","building_id");--> statement-breakpoint
CREATE INDEX "school_name_idx" ON "schools" USING btree ("name");--> statement-breakpoint
CREATE INDEX "user_org_composite_idx" ON "user_org_relations" USING btree ("user_id","org_id");--> statement-breakpoint
CREATE INDEX "last_name_idx" ON "users" USING btree ("last_name");