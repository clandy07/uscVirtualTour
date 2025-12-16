import { checkAuth } from '@/app/api/utils/auth';
import { getUserOrgs } from '@/app/api/utils/auth';
import { getUserOrgPermissions } from '@/app/api/utils/auth';
import {isNumber, isNumericString} from '@/app/utils'
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { events, organizations, event_location_relations, event_room_relations } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, and, isNull} from 'drizzle-orm';

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
    { params }: { params: Promise<{ orgId: string, eventId: string }> }) {

    try {    
        const { searchParams } = new URL(request.url);
        const oldLocationId = searchParams.get('oldLocationId');
        console.log("old location id: ", oldLocationId)

        if(oldLocationId == null){
            return NextResponse.json(
                { error: "Provide a valid numerical value for oldLocationId" },
                { status: 400 }
            )
        }
        const oldLocationIdNum = isNumericString(oldLocationId) ? parseInt(oldLocationId) : null

        if(oldLocationIdNum == null){
            return NextResponse.json(
                { error: "Provide a valid numerical value for oldLocationId" },
                { status: 400 }
            )
        }

        const pathParams = await params

        const orgId = (!isNumericString(pathParams.orgId)) ? null : parseInt(pathParams.orgId)
        const eventId = (!isNumericString(pathParams.eventId)) ? null : parseInt(pathParams.eventId)

        if(eventId == null){
            return NextResponse.json(
                { error: "Provide a valid numerical value for eventId" },
                { status: 400 }
            );     
        }        

        const session = await checkAuth(request)
        if(!session){
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );        
        }

        const userOrgs = await getUserOrgs(session.user)
        const userRole = getUserRole(session.user)

        if(userRole == "student" && orgId != null && !userOrgs.includes(orgId)){
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
        }
        else if(userRole == "student" && orgId == null){
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            ); 
        }
        else if(userRole == "admin" && orgId != null && orgId != 0){
            const result = await db.select({
                is_student_org: organizations.is_student_org
            }).from(organizations).where(eq(organizations.id, orgId))

            if(result[0].is_student_org){
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
            eventGroupId: number | null | undefined,
            customMarker: string | null | undefined
            locationId: number,
            org_id: number
        } = await request.json();

        console.log("request body: ", body)
        console.log("path param orgId: ", orgId)


        const eventName = body.name;
        const description = body.description;
        const date_time_start = new Date(body.dateTimeStart);
        const date_time_end = (body.dateTimeEnd) ? new Date(body.dateTimeEnd) : null;
        const visibility = body.visibility;
        const event_group_id = body.eventGroupId == 0 ? null : body.eventGroupId;
        const custom_marker = body.customMarker;

        const orgFilter = (orgId === null || orgId == 0) ? isNull(events.org_id) : eq(events.org_id, orgId);

        const result = await db.update(events).set({
            name: eventName,
            description: description,
            date_time_start: date_time_start,
            date_time_end: date_time_end,
            visibility: visibility,
            event_group_id: event_group_id,
            custom_marker: custom_marker,
            org_id: body.org_id
        }).where(
            and(
                eq(events.id, eventId),
                orgFilter
            )
        ).returning({
            eventIdUpdated: events.id,
            description: events.description,
            dateTimeStart: events.date_time_start,
            dateTimeEnd: events.date_time_end,
            visibility: events.visibility,
            eventGroupId: events.event_group_id,
            customMarker: events.custom_marker,
            orgId: events.org_id   
        });

        console.log("result ", result)

        const result2 = await db.update(event_location_relations).set({
            location_id: body.locationId
        }).where(
            and(
                eq(event_location_relations.event_id, result[0].eventIdUpdated),
                eq(event_location_relations.location_id, oldLocationIdNum)
            )
        ).returning({
            newLocationId: event_location_relations.location_id
        })

        const retVal = {
            ...result[0],
            ...result2[0]
        }
        console.log(retVal)
        return NextResponse.json(
            { data: retVal },
        );
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}