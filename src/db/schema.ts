import { smallint, integer, serial, timestamp, pgTable, 
        primaryKey, varchar, pgEnum, boolean, unique, 
        text, index, geometry } from "drizzle-orm/pg-core";
import {timestamps} from './columns.helpers'
import * as authSchema from "./auth-schema";

export const roleEnum = pgEnum('role', ['student', 'admin']);

export const users = authSchema.users;
// export const users = pgTable("users", {
//     id: serial().primaryKey(),
//     email: varchar({length: 320}).notNull(),
//     email_verified: boolean(),
//     // student_or_admin_id: integer(), // we might use the username plugin so this might be removed
//     username: varchar({length: 255}).notNull(), //this is the student ID or admin ID field. its now called "username" kay arte ang better-auth
//     displayUsername: varchar({length: 255}).notNull(),
//     first_name: varchar({ length: 255 }).notNull(),
//     mid_name: varchar({ length: 255 }), 
//     last_name: varchar({ length: 255 }).notNull(),
//     //role: roleEnum(),
//     ...timestamps
// },(t) => [
//     index("last_name_idx").on(t.last_name),
//     unique("username_unique").on(t.username)
// ]);

export const sessions = authSchema.sessions;
export const accounts = authSchema.accounts;
export const verifications = authSchema.verifications;
export const userRelations = authSchema.userRelations;
export const sessionRelations = authSchema.sessionRelations
export const accountRelations = authSchema.accountRelations;

// export const user_profiles = pgTable("user_profiles", {  // no reason to have it right now
//     user_id: text().references(() => users.id, {onDelete: 'cascade'}),
//     role: roleEnum().default("student")
// }, (table) => [
//     unique("user_profile_unique").on(table.user_id)
// ])

export const organizations = pgTable("organizations", {
    id: serial().primaryKey(),
    name: varchar({length: 150}).notNull(),
    description: text(),
    logo: text(),
    is_student_org: boolean(),
    ...timestamps
});

