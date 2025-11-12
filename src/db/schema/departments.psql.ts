import { serial, integer, pgTable, varchar, index } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';
import { schools } from "./schools.psql";

export const departments = pgTable("departments", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  school_id: integer().references(() => schools.id, {onDelete: 'cascade'}),
  ...timestamps
}, (table) => [
    index("department_name_idx").on(table.name),
    index("school_idx").on(table.school_id)
]);
