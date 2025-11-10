import { integer, pgTable, varchar, text } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';

export const campuses = pgTable("campuses", {
  id: integer().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  address: text(),
  ...timestamps
});
