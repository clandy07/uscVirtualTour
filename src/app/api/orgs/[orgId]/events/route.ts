import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { events, event_room_relations, event_location_relations } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, SQL, and, ilike, or, inArray, lte, gte } from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { getUserOrgs } from '@/app/api/utils/auth';
import { getUserOrgPermissions } from '@/app/api/utils/auth';
import { isNumericString } from '@/app/utils';

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

        if(dateTimeStart) filters.push(gte(events.date_time_start, new Date(dateTimeStart)));
        if(dateTimeEnd) filters.push(lte(events.date_time_end, new Date(dateTimeEnd)));

        if(name) filters.push(ilike(events.name, `${name}%`));

        filters.push(eq(events.org_id, parseInt(orgId)));

        const session = await checkAuth(request)

        if(!session){ // if this executes, then a guest accessed this endpoint
            filters.push(eq(events.visibility, "everyone"))
        }
        else if(getUserRole(session.user) == 'student'){
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
        const paramsPath = await params

        const orgId = (isNumericString(paramsPath.orgId)) ? parseInt(paramsPath.orgId) : null;
        //const searchParams = request.nextUrl.searchParams
        //const inLocation:boolean = (searchParams.get('inLocation') === "true") // if true, then the event takes place in a lcoation, otherwise it takes place in a room

        if(!session){
            // code block runs if a guest tried to post an event
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userOrgs = await getUserOrgs(session.user)
        const userRole = getUserRole(session.user)

        let orgIdTemp: null | number = null;

        if(userRole == "student" && orgId != null && !userOrgs.includes(orgId)){
            // student doesnt even belong to the org, so they are blocked from using this endpoint to post events for their org
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        else if(userRole == "student" && orgId != null){
            const {can_post_events} = await getUserOrgPermissions(session.user, orgId)
            if(!can_post_events){
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                );
            }
            else{
                orgIdTemp = orgId
            }
        }
       else if(userRole == "student" && orgId == null){
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );            
        }
        else if(userRole == "admin" && orgId != null){
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );            
        }
 

        const body: {
            name: string, 
            description: string | null | undefined,
            dateTimeStart: Date | string,
            dateTimeEnd: Date | string | null | undefined,
            visibility: "everyone" | "only_students" | "only_organization_members",
            evetGroupId: number | null | undefined,
            customMarker: string | null | undefined,
            // roomId: number | null | undefined,
            // locationId: number | null | undefined
        } = await request.json();


        const eventName = body.name;
        const description = body.description;
        const date_time_start = new Date(body.dateTimeStart);
        const date_time_end = (body.dateTimeEnd) ? new Date(body.dateTimeEnd) : null;
        const visibility = body.visibility;
        const event_group_id = body.evetGroupId;
        const custom_marker = body.customMarker;
        // const roomId = body.roomId;
        // const locationId = body.locationId;

        // if (!roomId && !locationId){
        //     return NextResponse.json(
        //         {
        //             error: "'roomId' and 'locationId' cannot be both null. Provide at least one."
        //         },
        //         { status: 400 }
        //     );
        // }

        const eventResult = await db.insert(events).values(
            {
                name: eventName,
                description: description,
                date_time_start: date_time_start,
                date_time_end: date_time_end,
                custom_marker: custom_marker,
                event_group_id: event_group_id,
                org_id: orgIdTemp,
                visibility: visibility
            }
        ).returning({ insertedEventId: events.id });
        //const {insertedEventId} = eventResult[0]

        // let result;
        // if(inLocation){
        //     result = await db.insert(event_location_relations).values({
        //         event_id: insertedEventId,
        //         location_id: locationId
        //     });
        // }
        // else{
        //     result = await db.insert(event_room_relations).values({
        //         event_id: insertedEventId,
        //         room_id: roomId
        //     });
        // }

        return NextResponse.json({ data: eventResult[0] });
        
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    } 
}
