import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { events, event_room_relations, organizations, event_location_relations, locations } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, SQL, and, ilike, or, inArray, lte, gte } from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { getUserOrgs } from '@/app/api/utils/auth';
import { getUserOrgPermissions } from '@/app/api/utils/auth';
import { isNumericString } from '@/app/utils';
import { requireAdmin } from '@/app/api/utils/auth';

// GET /orgs/:orgId/events - Get all events in a given org
export async function GET(
    request: NextRequest) {

    const authError = await requireAdmin(request);
    if (authError) return authError;
    try {        

        const result = await db.select(
            {
                id: events.id,
                name: events.name,
                description: events.description,
                date_time_start: events.date_time_start,
                date_time_end: events.date_time_end,
                // custom_marker: events.custom_marker,
                org_id: events.org_id,
                visibility: events.visibility,
                location_id: locations.id
             }
        )
        .from(event_location_relations)
        .innerJoin(events, eq(
            event_location_relations.event_id, events.id
        ))
        .innerJoin(locations, eq(
            event_location_relations.location_id, locations.id
        ))

        console.log("Events: ", result)

        return NextResponse.json({ data: result });
        
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }

}