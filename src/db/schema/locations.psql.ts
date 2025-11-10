import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';

export const locations = pgTable("locations", {
    id: integer().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    category: varchar({ length: 100 }),
    description: text(),
    campus_id: integer()
});
