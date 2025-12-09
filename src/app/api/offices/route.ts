import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { campuses, buildings, rooms, geometries, offices } from '@/db/schema';
import { requireAdmin } from '@/app/api/utils/auth';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { isNumericString } from '@/app/utils';
import { SQL } from 'drizzle-orm';
import { off } from 'process';
import { success } from 'better-auth';



export async function GET(
  request: NextRequest
) {

  try {
    const searchParams = request.nextUrl.searchParams
    const schoolFilter = searchParams.get('schoolId')
    const departmentFilter = searchParams.get('departmentId')

    const filters: SQL[] = [];

    if(schoolFilter){
        const schoolIdNum = isNumericString(schoolFilter) ? parseInt(schoolFilter) : null
        if(schoolIdNum != null){
            filters.push(eq(offices.school_id, schoolIdNum))
        }
    }
    if(departmentFilter){
        const departmentIdNum = isNumericString(departmentFilter) ? parseInt(departmentFilter) : null
        if(departmentIdNum != null){
            filters.push(eq(offices.department_id, departmentIdNum))
        }
    }


    const result = await db
        .select()
        .from(offices)
        .where(
            (filters.length > 0) ? and(...filters) : undefined
        );


    return NextResponse.json({
        success: true,
        data: result
    });
    
  } catch (error) {
    console.error('Error getting offices:', error);
    return NextResponse.json(
      { error: 'Failed to get offices' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
) {

  try {
    const authError = await requireAdmin(request)
    if(authError) return authError

    const body = await request.json()

    const result = await db.insert(offices).values({
        name: body.name,
        department_id: body.departmentId,
        school_id: body.schoolId
    }).returning({
        insertedOfficeId: offices.id
    })

    return NextResponse.json({
        success: true,
        data: result
    })
    
  } catch (error) {
    console.error('Error inserting the office:', error);
    return NextResponse.json(
        { error: 'Failed to insert the office' },
        { status: 500 }
    );
  }
}