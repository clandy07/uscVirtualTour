import { checkAuth } from '@/app/api/utils/auth';
import { getUserOrgs } from '@/app/api/utils/auth';
import { getUserOrgPermissions } from '@/app/api/utils/auth';
import {isNumber, isNumericString} from '@/app/utils'
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { events, organizations, event_location_relations, event_room_relations } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, and, isNull} from 'drizzle-orm';
import { requireAdmin } from '@/app/api/utils/auth';


export async function DELETE(
    request: NextRequest, 
    { params }: { params: Promise<{ eventId: string }> }) {

    try {    
        const authError = await requireAdmin(request)
        if (authError) return authError


        const {eventId} = await params
        const eventIdNum = isNumericString(eventId) ? parseInt(eventId) : null;

        if(eventIdNum === null) {
            return NextResponse.json(
                { error: "Invalid event ID" },
                { status: 400 }
            )
        }

        const temp = await db.delete(events).where(eq(events.id, eventIdNum)).returning({ deletedId: events.id });
        const result = temp[0]

        return NextResponse.json({ data: temp });

    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}