ALTER TABLE "user_org_relations" ALTER COLUMN "can_post_events" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_org_relations" ALTER COLUMN "can_post_events" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_org_relations" ALTER COLUMN "can_add_members" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_org_relations" ALTER COLUMN "can_add_members" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_org_relations" ALTER COLUMN "can_remove_members" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_org_relations" ALTER COLUMN "can_remove_members" SET NOT NULL;