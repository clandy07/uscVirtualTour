import { integer, pgTable, text, varchar, timestamp, pgEnum, serial, index } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';
import { event_groups } from "./event_groups.psql";
import { organizations } from "./organizations.psql";

export const visibilityEnum = pgEnum('visibility', ['everyone', 'only_students', 'only_organization_members']);

export const events = pgTable("events", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    date_time_start: timestamp({withTimezone: true}).notNull(),
    date_time_end: timestamp({withTimezone: true}),
    custom_marker: text(),
    event_group_id: integer().references(() => event_groups.id, {onDelete: 'set null'}),
    org_id: integer().references(() => organizations.id, {onDelete: 'set null'}),
    visibility: visibilityEnum(),
    ...timestamps
}, (table) => [
    index("event_date_time_start_idx").on(table.date_time_start),
    index("event_date_time_end_idx").on(table.date_time_end),
    index("event_group_idx").on(table.event_group_id),
    index("org_idx").on(table.org_id)
]);
