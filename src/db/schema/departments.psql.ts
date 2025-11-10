import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';

export const departments = pgTable("departments", {
  id: integer().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  school_id: integer(),
  ...timestamps
});
