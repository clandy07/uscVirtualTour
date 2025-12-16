import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { organizations } from '@/db/schema';
import { getUserRole } from '@/app/api/utils/auth';
import { eq, SQL, and, ilike, or, inArray } from 'drizzle-orm';
import { checkAuth } from '@/app/api/utils/auth';
import { isNumericString } from '@/app/utils';


export async function GET(request: NextRequest) {

    try {        
        const session = await checkAuth(request)

        const searchParams = request.nextUrl.searchParams
        const nameFilter: any = searchParams.get('name')
        const isStudentOrgFilter: any = searchParams.get('isStudentOrg')

        const filters: any = [];

        if(nameFilter) filters.push(ilike(organizations.name, nameFilter))
        if(isStudentOrgFilter) filters.push(organizations.is_student_org, isStudentOrgFilter === "true")

        const where =
            filters.length > 0
                ? and(...filters)
                : undefined;

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
    
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }

}

export async function POST(request: NextRequest) {

    try {        
        const session = await checkAuth(request)

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

        const body = await request.json()

        const result = await db.insert(organizations).values({
            name: body.name,
            description: body.description,
            logo: body.logo,
            is_student_org: body.is_student_org
        }).returning({
            insertedOrgId: organizations.id,
            name: organizations.name,
            description: organizations.description,
            logo: organizations.logo,
            is_student_org: organizations.is_student_org
        })

        return NextResponse.json({data: result})
    
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }

}