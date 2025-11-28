import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { events } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, SQL, and, ilike, or, inArray } from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { getUserOrgs } from '@/app/api/utils/auth';

// GET /orgs/:orgId/events - Get all events in a given org
export async function GET(request: NextRequest, ctx: RouteContext<'/api/orgs/[orgId]/events'>) {
    const session = await checkAuth(request)
    if(!session){
        return NextResponse.json({})
    }
    const userRole = getUserRole(session.user)
    
    const { orgId } = await ctx.params
    const searchParams = request.nextUrl.searchParams
    const dateTimeStart = searchParams.get('date_time_start')
    const dateTimeEnd = searchParams.get('date_time_end')
    const name = searchParams.get('name')

    const filters: SQL[] = [];

    if(dateTimeStart) filters.push(eq(events.date_time_start, dateTimeStart));
    if(dateTimeEnd) filters.push(eq(events.date_time_end, dateTimeEnd));

    if(name) filters.push(ilike(events.name, `${name}%`));

    filters.push(eq(events.org_id, parseInt(orgId)));
    if(userRole === 'guest'){ 
        filters.push(eq(events.visibility, "everyone"))
    }
    if(userRole === 'student'){
        const userOrgs = (await getUserOrgs(session.user)) ?? []; // make sure it's an array

        // build an array of SQL clauses (no undefined values)
        const visibilityClauses: SQL[] = [
            eq(events.visibility, "everyone"),
            eq(events.visibility, "only_students"),
        ];

        // only add the organization-members clause when userOrgs is non-empty
        if (userOrgs.length > 0) {
            visibilityClauses.push(
            and(
                eq(events.visibility, "only_organization_members"),
                inArray(events.org_id, userOrgs)
            )
            );
        }

        // now spread the array into or(...) — guaranteed no undefined
        filters.push(or(...visibilityClauses));
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
}


export async function POST(request: NextRequest) {

}
