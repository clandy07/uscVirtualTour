import { integer, pgTable, text, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';

export const visibilityEnum = pgEnum('visibility', ['VISITOR_LEVEL', 'STUDENT_LEVEL', 'ADMIN_LEVEL']);

export const events = pgTable("events", {
    id: integer().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    date_time_start: timestamp(),
    date_time_end: timestamp(),
    custom_marker: text(),
    event_group_id: integer(),
    org_id: integer(),
    visibility: visibilityEnum(),
    ...timestamps
});
