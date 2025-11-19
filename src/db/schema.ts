import { smallint, integer, serial, timestamp, pgTable, 
        primaryKey, varchar, pgEnum, boolean, unique, 
        text, index } from "drizzle-orm/pg-core";
import {timestamps} from './columns.helpers'

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

export const organizations = pgTable("organizations", {
    id: serial().primaryKey(),
    logo: text(),
    is_student_org: boolean(),
    ...timestamps
});

export const user_org_relations = pgTable("user_org_relations", {
    user_id: integer().references(() => users.id, {onDelete: 'cascade'}),
    org_id: integer().references(() => organizations.id, {onDelete: 'cascade'}),
    can_post_events: boolean(),
    can_add_members: boolean(),
    can_remove_members: boolean()
}, (table) => [
    primaryKey({ name: 'user_org_composite_pk', columns: [table.user_id, table.org_id] }),
    index("user_org_composite_idx").on(table.user_id, table.org_id)
]);

export const campuses = pgTable("campuses", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  address: text(),
  ...timestamps
}, (table) => [
    index("campus_name_idx").on(table.name)
]);


export const categoryEnum = pgEnum('category', ['buildings', 'events', 'food', 'facilities', 'transport_parking', 'study_areas', 'dorms_residences', 'sports_recreation']);

export const locations = pgTable("locations", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    category: categoryEnum(),
    description: text(),
    campus_id: integer().references(() => campuses.id, {onDelete: 'cascade'})
}, (table) => [
    index("location_name_idx").on(table.name),
    index("category_campus_idx").on(table.category, table.campus_id)
]);


export const buildings = pgTable("buildings", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    campus_id: integer().references(() => campuses.id, {onDelete: 'cascade'}),
    location_id: integer().references(() => locations.id, {onDelete: 'set null'}),
    basement_count: smallint(),
    floor_count: smallint(),
    ...timestamps
}, (table) => [
    index("building_name_idx").on(table.name),
    index("campus_idx").on(table.campus_id)
]);




export const visibilityEnum = pgEnum('visibility', ['everyone', 'only_students', 'only_organization_members']);

export const events = pgTable("events", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    date_time_start: timestamp({withTimezone: true}).notNull(),
    date_time_end: timestamp({withTimezone: true}),
    custom_marker: text(),
    event_group_id: integer().references(() => event_groups.id, {onDelete: 'set null'}),
    org_id: integer().references(() => organizations.id, {onDelete: 'set null'}),
    visibility: visibilityEnum(),
    ...timestamps
}, (table) => [
    index("event_date_time_start_idx").on(table.date_time_start),
    index("event_date_time_end_idx").on(table.date_time_end),
    index("event_group_idx").on(table.event_group_id),
    index("org_idx").on(table.org_id)
]);
