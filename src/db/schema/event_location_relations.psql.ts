import { integer, pgTable } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';

export const event_location_relations = pgTable("event_location_relations", {
    location_id: integer(),
    event_id: integer()
});
