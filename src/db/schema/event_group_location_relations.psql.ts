import { integer, pgTable, primaryKey, index } from "drizzle-orm/pg-core";
import { event_groups } from "./event_groups.psql";
import { locations } from "./locations.psql";

export const event_group_location_relations = pgTable("event_group_location_relations", {
  location_id: integer().references(() => locations.id, {onDelete: 'cascade'}),
  event_group_id: integer().references(() => event_groups.id, {onDelete: 'cascade'})
}, (table) => [
    primaryKey({ name: 'location_event_group_composite_pk', columns: [table.location_id, table.event_group_id] }),
    index('location_event_group_composite_idx').on(table.location_id, table.event_group_id)
]);
