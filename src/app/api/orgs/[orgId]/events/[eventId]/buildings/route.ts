import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { events } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, SQL, and, ilike, or, inArray } from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { getUserOrgs } from '@/app/api/utils/auth';

// GET /orgs/:orgId/events/:eventId/buildings - Get all buildings in a given event of a given org
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

        if (event.length <= 0){
            return NextResponse.json({ data: [] });
        }

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

        const result = await db.query.events.findMany({
            columns: {
                id: true,
                name: true,
                org_id: true,
            },
            where: (events, { eq }) => (eq(events.id, parseInt(eventId))),
            with: {
                
                eventLocations: {
                    with: {
                        location: {
                            with: {
                                building: {
                                    columns: {
                                        created_at: false,
                                        updated_at: false
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
    
        return NextResponse.json({ data: result });
        
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }

}