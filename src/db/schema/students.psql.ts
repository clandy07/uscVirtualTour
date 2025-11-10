import { integer, pgTable, varchar, text } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';

export const students = pgTable("students", {
    student_id: integer().primaryKey(),
    first_name: varchar({ length: 255 }).notNull(),
    mid_name: varchar({ length: 255 }).notNull(), 
    last_name: varchar({ length: 255 }).notNull(),
    password_hash: text(),
    ...timestamps
});
