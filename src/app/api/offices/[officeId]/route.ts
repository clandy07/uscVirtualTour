import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { offices } from '@/db/schema';
import { requireAdmin } from '@/app/api/utils/auth';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { isNumericString } from '@/app/utils';


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ officeId: string; }> }
) {

  try {
    const authError = await requireAdmin(request)
    if(authError) return authError

    const { officeId } = await params;
    const officeIdNum = isNumericString(officeId) ? parseInt(officeId) : null;

    if(officeIdNum === null){
        return NextResponse.json(
            {error: "Invalid office ID"},
            {status: 400}
        )
    }

    const result = await db
        .delete(offices)
        .where(eq(offices.id, officeIdNum))
        .returning({
            deletedOfficeId: offices.id
        });
 

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error deleting office:', error);
    return NextResponse.json(
      { error: 'Failed to delete office' },
      { status: 500 }
    );
  }
}



export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ officeId: string; }> }
) {

  try {
    const authError = await requireAdmin(request)
    if(authError) return authError

    const { officeId } = await params;
    const officeIdNum = isNumericString(officeId) ? parseInt(officeId) : null;

    if(officeIdNum === null){
        return NextResponse.json(
            {error: "Invalid office ID"},
            {status: 400}
        )
    }

    const body = await request.json()

    const result = await db
        .update(offices)
        .set({
            name: body.name,
            department_id: body.departmentId,
            school_id: body.schoolId
        })
        .where(eq(offices.id, officeIdNum))
        .returning({
            updatedOfficeId: offices.id
        });
 

    return NextResponse.json({
        success: true,
        data: result
    });

  } catch (error) {
    console.error('Error updating office:', error);
    return NextResponse.json(
        { error: 'Failed to update office' },
        { status: 500 }
    );
  }
}