import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { event_groups, event_room_relations, event_location_relations } from '@/db/schema';
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

        if(filters.length > 0){
            const result = await db.select({
                id: event_groups.id,
                name: event_groups.name,
                description: event_groups.description,
                date_time_start: event_groups.date_time_start,
                date_time_end: event_groups.date_time_end,
                custom_marker: event_groups.custom_marker
            }).from(event_groups).where(and(...filters));

            return NextResponse.json({ data: result });
        }
        else{
            const result = await db.select({
                id: event_groups.id,
                name: event_groups.name,
                description: event_groups.description,
                date_time_start: event_groups.date_time_start,
                date_time_end: event_groups.date_time_end,
                custom_marker: event_groups.custom_marker
            }).from(event_groups);

            return NextResponse.json({ data: result });
        }
        
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


}
