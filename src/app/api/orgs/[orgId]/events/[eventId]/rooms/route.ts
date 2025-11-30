import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { events, event_room_relations } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, SQL, and, ilike, or, inArray } from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { getUserOrgs } from '@/app/api/utils/auth';
import { getUserOrgPermissions } from '@/app/api/utils/auth';

// POST /orgs/:orgId/events/:eventId/rooms - Get all locations in a given event of a given org
export async function POST(
    request: NextRequest, 
    { params }: { params: Promise<{ orgId: string, eventId: string }> }) {

    try {        
        const { orgId, eventId } = await params

        if (isNaN(parseInt(eventId))){
            return NextResponse.json(
                { error: "Invalid eventId: Make sure eventId is a number." },
                { status: 400 }
            );
        }

        const event = await db.select({
            eventIdQueried: events.id, 
            eventVisibility: events.visibility,
            eventOrgId: events.org_id
        }).from(events).where(
            and(
                eq(events.id, parseInt(eventId)),
                eq(events.org_id, parseInt(orgId))
            )
        )

        if (event.length <= 0){
            return NextResponse.json(
                { error: "Invalid eventId: event does not exist." },
                { status: 400 }
            );
        }

        const {eventVisibility, eventOrgId, eventIdQueried} = event[0]

        const session = await checkAuth(request)
        if(!session){ 
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        else if(getUserRole(session.user) == "student" && eventOrgId != null){
            const userOrgs = await getUserOrgs(session.user)
            const studentOrgPermissions = await getUserOrgPermissions(session.user, eventOrgId)
            if (!userOrgs.includes(eventOrgId) || !studentOrgPermissions.can_post_events){
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                ); 
            }
        }
        else if (eventOrgId != null){
            // if this code block is run, it means the user was an admin. admins can't post events for an organization in the database
            // because it is assumed that whenever an admin posts an event, it is an event held by the school administration itself.

            // admins can't edit posts that were made by non-admin users hence why they get this error if they try do so
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            ); 
        }

        const body: {
            roomId: any
        } = await request.json();

        if(isNaN(body.roomId) || body.roomId == null){
            return NextResponse.json(
                { error: "Invalid roomId: roomId should be a number" },
                { status: 400 }
            );          
        }

        const result = await db.insert(event_room_relations).values({
            event_id: parseInt(eventId),
            room_id: (typeof body.roomId == "string") ? parseInt(body.roomId) : body.roomId
        }).returning(
            {
                eventIdInserted: event_room_relations.event_id,
                roomIdInserted: event_room_relations.room_id
            }
        );
    
        return NextResponse.json({ data: result[0] });
        
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }

}