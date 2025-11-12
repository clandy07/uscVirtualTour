import { smallint, integer, serial, pgTable, varchar, index } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';
import { campuses } from "./campuses.psql";
import { locations } from "./locations.psql";

export const buildings = pgTable("buildings", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    campus_id: integer().references(() => campuses.id, {onDelete: 'cascade'}),
    location_id: integer().references(() => locations.id, {onDelete: 'set null'}),
    basement_count: smallint(),
    floor_count: smallint(),
    ...timestamps
}, (table) => [
    index("building_name_idx").on(table.name),
    index("campus_idx").on(table.campus_id)
]);
