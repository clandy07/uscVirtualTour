import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { events, event_room_relations, event_location_relations } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, SQL, and, ilike, or, inArray } from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { getUserOrgs } from '@/app/api/utils/auth';
import { getUserOrgPermissions } from '@/app/api/utils/auth';

// GET /orgs/:orgId/events - Get all events in a given org
export async function GET(
    request: NextRequest, 
    { params }: { params: Promise<{ orgId: string }> }) {

    try {        
        const { orgId } = await params
        const searchParams = request.nextUrl.searchParams
        const dateTimeStart = searchParams.get('dateTimeStart')
        const dateTimeEnd = searchParams.get('dateTimeEnd')
        const name = searchParams.get('name')

        const filters: SQL[] = [];

        if(dateTimeStart) filters.push(eq(events.date_time_start, new Date(dateTimeStart)));
        if(dateTimeEnd) filters.push(eq(events.date_time_end, new Date(dateTimeEnd)));

        if(name) filters.push(ilike(events.name, `${name}%`));

        filters.push(eq(events.org_id, parseInt(orgId)));

        const session = await checkAuth(request)

        if(!session){ // if this executes, then a guest accessed this endpoint
            filters.push(eq(events.visibility, "everyone"))
        }
        else if(getUserRole(session.user) === 'student'){
            filters.push(inArray(events.visibility, ["everyone", "only_students"]))
        }

        const result = await db.select({
            id: events.id,
            name: events.name,
            date_time_start: events.date_time_start,
            date_time_end: events.date_time_end,
            custom_marker: events.custom_marker,
            org_id: events.org_id,
            visibility: events.visibility
        }).from(events).where(and(...filters));

        return NextResponse.json({ data: result });
        
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }

}


export async function POST(request: NextRequest, 
    { params }: { params: Promise<{ orgId: string }> }) {

    try {        
        const session = await checkAuth(request)
        const {orgId} = await params

        const searchParams = request.nextUrl.searchParams
        const inLocation:boolean = (searchParams.get('inLocation') === "true") // if true, then the event takes place in a lcoation, otherwise it takes place in a room

        if(!session){
            // code block runs if a guest tried to post an event
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userOrgs = await getUserOrgs(session.user)
        const userRole = getUserRole(session.user)

        if(userRole == "student" && !userOrgs.includes(parseInt(orgId))){
            // student doesnt even belong to the org, so they are blocked from using this endpoint to post events for their org
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        else if(userRole == "student"){
            const {can_post_events} = await getUserOrgPermissions(session.user, parseInt(orgId))
            if(!can_post_events){
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                );
            }
            else{
                // this is where code for the students who can post in their orgs will be handled
            }
        }

        const body = await request.json();

        // You MUST validate the body here
        // below is the code for admin to post an event. the orgId will be null  for events posted by admins
        const {
            name: eventName,
            description,
            date_time_start,
            date_time_end,
            visibility,
            event_group_id,
            custom_marker,
            roomId,
            locationId
        } = body;

        const eventResult = await db.insert(events).values(
            {
                name: eventName,
                description: description,
                date_time_start: new Date(date_time_start),
                date_time_end: new Date(date_time_end),
                custom_marker: custom_marker,
                event_group_id: parseInt(event_group_id),
                org_id: parseInt(orgId),
                visibility: visibility
            }
        ).returning({ insertedEventId: events.id });
        const {insertedEventId} = eventResult[0]

        let result;
        if(inLocation){
            result = await db.insert(event_location_relations).values({
                event_id: insertedEventId,
                location_id: parseInt(locationId)
            });
        }
        else{
            result = await db.insert(event_room_relations).values({
                event_id: insertedEventId,
                room_id: parseInt(roomId)
            });
        }

        return NextResponse.json({ data: result });
        
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    } 
}
