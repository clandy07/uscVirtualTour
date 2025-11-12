import { integer, pgTable, primaryKey, index } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';
import { events } from "./events.psql";
import { locations } from "./locations.psql";

export const event_location_relations = pgTable("event_location_relations", {
    location_id: integer().references(() => locations.id, {onDelete: 'cascade'}),
    event_id: integer().references(() => events.id, {onDelete: 'cascade'})
}, (table) => [
    primaryKey({ name: 'location_event_composite_pk', columns: [table.location_id, table.event_id] }),
    index("location_event_composite_idx").on(table.location_id, table.event_id)
]);
