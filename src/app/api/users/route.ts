import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { users } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, SQL, and, ilike, or, inArray, lte, gte } from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { getUserOrgs } from '@/app/api/utils/auth';
import { getUserOrgPermissions } from '@/app/api/utils/auth';
import { isNumericString } from '@/app/utils';

// GET /users
export async function GET(request: NextRequest) {
    try {        
        const session = await checkAuth(request)
        if(!session){
            return NextResponse.json(
                {error: "Unauthorized"},
                {status: 401}
            )
        }
        const userRole = getUserRole(session.user)

        if(userRole == "student"){
            const userOrgs = await getUserOrgs(session.user)
            if (userOrgs.length > 0){
                const canAddMembersList = await Promise.all(
                    userOrgs.map(async (userOrg) => {
                        const perms = await getUserOrgPermissions(session.user, userOrg);
                        return perms.can_add_members;
                    })
                );

                if(!canAddMembersList.includes(true)){
                    return NextResponse.json(
                        {error: "Unauthorized"},
                        {status: 401}
                    ) 
                }
            }
            else{
                return NextResponse.json(
                    {error: "Unauthorized"},
                    {status: 401}
                )                
            }
        }

        const searchParams = request.nextUrl.searchParams;

        const firstName = searchParams.get("firstName");
        const lastName = searchParams.get("lastName");
        const username = searchParams.get("username");

        const filters = [];

        if (firstName) filters.push(ilike(users.first_name, `${firstName}%`));
        if (lastName) filters.push(ilike(users.last_name, `${lastName}%`));
        if (username) filters.push(ilike(users.username, `${username}%`));

        const result = await db
        .select({
            id: users.id,
            firstName: users.first_name,
            lastName: users.last_name,
            username: users.username,
            email: users.email,
        })
        .from(users)
        .where(filters.length > 0 ? and(...filters) : undefined);

        return NextResponse.json({ data: result }, { status: 200 });
        
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }

}