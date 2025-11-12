import { buildings } from "./buildings.psql";
import { campuses } from "./campuses.psql";
import { departments } from "./departments.psql";
import { event_group_location_relations } from "./event_group_location_relations.psql";
import { event_groups } from "./event_groups.psql";
import { event_location_relations } from "./event_location_relations.psql";
import { event_room_relations } from "./event_room_relations.psql";
import { events } from "./events.psql";
import { locations } from "./locations.psql";
import { offices } from "./offices.psql";
import { organizations } from "./organizations.psql";
import { rooms } from "./rooms.psql";
import { schools } from "./schools.psql";
import { user_org_relations } from "./user_org_relations.psql";
import { users } from "./users.psql";

import { relations } from 'drizzle-orm';

// ALL RELATIONS HAVE BEEN CHECKED

// users, user_org_relations, and organizations relations
export const usersRelations = relations(users, ({ many }) => ({
    userOrgs: many(user_org_relations),
}));

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
    buildings: many(buildings)
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

