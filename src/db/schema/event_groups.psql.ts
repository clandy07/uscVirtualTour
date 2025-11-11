import { integer, index, serial, pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';

export const event_groups = pgTable("event_groups", {
    id:serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    date_time_start: timestamp(),
    date_time_end: timestamp(),
    custom_marker: text(),
    ...timestamps
}, (table) => [
    index("date_time_start_idx").on(table.date_time_start),
    index("date_time_end_idx").on(table.date_time_end)
]);
