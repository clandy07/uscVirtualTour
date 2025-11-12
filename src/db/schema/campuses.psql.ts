import { serial, pgTable, varchar, text, index } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';

export const campuses = pgTable("campuses", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  address: text(),
  ...timestamps
}, (table) => [
    index("campus_name_idx").on(table.name)
]);
