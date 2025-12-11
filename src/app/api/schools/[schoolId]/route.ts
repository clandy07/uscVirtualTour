import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { schools } from '@/db/schema';
import { requireAdmin } from '@/app/api/utils/auth';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { isNumericString } from '@/app/utils';


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; }> }
) {

  try {
    const authError = await requireAdmin(request)
    if(authError) return authError

    const { schoolId } = await params;
    const schoolIdNum = isNumericString(schoolId) ? parseInt(schoolId) : null;

    if(schoolIdNum === null){
        return NextResponse.json(
            {error: "Invalid school ID"},
            {status: 400}
        )
    }

    const result = await db
        .delete(schools)
        .where(eq(schools.id, schoolIdNum))
        .returning({
            deletedSchoolId: schools.id
        });
 

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error deleting school:', error);
    return NextResponse.json(
      { error: 'Failed to delete school' },
      { status: 500 }
    );
  }
}



export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; }> }
) {

  try {
    const authError = await requireAdmin(request)
    if(authError) return authError

    const { schoolId } = await params;
    const schoolIdNum = isNumericString(schoolId) ? parseInt(schoolId) : null;

    if(schoolIdNum === null){
        return NextResponse.json(
            {error: "Invalid school ID"},
            {status: 400}
        )
    }

    const body = await request.json()

    const result = await db
        .update(schools)
        .set({
            name: body.name
        })
        .where(eq(schools.id, schoolIdNum))
        .returning({
            updatedSchoolId: schools.id
        });
 

    return NextResponse.json({
        success: true,
        data: result
    });

  } catch (error) {
    console.error('Error updating school:', error);
    return NextResponse.json(
        { error: 'Failed to update school' },
        { status: 500 }
    );
  }
}