export const user_org_relations = pgTable("user_org_relations", {
    user_id: text().notNull().references(() => users.id, {onDelete: 'cascade'}),
    org_id: integer().notNull().references(() => organizations.id, {onDelete: 'cascade'}),
    can_post_events: boolean().default(false).notNull(),
    can_add_members: boolean().default(false).notNull(),
    can_remove_members: boolean().default(false).notNull(),
    can_set_member_permissions: boolean().default(false).notNull()
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

export const categoryEnum = pgEnum('category', ['buildings', 'food', 'facilities', 'transport_parking', 'study_areas', 'dorms_residences', 'sports_recreation']);

export const locations = pgTable("locations", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    category: categoryEnum(),
    description: text(),
    campus_id: integer().references(() => campuses.id, {onDelete: 'cascade'}),
    latitude: varchar({ length: 50 }),
    longitude: varchar({ length: 50 })
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
    index("campus_idx").on(table.campus_id),
    unique("building_location_unique").on(table.location_id)
]);

export const event_groups = pgTable("event_groups", {
    id:serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    date_time_start: timestamp({withTimezone: true}),
    date_time_end: timestamp({withTimezone: true}),
    custom_marker: text(),
    ...timestamps
}, (table) => [
    index("event_group_date_time_start_idx").on(table.date_time_start),
    index("event_group_date_time_end_idx").on(table.date_time_end)
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

export const schools = pgTable("schools", {
    id: serial().primaryKey(),
    name: varchar({length: 255}).notNull(),
    ...timestamps
}, (table) => [
    index("school_name_idx").on(table.name)
]);

export const departments = pgTable("departments", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  school_id: integer().references(() => schools.id, {onDelete: 'cascade'}),
  ...timestamps
}, (table) => [
    index("department_name_idx").on(table.name),
    index("school_of_department_idx").on(table.school_id)
]);

export const offices = pgTable("offices", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    department_id: integer().references(() => departments.id, {onDelete: 'set null'}),
    school_id: integer().references(() => schools.id, {onDelete: 'set null'})
}, (table) => [
    index("department_idx").on(table.department_id),
    index("school_of_office_idx").on(table.school_id)
]);

export const geometries = pgTable("geometries", {
    id: serial().primaryKey(),
    polygon:  geometry('polygon', { type: 'polygon', mode: 'xy', srid: 4326 }),
}, (table) => [
    index("polygon_idx").using("gist", table.polygon)
]);

export const rooms = pgTable("rooms", {
    id: serial().primaryKey(),
    name: varchar({length: 255}).notNull(),
    building_id: integer().references(() => buildings.id, {onDelete: 'cascade'}),
    office_id: integer().references(() => offices.id, {onDelete: 'set null'}),
    geometry_id: integer().references(() => geometries.id, {onDelete: 'set null'}),
    description: text(),
    floor_level: smallint()
}, (table) => [
    index("office_idx").on(table.office_id),
    index("name_building_composite_idx").on(table.name, table.building_id)
]);

export const event_room_relations = pgTable("event_room_relations", {
    event_id: integer().references(() => events.id, {onDelete: 'cascade'}),
    room_id: integer().references(() => rooms.id, {onDelete: 'cascade'})
}, (table) => [
    primaryKey({ name: 'event_room_composite_pk', columns: [table.event_id, table.room_id] }),
    index("event_room_composite_idx").on(table.event_id, table.room_id)
]);

export const event_location_relations = pgTable("event_location_relations", {
    location_id: integer().references(() => locations.id, {onDelete: 'cascade'}),
    event_id: integer().references(() => events.id, {onDelete: 'cascade'})
}, (table) => [
    primaryKey({ name: 'location_event_composite_pk', columns: [table.location_id, table.event_id] }),
    index("location_event_composite_idx").on(table.location_id, table.event_id)
]);

export const event_group_location_relations = pgTable("event_group_location_relations", {
  location_id: integer().references(() => locations.id, {onDelete: 'cascade'}),
  event_group_id: integer().references(() => event_groups.id, {onDelete: 'cascade'})
}, (table) => [
    primaryKey({ name: 'location_event_group_composite_pk', columns: [table.location_id, table.event_group_id] }),
    index('location_event_group_composite_idx').on(table.location_id, table.event_group_id)
]);




import { relations } from 'drizzle-orm';

// ALL RELATIONS HAVE BEEN CHECKED

// users, user_org_relations, and organizations relations
export const usersRelations = relations(users, ({ one, many }) => ({
    userOrgs: many(user_org_relations),
    //userProfiles: one(user_profiles)
}));

// export const userProfileRelations = relations(user_profiles, ({ one }) => ({
// 	user: one(users, { 
//         fields: [user_profiles.user_id], 
//         references: [users.id] 
//     }),
// }));

export const organizationsRelations = relations(organizations, ({ many }) => ({
    userOrgs: many(user_org_relations),
    events: many(events) // organizations one-to-many events
}));

export const userOrgRelations = relations(user_org_relations, ({ one }) => ({
    organization: one(organizations, {
        fields: [user_org_relations.org_id],
        references: [organizations.id],
    }),
    user: one(users, {
        fields: [user_org_relations.user_id],
        references: [users.id],
    }),
}));



// events, event_location_relations, and locations relations
export const eventsRelations = relations(events, ({ many, one}) => ({
    eventLocations: many(event_location_relations),
    organization: one(organizations, {
        fields: [events.org_id],
        references: [organizations.id],
    }),
    eventGroup: one(event_groups, {
        fields: [events.event_group_id],
        references: [event_groups.id],   
    }),
    eventRooms: many(event_room_relations)
}));

export const locationsRelations = relations(locations, ({ many, one }) => ({
    eventLocations: many(event_location_relations),
    eventGroupLocations: many(event_group_location_relations), // locations one-to-many event_group_location_relations
    campus: one(campuses, {
        fields: [locations.campus_id],
        references: [campuses.id],
    }),
    building: one(buildings) // locations one-to-one building (a location can have at most one building)
}));

export const eventLocationRelations = relations(event_location_relations, ({ one }) => ({
    event: one(events, {
        fields: [event_location_relations.event_id],
        references: [events.id],
    }),
    location: one(locations, {
        fields: [event_location_relations.location_id],
        references: [locations.id],
    }),
}));


// event_groups, event_group_location_relations, and locations relations
export const eventGroupsRelations = relations(event_groups, ({ many }) => ({
    eventGroupLocations: many(event_group_location_relations),
    events: many(events)
}));

export const eventGroupLocationRelations = relations(event_group_location_relations, ({ one }) => ({
    location: one(locations, {
        fields: [event_group_location_relations.location_id],
        references: [locations.id]
    }),
    eventGroup: one(event_groups, {
        fields: [event_group_location_relations.event_group_id],
        references: [event_groups.id],
    }),
}));



// buildings, campuses, and locations relations
export const campusesRelations = relations(campuses, ({ many }) => ({
    buildings: many(buildings),
    locations: many(locations)
}));

export const buildingsRelations = relations(buildings, ({ one, many }) => ({
    campus: one(campuses, {
        fields: [buildings.campus_id],
        references: [campuses.id],
    }),
    location: one(locations, {
        fields: [buildings.location_id],
        references: [locations.id],
    }), 
    rooms: many(rooms)
}));



// schools, departments, and offices relations
export const schoolsRelations = relations(schools, ({ many }) => ({
    departments: many(departments),
    offices: many(offices)
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
    school: one(schools, {
        fields: [departments.school_id],
        references: [schools.id],
    }),
    offices: many(offices)
}));

export const officesRelations = relations(offices, ({ one, many }) => ({
    school: one(schools, {
        fields: [offices.school_id],
        references: [schools.id],
    }),
    department: one(departments, {
        fields: [offices.department_id],
        references: [departments.id],
    }),
    rooms: many(rooms)
}));



// offices, rooms, and buildings relations
export const roomsRelations = relations(rooms, ({ one, many }) => ({
    office: one(offices, {
        fields: [rooms.office_id],
        references: [offices.id],
    }),
    building: one(buildings, {
        fields: [rooms.building_id],
        references: [buildings.id],
    }),
    geometry: one(geometries, {
        fields: [rooms.geometry_id],
        references: [geometries.id],
    }),
    eventRooms: many(event_room_relations)
}));



// rooms, event_room_relations, and events relations
export const eventRoomRelations = relations(event_room_relations, ({ one }) => ({
    room: one(rooms, {
        fields: [event_room_relations.room_id],
        references: [rooms.id],
    }),
    event: one(events, {
        fields: [event_room_relations.event_id],
        references: [events.id],
    })
}));


export const geometriesRelations = relations(geometries, ({one}) => ({
    room: one(rooms)
}));

export const schema = {
    users,
    organizations,
    user_org_relations,
    campuses,
    locations,
    buildings,
    event_groups,
    events,
    schools,
    departments,
    offices,
    rooms,
    event_room_relations,
    event_location_relations,
    event_group_location_relations,
    geometries,

    usersRelations,
    organizationsRelations,
    userOrgRelations,
    eventsRelations,
    locationsRelations,
    eventLocationRelations,
    eventGroupsRelations,
    eventGroupLocationRelations,
    campusesRelations,
    buildingsRelations,
    schoolsRelations,
    departmentsRelations,
    officesRelations,
    roomsRelations,
    eventRoomRelations,
    geometriesRelations,

    sessions, 
    accounts, 
    verifications, 
    userRelations, 
    sessionRelations, 
    accountRelations
};