import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { events, event_location_relations, event_room_relations } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, and,} from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { getUserOrgs } from '@/app/api/utils/auth';
import { getUserOrgPermissions } from '@/app/api/utils/auth';
import {isNumber} from '@/app/utils'

// GET /orgs/:orgId/events/:eventId - Get full details of a given event in a given org
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

        // if (event.length <= 0){
        //     return NextResponse.json({ data: [] });
        // }

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

        const result = await db.select().from(events).where(eq(events.id, parseInt(eventId)))
    
        return NextResponse.json({ data: result });
        
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }

}


export async function DELETE(
    request: NextRequest, 
    { params }: { params: Promise<{ orgId: string, eventId: string }> }) {

    try {    
        const {orgId, eventId} = await params

        const session = await checkAuth(request)
        if(!session){
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );        
        }

        const userOrgs = await getUserOrgs(session.user)
        const userRole = getUserRole(session.user)

        if(userRole == "student" && !userOrgs.includes(parseInt(orgId))){
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
        }

        const temp = await db.delete(events).where(eq(events.id, parseInt(eventId))).returning({ deletedId: events.id });
        const result = temp[0]

        return NextResponse.json({ data: result });

    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}


export async function PATCH(
    request: NextRequest, 
    { params }: { 
        params: Promise<{ orgId: string, eventId: string }> 
    }){

    try {
        const {orgId, eventId} = await params
        const searchParams = request.nextUrl.searchParams
        const inLocation:boolean = (searchParams.get('inLocation') === "true")

        const session = await checkAuth(request)
        if(!session){
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );        
        }

        const userOrgs = await getUserOrgs(session.user)
        const userRole = getUserRole(session.user)

        if(userRole == "student" && !userOrgs.includes(parseInt(orgId))){
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
        }

        const body: {
            name: string, 
            description: string | null | undefined,
            dateTimeStart: Date | string,
            dateTimeEnd: Date | string | null | undefined,
            visibility: "everyone" | "only_students" | "only_organization_members",
            evetGroupId: number | null | undefined,
            customMarker: string | null | undefined,
            roomId: number | null | undefined,
            locationId: number | null | undefined
        } = await request.json();

        // admin logic goes here. admin cant update an event posted by students
        const eventName = body.name;
        const description = body.description;
        const date_time_start = new Date(body.dateTimeStart);
        const date_time_end = (body.dateTimeEnd) ? new Date(body.dateTimeEnd) : null;
        const visibility = body.visibility;
        const event_group_id = body.evetGroupId;
        const custom_marker = body.customMarker;
        const roomId = body.roomId;
        const locationId = body.locationId;

        if (!roomId && !locationId){
            return NextResponse.json(
                {
                    error: "'roomId' and 'locationId' cannot be both null. Provide at least one."
                },
                { status: 400 }
            );
        }

        const eventResult = await db.update(events).set(
            {
                name: eventName,
                description: description,
                date_time_start: date_time_start,
                date_time_end: date_time_end,
                custom_marker: custom_marker,
                event_group_id: event_group_id,
                visibility: visibility
            }
        )
        .where(eq(events.id, parseInt(eventId)))
        .returning({ updatedEventId: events.id });

        const {updatedEventId} = eventResult[0]

        let result;
        if(inLocation && isNumber(locationId)){
            result = await db.update(event_location_relations).set({
                location_id: locationId
            }).where(
                and(
                    eq(event_location_relations.event_id, updatedEventId),
                    eq(event_location_relations.location_id, locationId)
                )
            );
        }
        else if(isNumber(roomId)){
            result = await db.update(event_room_relations).set({
                room_id: roomId
            }).where(
                and(
                    eq(event_room_relations.event_id, updatedEventId),
                    eq(event_room_relations.room_id, roomId)
                )
            );
        }

        return NextResponse.json({ data: eventResult });

    } catch (err){
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        ); 
    }
}