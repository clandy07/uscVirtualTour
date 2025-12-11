import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { user_org_relations } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, SQL, and, ilike, or, inArray, lte, gte } from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { getUserOrgs } from '@/app/api/utils/auth';
import { getUserOrgPermissions } from '@/app/api/utils/auth';
import { isNumericString } from '@/app/utils';

export async function POST(request: NextRequest, 
    { params }: { params: Promise<{ orgId: string }> }) {

    try {        
        const session = await checkAuth(request)
        const paramsPath = await params

        const orgId = (isNumericString(paramsPath.orgId)) ? parseInt(paramsPath.orgId) : null;

        if(orgId === null){
            return NextResponse.json(
                { error: "Invalid orgId" },
                { status: 400 }
            ); 
        }

        if(!session){
            // code block runs if a guest tried to post an event
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userOrgs = await getUserOrgs(session.user)
        const userRole = getUserRole(session.user)
        const userOrgPermissions = userOrgs.includes(orgId) ? (await getUserOrgPermissions(session.user, orgId)) : null;

        if(userRole == "student"){
            if(!userOrgs.includes(orgId)){
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                );      
            }
            else if(!userOrgPermissions?.can_add_members){
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                );                   
            }
        }

        const body: { 
            userIdToAdd: string 
            canPostEvents: boolean,
            canAddMembers: boolean,
            canRemoveMembers: boolean,
            canSetMemberPermissions: boolean
        } = await request.json();

        const result = await db.insert(user_org_relations).values({
            user_id: body.userIdToAdd,
            org_id: orgId,
            can_post_events: body.canPostEvents,
            can_add_members: body.canAddMembers,
            can_remove_members: body.canRemoveMembers,
            can_set_member_permissions: body.canSetMemberPermissions
        }).returning({
            newMemberUsrId: user_org_relations.user_id,
            orgId: user_org_relations.org_id,
            canPostEvents: user_org_relations.can_post_events,
            canAddMembers: user_org_relations.can_add_members,
            canRemoveMembers: user_org_relations.can_remove_members,
            canSetMemberPermissions: user_org_relations.can_set_member_permissions       
        });

        return NextResponse.json({ data: result[0] });
        
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    } 
}