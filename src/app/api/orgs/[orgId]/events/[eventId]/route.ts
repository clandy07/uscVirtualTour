import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { events } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, and,} from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { getUserOrgs } from '@/app/api/utils/auth';
import { getUserOrgPermissions } from '@/app/api/utils/auth';

// GET /orgs/:orgId/events/:eventId - Get full details of a given event in a given org
export async function GET(
    request: NextRequest, 
    { params }: { params: Promise<{ orgId: string, eventId: string }> }) {

    try {        
        const { orgId, eventId } = await params

        const event = await db.select({eventId: events.id, eventVisibility: events.visibility}).from(events).where(
            and(
                eq(events.id, parseInt(eventId)),
                eq(events.org_id, parseInt(orgId))
            )
        )

        // if (event.length <= 0){
        //     return NextResponse.json({ data: [] });
        // }

        const {eventVisibility} = event[0]

        const session = await checkAuth(request)
        if(!session && eventVisibility != "everyone"){ 
            // code block runs if a guest tried to get the campus of an event not visible to them
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        else if(session && eventVisibility != "everyone"){
            // there is a valid session 
            const userRole = getUserRole(session.user)
            const userOrgs = getUserOrgs(session.user)
            if (userRole == "student" && eventVisibility == "only_organization_members" && !(await userOrgs).includes(parseInt(orgId))){
                // code block runs if the student tried to get the campus of an event only visible to members of an org they are not part of
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                ); 
            }
        }

        const result = await db.select().from(events).where(eq(events.id, parseInt(eventId)))
    
        return NextResponse.json({ data: result });
        
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }

}


export async function DELETE(
    request: NextRequest, 
    { params }: { params: Promise<{ orgId: string, eventId: string }> }) {

    const {orgId, eventId} = await params

    const session = await checkAuth(request)
    if(!session){
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );        
    }

    const userOrgs = await getUserOrgs(session.user)
    const userRole = getUserRole(session.user)

    if(userRole == "student" && !userOrgs.includes(parseInt(orgId))){
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );     
    }
    else if(userRole == "student"){
        const {can_post_events} = await getUserOrgPermissions(session.user, parseInt(orgId))
        if(!can_post_events){
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );       
        }
    }

    

}