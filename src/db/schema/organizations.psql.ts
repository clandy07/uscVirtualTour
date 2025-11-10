import { integer, pgTable, text, boolean } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';

export const organizations = pgTable("organizations", {
    id: integer().primaryKey(),
    logo: text(),
    is_student_org: boolean(),
    ...timestamps
});
