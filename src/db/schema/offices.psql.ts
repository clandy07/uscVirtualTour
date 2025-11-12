import { serial, integer, pgTable, varchar, index } from "drizzle-orm/pg-core";
import { departments } from "./departments.psql";
import { schools } from "./schools.psql";

export const offices = pgTable("offices", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    department_id: integer().references(() => departments.id, {onDelete: 'set null'}),
    school_id: integer().references(() => schools.id, {onDelete: 'set null'})
}, (table) => [
    index("department_idx").on(table.department_id),
    index("school_idx").on(table.school_id)
]);
