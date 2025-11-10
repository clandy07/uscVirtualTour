import { integer, pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';

export const event_groups = pgTable("event_groups", {
    id:integer().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    location_id: integer(),
    date_time_start: timestamp(),
    date_time_end: timestamp(),
    custom_marker: text(),
    ...timestamps
});
