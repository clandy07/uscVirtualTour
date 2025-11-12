import { smallint, integer, serial, pgTable, text, varchar, index } from "drizzle-orm/pg-core";
import { buildings } from "./buildings.psql";
import { offices } from "./offices.psql";

export const rooms = pgTable("rooms", {
    id: serial().primaryKey(),
    name: varchar({length: 255}).notNull(),
    building_id: integer().references(() => buildings.id, {onDelete: 'cascade'}),
    office_id: integer().references(() => offices.id, {onDelete: 'set null'}),
    description: text(),
    floor_level: smallint()
}, (table) => [
    index("office_idx").on(table.office_id),
    index("name_building_composite_idx").on(table.name, table.building_id)
]);
