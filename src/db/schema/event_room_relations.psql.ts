import { integer, pgTable, primaryKey, index } from "drizzle-orm/pg-core";
import { events } from "./events.psql";
import { rooms } from "./rooms.psql";

export const event_room_relations = pgTable("event_room_relations", {
    event_id: integer().references(() => events.id, {onDelete: 'cascade'}),
    room_id: integer().references(() => rooms.id, {onDelete: 'cascade'})
}, (table) => [
    primaryKey({ name: 'event_room_composite_pk', columns: [table.event_id, table.room_id] }),
    index("event_room_composite_idx").on(table.event_id, table.room_id)
]);
