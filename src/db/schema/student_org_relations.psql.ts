import { integer, pgTable, boolean } from "drizzle-orm/pg-core";

export const student_org_relations = pgTable("student_org_relations", {
    student_id: integer(),
    org_id: integer(),
    can_post_events: boolean(),
    can_add_members: boolean(),
    can_remove_members: boolean()
});
