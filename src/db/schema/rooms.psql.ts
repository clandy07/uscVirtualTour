import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const rooms = pgTable("rooms", {
    id: integer().primaryKey(),
    name: varchar({length: 255}).notNull(),
    building_id: integer(),
    office_id: integer(),
    description: text(),
    floor_index: integer()
});
