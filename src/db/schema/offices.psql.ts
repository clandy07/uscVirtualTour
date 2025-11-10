import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';

export const offices = pgTable("offices", {
    id: integer().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    department_id: integer(),
    school_id: integer()
});
