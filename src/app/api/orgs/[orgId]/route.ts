import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { organizations } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, SQL, and, ilike, or, inArray } from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { isNumericString } from '@/app/utils';


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

        const searchParams = request.nextUrl.searchParams
        const nameFilter: any = searchParams.get('name')
        const isStudentOrgFilter: any = searchParams.get('isStudentOrg')

        const filters: any = [];

        if(nameFilter) filters.push(ilike(organizations.name, nameFilter))
        if(isStudentOrgFilter) filters.push(organizations.is_student_org, isStudentOrgFilter === "true")

        const where =
            filters.length > 0
                ? and(
                    eq(organizations.id, orgId),
                    ...filters
                )
                : eq(organizations.id, orgId);

        if(userRole != "admin"){
            const result = await db.query.organizations.findMany({
                columns: {
                    name: true,
                    id: true,
                    logo: true,
                    description: true,
                    is_student_org: true
                },
                where
            })

            return NextResponse.json({data: result})
        }
        else{
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
                where
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