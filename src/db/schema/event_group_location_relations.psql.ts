import { integer, pgTable } from "drizzle-orm/pg-core";
import { timestamps } from './columns.helpers';

export const event_group_location_relations = pgTable("event_group_location_relations", {
  location_id: integer(),
  event_group_id: integer(),
  ...timestamps
});
