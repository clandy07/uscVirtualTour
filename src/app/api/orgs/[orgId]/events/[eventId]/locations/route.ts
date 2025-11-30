import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { events, event_location_relations } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, SQL, and, ilike, or, inArray } from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { getUserOrgs } from '@/app/api/utils/auth';
import { getUserOrgPermissions } from '@/app/api/utils/auth';

// GET /orgs/:orgId/events/:eventId/locations - Get all locations in a given event of a given org
export async function GET(
    request: NextRequest, 
    { params }: { params: Promise<{ orgId: string, eventId: string }> }) {

    try {        
        const { orgId, eventId } = await params

        const event = await db.select({eventId: events.id, eventVisibility: events.visibility}).from(events).where(
            and(
                eq(events.id, parseInt(eventId)),
                eq(events.org_id, parseInt(orgId))
            )
        )

        if (event.length <= 0){
            return NextResponse.json({ data: [] });
        }

        const {eventVisibility} = event[0]

        const session = await checkAuth(request)
        if(!session && eventVisibility != "everyone"){ 
            // code block runs if a guest tried to get the campus of an event not visible to them
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        else if(session && eventVisibility != "everyone"){
            // there is a valid session 
            const userRole = getUserRole(session.user)
            const userOrgs = getUserOrgs(session.user)
            if (userRole == "student" && eventVisibility == "only_organization_members" && !(await userOrgs).includes(parseInt(orgId))){
                // code block runs if the student tried to get the campus of an event only visible to members of an org they are not part of
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                ); 
            }
        }

        const result = await db.query.events.findMany({
            columns: {
                id: true,
                name: true,
                org_id: true,
            },
            where: (events, { eq }) => (eq(events.id, parseInt(eventId))),
            with: {

                eventLocations: {
                    with: {
                        location: true
                    }
                }
            }
        })
    
        return NextResponse.json({ data: result });
        
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }

}


// POST /orgs/:orgId/events/:eventId/locations - Get all locations in a given event of a given org
export async function POST(
    request: NextRequest, 
    { params }: { params: Promise<{ orgId: string, eventId: string }> }) {

    try {        
        const { orgId, eventId } = await params

        if (isNaN(parseInt(eventId))){
            return NextResponse.json(
                { error: "Invalid eventId: Make sure eventId is a number." },
                { status: 400 }
            );
        }

        const event = await db.select({
            eventIdQueried: events.id, 
            eventVisibility: events.visibility,
            eventOrgId: events.org_id
        }).from(events).where(
            and(
                eq(events.id, parseInt(eventId)),
                eq(events.org_id, parseInt(orgId))
            )
        )

        if (event.length <= 0){
            return NextResponse.json(
                { error: "The org of the given orgId does not have an event of the given eventId." },
                { status: 404 }
            );
        }

        const {eventVisibility, eventOrgId, eventIdQueried} = event[0]

        const session = await checkAuth(request)
        if(!session){ 
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        else if(getUserRole(session.user) == "student" && eventOrgId != null){
            const userOrgs = await getUserOrgs(session.user)
            const studentOrgPermissions = await getUserOrgPermissions(session.user, eventOrgId)
            if (!userOrgs.includes(eventOrgId) || !studentOrgPermissions.can_post_events){
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                ); 
            }
        }
        else if (eventOrgId != null){
            // if this code block is run, it means the user was an admin. admins can't post events for an organization in the database
            // because it is assumed that whenever an admin posts an event, it is an event held by the school administration itself.

            // admins can't edit posts that were made by non-admin users hence why they get this error if they try do so
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            ); 
        }

        const body: {
            locationId: any
        } = await request.json();

        if(isNaN(body.locationId) || body.locationId == null){
            return NextResponse.json(
                { error: "Invalid locationId: locationId should be a number" },
                { status: 400 }
            );          
        }

        const result = await db.insert(event_location_relations).values({
            event_id: parseInt(eventId),
            location_id: (typeof body.locationId == "string") ? parseInt(body.locationId) : body.locationId
        }).returning(
            {
                eventIdInserted: event_location_relations.event_id,
                locationIdInserted: event_location_relations.location_id
            }
        );
    
        return NextResponse.json({ data: result[0] });
        
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }

}