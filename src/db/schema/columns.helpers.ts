// columns.helpers.ts
// columns.helpers.ts
import { timestamp } from 'drizzle-orm/pg-core';

export const timestamps = {
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp(),
  deleted_at: timestamp(),
};
