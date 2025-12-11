import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { user_org_relations } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, SQL, and, ilike, or, inArray, lte, gte } from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { getUserOrgs } from '@/app/api/utils/auth';
import { getUserOrgPermissions } from '@/app/api/utils/auth';
import { isNumericString } from '@/app/utils';

export async function DELETE(request: NextRequest, 
    { params }: { params: Promise<{ orgId: string, userId: string }> }) {

    try {        
        const session = await checkAuth(request)
        const paramsPath = await params

        const orgId = (isNumericString(paramsPath.orgId)) ? parseInt(paramsPath.orgId) : null;
        const userId = paramsPath.userId

        if(orgId === null){
            return NextResponse.json(
                { error: "Invalid orgId" },
                { status: 400 }
            ); 
        }
        if(userId === null || userId === undefined){
            return NextResponse.json(
                { error: "Invalid userId" },
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
            else if(!userOrgPermissions?.can_remove_members){
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                );                   
            }
        }

        const result = await db.delete(user_org_relations).where(
            and(
                eq(user_org_relations.user_id, userId),
                eq(user_org_relations.org_id, orgId)
            )
        ).returning({
            userIdKicked: user_org_relations.user_id,
            orgIdKickedFrom: user_org_relations.org_id
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