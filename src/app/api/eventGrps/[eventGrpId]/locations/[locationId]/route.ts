import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { event_group_location_relations } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, and } from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { isNumericString } from '@/app/utils';

export async function DELETE(request: NextRequest, 
    { params }: { params: Promise<{ eventGrpId: string, locationId: string }> }) {
    try {        
        const session = await checkAuth(request)
        
        const paramsPath = await params;
        const eventGroupId = (isNumericString(paramsPath.eventGrpId)) ? parseInt(paramsPath.eventGrpId) : null;
        const locationId = (isNumericString(paramsPath.locationId)) ? parseInt(paramsPath.locationId) : null;

        if(eventGroupId === null || locationId === null){
            return NextResponse.json(
                { error: "eventGrpId and locationId must be numerical"},
                { status: 401}
            )
        }

        if(!session){
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );     
        }
        const userRole = getUserRole(session.user)
        if(userRole != "admin"){
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );                
        }

        const result = await db.delete(event_group_location_relations).where(
            and(
                eq(event_group_location_relations.event_group_id, eventGroupId),
                eq(event_group_location_relations.location_id, locationId)
            )
        ).returning({
            eventGroupId: event_group_location_relations.event_group_id,
            locationId: event_group_location_relations.location_id
        })

        return NextResponse.json({ data: result[0] });
        
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
    { params }: { params: Promise<{ eventGrpId: string; locationId: string }> }){

    try {
        const pathParams = await params

        const eventGroupId = (!isNumericString(pathParams.eventGrpId)) ? null : parseInt(pathParams.eventGrpId)
        const oldLocationId = (!isNumericString(pathParams.locationId)) ? null : parseInt(pathParams.locationId)

        if(eventGroupId == null){
            return NextResponse.json(
                { error: "Provide a valid numerical value for eventGroupId" },
                { status: 400 }
            );     
        }
        if(oldLocationId == null){
            return NextResponse.json(
                { error: "Provide a valid numerical value for oldLocationId" },
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

        const userRole = getUserRole(session.user)

        if(userRole != "admin"){
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );          
        }


        const body: {
            locationId: any
        } = await request.json();

        const locationId = isNumericString(body.locationId) ? parseInt(body.locationId) : null;

        if (locationId === null){
            return NextResponse.json(
                {
                    error: "'locationId' cannot be null."
                },
                { status: 400 }
            );
        }

        const result = await db.update(event_group_location_relations).set({
            location_id: locationId
        }).where(
            and(
                eq(event_group_location_relations.event_group_id, eventGroupId),
                eq(event_group_location_relations.location_id, oldLocationId)
            )
        ).returning({
            eventGroupId: event_group_location_relations.event_group_id,
            locationId: event_group_location_relations.location_id
        })

        if(result.length <= 0){
            return NextResponse.json(
                { error: "No event group with given eventGrpId had a location with given oldLocationId exists." },
                { status: 404 }
            );    
        }
    
        return NextResponse.json({
            data: result[0]
        })

    } catch (err){
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        ); 
    }
}