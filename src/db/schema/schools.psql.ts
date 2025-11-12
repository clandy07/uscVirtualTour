import { serial, pgTable, varchar, index } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';


export const schools = pgTable("schools", {
    id: serial().primaryKey(),
    name: varchar({length: 255}).notNull(),
    ...timestamps
}, (table) => [
    index("school_name_idx").on(table.name)
]);
