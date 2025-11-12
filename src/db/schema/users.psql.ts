import { serial, pgEnum, integer, pgTable, varchar, text, unique, index } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';

export const roleEnum = pgEnum('role', ['student', 'admin']);

export const users = pgTable("users", {
    id: serial().primaryKey(),
    student_or_admin_id: integer(),
    first_name: varchar({ length: 255 }).notNull(),
    mid_name: varchar({ length: 255 }), 
    last_name: varchar({ length: 255 }).notNull(),
    password_hash: text(),
    role: roleEnum(),
    ...timestamps
},(t) => [
    index("last_name_idx").on(t.last_name),
    unique("users_student_or_admin_id_role_composite_unique").on(t.student_or_admin_id, t.role)
]);
