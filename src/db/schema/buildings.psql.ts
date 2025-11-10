import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';

export const buildings = pgTable("buildings", {
  id: integer().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  campus_id: integer(),
  floor_array: integer().array(), // array of integers
  ...timestamps
});
