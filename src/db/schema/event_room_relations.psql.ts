import { integer, pgTable } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';

export const event_room_relations = pgTable("event_room_relations", {
    event_id: integer(),
    room_id: integer()
});
