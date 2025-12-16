import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { organizations } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, SQL, and, ilike, or, inArray } from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { isNumericString } from '@/app/utils';
import { getUserOrgs } from '@/app/api/utils/auth';


export async function GET(request: NextRequest, {params}: { params: Promise<{ orgId: string }> } ) {

    try {        
        const session = await checkAuth(request)
        const userRole = !session ? "guest" : getUserRole(session.user)

        const paramsPath = await params
        const orgId = (isNumericString(paramsPath.orgId)) ? parseInt(paramsPath.orgId) : null

        if(orgId === null){
            return NextResponse.json(
                {error: "orgId has to be numeric"},
                {status: 400}
            )
        }

        if(!session || (session && userRole == "student" && !(await getUserOrgs(session.user)).includes(orgId))){
            const result = await db.query.organizations.findMany({
                columns: {
                    name: true,
                    id: true,
                    logo: true,
                    description: true,
                    is_student_org: true
                },
                where: eq(organizations.id, orgId)
            })

            return NextResponse.json({data: result})
        }
        else if (userRole == "admin" || (userRole == "student" && (await getUserOrgs(session.user)).includes(orgId))){
            const result = await db.query.organizations.findMany({
                columns: {
                    name: true,
                    id: true,
                    logo: true,
                    description: true,
                    is_student_org: true
                },
                with: {
                    userOrgs: {
                        with: {
                            user: {
                                columns: {
                                    id: true,
                                    email: true,
                                    first_name: true,
                                    last_name: true,
                                    username: true
                                }
                            }
                        }
                    }
                },
                where: eq(organizations.id, orgId)
            })  

            return NextResponse.json({data: result})
        }
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
    {params}: { params: Promise<{ orgId: string }> } 
) {

    try {        
        const session = await checkAuth(request)
        const paramsPath = await params
        const orgId = (isNumericString(paramsPath.orgId)) ? parseInt(paramsPath.orgId) : null
        
        if(orgId === null){
            return NextResponse.json(
                {error: "orgId has to be numeric"},
                {status: 400}
            )
        }

        if(!session){
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );     
        }
        const userRole = getUserRole(session.user)
        if(userRole != "admin"){
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );                
        }

        const result = await db.delete(organizations).where(
            eq(organizations.id, orgId)
        )

        return NextResponse.json({data: result})
    
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }

}