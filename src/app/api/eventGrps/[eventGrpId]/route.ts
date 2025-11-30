import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { event_groups, events} from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, SQL, and, ilike, or, inArray, lte, gte } from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { getUserOrgs } from '@/app/api/utils/auth';
import { getUserOrgPermissions } from '@/app/api/utils/auth';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ eventGrpId: string }> }) {
    try {        
        const session = await checkAuth(request)
        const {eventGrpId} = await params
        
        if(!eventGrpId){
            return NextResponse.json(
                { error: "eventGrpId must be a valid number" },
                { status: 400 }
            );         
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
        } = await request.json();

        const name = body.name;
        const description = body.description;
        const date_time_start = new Date(body.dateTimeStart);
        const date_time_end = (body.dateTimeEnd) ? new Date(body.dateTimeEnd) : null;
        const custom_marker = body.customMarker;


        const result = await db.update(event_groups).set(
            {
                name: name,
                description: description,
                date_time_start: date_time_start,
                date_time_end: date_time_end,
                custom_marker: custom_marker
            }
        ).where(
            eq(event_groups.id, parseInt(eventGrpId))
        ).returning({
            updatedId: event_groups.id,
            description: event_groups.description,
            dateTimeStart: event_groups.date_time_start,
            dateTimeEnd: event_groups.date_time_end,
            customMarker: event_groups.custom_marker
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ eventGrpId: string }> }) {
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
        } = await request.json();

        const name = body.name;
        const description = body.description;
        const date_time_start = new Date(body.dateTimeStart);
        const date_time_end = (body.dateTimeEnd) ? new Date(body.dateTimeEnd) : null;
        const custom_marker = body.customMarker;


        const result = await db.insert(event_groups).values(
            {
                name: name,
                description: description,
                date_time_start: date_time_start,
                date_time_end: date_time_end,
                custom_marker: custom_marker
            }
        ).returning({
            insertedId: event_groups.id
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