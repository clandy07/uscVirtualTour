// columns.helpers.ts
// columns.helpers.ts
import { timestamp } from 'drizzle-orm/pg-core';

export const timestamps = {
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
};
