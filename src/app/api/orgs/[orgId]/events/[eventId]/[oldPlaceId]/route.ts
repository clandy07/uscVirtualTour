import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { events, event_location_relations, event_room_relations } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, and, isNull} from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { getUserOrgs } from '@/app/api/utils/auth';
import { getUserOrgPermissions } from '@/app/api/utils/auth';
import {isNumber, isNumericString} from '@/app/utils'




export async function PATCH(
    request: NextRequest, 
    { params }: { params: Promise<{ orgId: string, eventId: string, oldPlaceId: string }> }){

    try {
        const pathParams = await params

        const orgId = (!isNumericString(pathParams.orgId)) ? null : parseInt(pathParams.orgId)
        const eventId = (!isNumericString(pathParams.eventId)) ? null : parseInt(pathParams.eventId)
        const oldPlaceId = (!isNumericString(pathParams.oldPlaceId)) ? null : parseInt(pathParams.oldPlaceId)

        if(eventId == null){
            return NextResponse.json(
                { error: "Provide a valid numerical value for eventId" },
                { status: 400 }
            );     
        }
        if(oldPlaceId == null){
            return NextResponse.json(
                { error: "Provide a valid numerical value for oldPlaceId" },
                { status: 400 }
            );     
        }

        const searchParams = request.nextUrl.searchParams
        let oldPlaceTypeTemp: any = searchParams.get('oldPlaceType')
        let  newPlaceTypeTemp: any = searchParams.get('newPlaceType')
        const placeTypes = ["room", "location"]

        if(!oldPlaceTypeTemp || !newPlaceTypeTemp || !placeTypes.includes(oldPlaceTypeTemp) || !placeTypes.includes(newPlaceTypeTemp)){
            return NextResponse.json(
                {
                    error: "Invalid values for either `oldPlaceType` or `newPlaceType`. Their values must be \"room\" or \"location\"."
                },
                { status: 400 }
            );
        }
        const oldPlaceType: "room" | "location" = oldPlaceTypeTemp;
        const newPlaceType: "room" | "location" = newPlaceTypeTemp;


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

        let roomId = body.roomId;
        let locationId = body.locationId;

        if ((roomId === null || roomId === undefined) && (locationId === null || roomId === undefined)){
            return NextResponse.json(
                {
                    error: "'roomId' and 'locationId' cannot be both null. Provide at least one."
                },
                { status: 400 }
            );
        }

        const eventResult = await db.select({
            eventId: events.id,
        }).from(events).where(
            and(
                eq(events.id, eventId),
                orgId === null ? isNull(events.org_id) : eq(events.org_id, orgId)
            )
        );

        if(eventResult.length <= 0){
            return NextResponse.json(
                { error: "The given organization does not have the given event." },
                { status: 404 }
            );    
        }

        
        if(oldPlaceType == "location" && newPlaceType == "location"){              
            const result = await db.update(event_location_relations).set({
                location_id: locationId
            }).where(
                and(
                    eq(event_location_relations.event_id, eventId),
                    eq(event_location_relations.location_id, oldPlaceId)
                )
            ).returning({
                eventIdUpdated: event_location_relations.event_id,
                newLocationId: event_location_relations.location_id
            });

            return NextResponse.json({ data: result[0] });
        }
        else if(oldPlaceType == "room" && newPlaceType == "room"){
            const result = await db.update(event_room_relations).set({
                room_id: roomId
            }).where(
                and(
                    eq(event_room_relations.event_id, eventId),
                    eq(event_room_relations.room_id, oldPlaceId)
                )
            ).returning({
                eventIdUpdated: event_room_relations.event_id,
                newRoomId: event_room_relations.room_id
            });

            return NextResponse.json({ data: result[0] });
        }
        else if (oldPlaceType == "room" && newPlaceType == "location"){
            const delResult = await db.delete(event_room_relations).where(
                and(
                    eq(event_room_relations.event_id, eventId),
                    eq(event_room_relations.room_id, oldPlaceId)
                )
            )
            const insertResult = await db.insert(event_location_relations).values({
                event_id: eventId,
                location_id: locationId
            }).returning({
                eventIdUpdated: event_location_relations.event_id,
                newLocationId: event_location_relations.location_id
            })
            return NextResponse.json({ data: insertResult[0] });
        }
        else{
            const delResult = await db.delete(event_location_relations).where(
                and(
                    eq(event_location_relations.event_id, eventId),
                    eq(event_location_relations.location_id, oldPlaceId)
                )
            )
            const insertResult = await db.insert(event_room_relations).values({
                event_id: eventId,
                room_id: roomId
            }).returning({
                eventIdUpdated: event_room_relations.event_id,
                newRoomId: event_room_relations.room_id
            })
            return NextResponse.json({ data: insertResult[0] });
        }
    } catch (err){
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        ); 
    }
}