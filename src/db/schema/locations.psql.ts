import { integer, serial, pgTable, text, varchar, pgEnum, index } from "drizzle-orm/pg-core";

import { campuses } from "./campuses.psql";

export const categoryEnum = pgEnum('category', ['buildings', 'events', 'food', 'facilities', 'transport_parking', 'study_areas', 'dorms_residences', 'sports_recreation']);

export const locations = pgTable("locations", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    category: categoryEnum(),
    description: text(),
    campus_id: integer().references(() => campuses.id, {onDelete: 'cascade'})
}, (table) => [
    index("location_name_idx").on(table.name),
    index("category_campus_idx").on(table.category, table.campus_id)
]);
