import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { event_groups, event_group_location_relations, event_location_relations } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, SQL, and, ilike, or, inArray, lte, gte } from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { getUserOrgs } from '@/app/api/utils/auth';
import { getUserOrgPermissions } from '@/app/api/utils/auth';

// GET /eventGrps - Get all event groups
export async function GET(request: NextRequest) {
    try {        
        const searchParams = request.nextUrl.searchParams
        const dateTimeStart = searchParams.get('dateTimeStart')
        const dateTimeEnd = searchParams.get('dateTimeEnd')
        const name = searchParams.get('name')

        const filters: SQL[] = [];

        if(dateTimeStart) filters.push(gte(event_groups.date_time_start, new Date(dateTimeStart)));
        if(dateTimeEnd) filters.push(lte(event_groups.date_time_end, new Date(dateTimeEnd)));

        if(name) filters.push(ilike(event_groups.name, `${name}%`));

        const result = await db.select({
            id: event_groups.id,
            name: event_groups.name,
            description: event_groups.description,
            date_time_start: event_groups.date_time_start,
            date_time_end: event_groups.date_time_end,
            custom_marker: event_groups.custom_marker
        }).from(event_groups).where((filters.length > 0) ? and(...filters) : undefined);

        return NextResponse.json({ data: result });
        
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }

}


export async function POST(request: NextRequest) {
    try {        
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
            name: string, 
            description: string | null | undefined,
            dateTimeStart: Date | string,
            dateTimeEnd: Date | string | null | undefined,
            customMarker: string | null | undefined
            // locationId: number
        } = await request.json();

        const name = body.name;
        const description = body.description;
        const date_time_start = new Date(body.dateTimeStart);
        const date_time_end = (body.dateTimeEnd) ? new Date(body.dateTimeEnd) : null;
        const custom_marker = body.customMarker;
        //const locationId = body.locationId;


        const result = await db.insert(event_groups).values(
            {
                name: name,
                description: description,
                date_time_start: date_time_start,
                date_time_end: date_time_end,
                custom_marker: custom_marker
            }
        ).returning({
            insertedId: event_groups.id,
            name: event_groups.name,
            description: event_groups.description,
            dateTimeStart: event_groups.date_time_start,
            dateTimeEnd: event_groups.date_time_end,
            customMarker: event_groups.custom_marker
        })

        // const junctionResult = await db.insert(event_group_location_relations).values(
        //     {
        //         event_group_id: result[0].insertedId,
        //         location_id: locationId
        //     }
        // ).returning({
        //     insertedId: event_group_location_relations.event_group_id,
        //     insertedLocationId: event_group_location_relations.location_id
        // })

        return NextResponse.json({ data: result[0] });
        
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
