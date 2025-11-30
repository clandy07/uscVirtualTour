import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { event_groups, events} from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, SQL, and, ilike, or, inArray, lte, gte } from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { getUserOrgs } from '@/app/api/utils/auth';
import { getUserOrgPermissions } from '@/app/api/utils/auth';

// GET /eventGrps/:eventGrpId/events - Get all event groups
export async function GET(request: NextRequest, { params }: { params: Promise<{ eventGrpId: string }> }) {
    try {        
        const {eventGrpId} = await params; 
        const searchParams = request.nextUrl.searchParams
        const dateTimeStart = searchParams.get('dateTimeStart')
        const dateTimeEnd = searchParams.get('dateTimeEnd')
        const name = searchParams.get('name')
        const filters: any[] = [];

        if(dateTimeStart) filters.push(gte(events.date_time_start, new Date(dateTimeStart)));
        if(dateTimeEnd) filters.push(lte(events.date_time_end, new Date(dateTimeEnd)));

        if(name) filters.push(ilike(events.name, `${name}%`));

        const session = await checkAuth(request)

        if(!session){ 
            filters.push(eq(events.visibility, "everyone"))
        }
        else if(getUserRole(session.user) == "student"){
            filters.push(inArray(events.visibility, ["everyone", "only_students"]))
            const userOrgs = await getUserOrgs(session.user) ?? []

            if(userOrgs && userOrgs.length > 0)
                filters.push(or(
                    inArray(events.visibility, ["everyone", "only_students"]),
                    and(
                        inArray(events.org_id, userOrgs),
                        eq(events.visibility, "only_organization_members")
                    )
                ) 
            );
        }

        const result = await db.select().from(events).where((filters.length > 0) ? 
            and(
                eq(events.event_group_id, parseInt(eventGrpId)),
                ...filters
            ) : undefined
        );
        
       return NextResponse.json({ data: result });
        
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }

}
