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
    })
}));

export const locationsRelations = relations(locations, ({ many }) => ({
    eventLocations: many(event_location_relations),
    eventGroupLocations: many(event_group_location_relations) // locations one-to-many event_group_location_relations
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
