import { integer, index, serial, pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';

export const event_groups = pgTable("event_groups", {
    id:serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    date_time_start: timestamp({withTimezone: true}),
    date_time_end: timestamp({withTimezone: true}),
    custom_marker: text(),
    ...timestamps
}, (table) => [
    index("event_group_date_time_start_idx").on(table.date_time_start),
    index("event_group_date_time_end_idx").on(table.date_time_end)
]);
