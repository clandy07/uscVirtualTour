import { serial, integer, pgTable, varchar, index } from "drizzle-orm/pg-core";
import { departments } from "./departments.psql";
import { schools } from "./schools.psql";

export const offices = pgTable("offices", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    department_id: integer().references(() => departments.id),
    school_id: integer().references(() => schools.id)
}, (table) => [
    index("department_id_idx").on(table.department_id),
    index("school_id_idx").on(table.school_id)
]);
