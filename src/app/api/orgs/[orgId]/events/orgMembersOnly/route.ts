import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { events } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, SQL, and, ilike, lte, gte } from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { getUserOrgs } from '@/app/api/utils/auth';

// GET /orgs/:orgId/events/orgMembersOnly - Get all events in a given org
export async function GET(
    request: NextRequest, 
    { params }: { params: Promise<{ orgId: string }> })  {

    try {
        const { orgId } = await params
        const session = await checkAuth(request)

        if(!session){
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userRole = getUserRole(session.user)
        const userOrgs = await getUserOrgs(session?.user)

        if(userRole == 'student' && !userOrgs.includes(parseInt(orgId))){
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );     
        }

        const searchParams = request.nextUrl.searchParams
        const dateTimeStart = searchParams.get('dateTimeStart')
        const dateTimeEnd = searchParams.get('dateTimeEnd')
        const name = searchParams.get('name')

        const filters: SQL[] = [];

        if(dateTimeStart) filters.push(gte(events.date_time_start, new Date(dateTimeStart)));
        if(dateTimeEnd) filters.push(lte(events.date_time_end, new Date(dateTimeEnd)));

        if(name) filters.push(ilike(events.name, `${name}%`));

        filters.push(eq(events.org_id, parseInt(orgId)));
       
        filters.push(eq(events.visibility, "only_organization_members"))
        
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


export async function POST(request: NextRequest) {

}
