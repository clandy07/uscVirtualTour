import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';


export const schools = pgTable("schools", {
    id: integer().primaryKey(),
    name: varchar({length: 255}).notNull(),
    ...timestamps
});
