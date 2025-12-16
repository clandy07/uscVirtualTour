import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { user_org_relations, users, organizations, schema } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, SQL, and, ilike, or, inArray, lte, gte } from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { getUserOrgs } from '@/app/api/utils/auth';
import { getUserOrgPermissions } from '@/app/api/utils/auth';
import { isNumericString } from '@/app/utils';
import { email } from 'better-auth';
import { username } from 'better-auth/plugins';

// GET /users
export async function GET(request: NextRequest,
    { params }: { params: Promise<{ id: string }>}) {
    try {        
        const session = await checkAuth(request)
        if(!session){
            return NextResponse.json(
                {error: "Unauthorized"},
                {status: 401}
            )
        }
        const userRole = getUserRole(session.user)

        const {id} = await params
        if(userRole == "student" && session.user.id != id){
            return NextResponse.json(
                {error: "Unauthorized"},
                {status: 401}
            )
        }

        const result = await db.query.users.findFirst({
            columns: {
                id: true,
                email: true,
                username: true,
                first_name: true,
                mid_name: true,
                last_name: true,
                email_verified: true,
                is_admin: true,
                created_at: true
            },
            with: {
                userOrgs: {
                    with: {
                        organization: true
                    }
                }
            },
            where: eq(users.id, id)
        });

        return NextResponse.json({ data: result }, { status: 200 });

        
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }

}