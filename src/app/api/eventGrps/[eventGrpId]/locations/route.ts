import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { event_groups, event_group_location_relations, locations } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, SQL, and, ilike, or, inArray, lte, gte } from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { getUserOrgs } from '@/app/api/utils/auth';
import { getUserOrgPermissions } from '@/app/api/utils/auth';
import { isNumericString } from '@/app/utils';

export async function POST(request: NextRequest, 
    { params }: { params: Promise<{ eventGrpId: string }> }) {
    try {        
        const session = await checkAuth(request)
        
        const paramsPath = await params;
        const eventGroupId = (isNumericString(paramsPath.eventGrpId)) ? parseInt(paramsPath.eventGrpId) : null;
        
        if(eventGroupId === null){
            return NextResponse.json(
                { error: "Invalid eventGrpId"},
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

        const body: {
            name: string, 
            description: string | null | undefined,
            dateTimeStart: Date | string,
            dateTimeEnd: Date | string | null | undefined,
            customMarker: string | null | undefined
            locationId: number
        } = await request.json();

        // const name = body.name;
        // const description = body.description;
        // const date_time_start = new Date(body.dateTimeStart);
        // const date_time_end = (body.dateTimeEnd) ? new Date(body.dateTimeEnd) : null;
        // const custom_marker = body.customMarker;
        const locationId = body.locationId;


        const result = await db.select({
            id: event_groups.id
        }).from(event_groups).where(
            eq(event_groups.id, eventGroupId)
        );

        if(result.length <= 0){
            return NextResponse.json(
                { error: "Event group of given eventGrpId does not exist."},
                { status: 404 }
            )
        }

        const junctionResult = await db.insert(event_group_location_relations).values(
            {
                event_group_id: result[0].id,
                location_id: locationId
            }
        ).returning({
            insertedId: event_group_location_relations.event_group_id,
            insertedLocationId: event_group_location_relations.location_id
        })

        return NextResponse.json({ data: junctionResult[0] });
        
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}


export async function GET(request: NextRequest, 
    { params }: { params: Promise<{ eventGrpId: string }> }) {
    try {        
        const session = await checkAuth(request)
        
        const paramsPath = await params;
        const eventGroupId = (isNumericString(paramsPath.eventGrpId)) ? parseInt(paramsPath.eventGrpId) : null;
        
        if(eventGroupId === null){
            return NextResponse.json(
                { error: "Invalid eventGrpId"},
                { status: 401}
            )
        }


        const result = await db.query.event_groups.findMany({
            columns: {
                created_at: false,
                updated_at: false
            },
            with: {
                eventGroupLocations: {
                    with: {
                        location: true
                    }
                },
            },
            where: eq(event_groups.id, eventGroupId)
        });


        return NextResponse.json({ data: result[0] });
        
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}