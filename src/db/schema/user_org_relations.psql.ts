import { integer, pgTable, boolean, primaryKey, index } from "drizzle-orm/pg-core";
import { users } from "./users.psql";
import { organizations } from "./organizations.psql";

export const user_org_relations = pgTable("user_org_relations", {
    user_id: integer().references(() => users.id, {onDelete: 'cascade'}),
    org_id: integer().references(() => organizations.id, {onDelete: 'cascade'}),
    can_post_events: boolean(),
    can_add_members: boolean(),
    can_remove_members: boolean()
}, (table) => [
    primaryKey({ name: 'user_org_composite_pk', columns: [table.user_id, table.org_id] }),
    index("user_org_composite_idx").on(table.user_id, table.org_id)
]);
