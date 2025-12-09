import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { schools } from '@/db/schema';
import { requireAdmin } from '@/app/api/utils/auth';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { isNumericString } from '@/app/utils';


export async function GET(
  request: NextRequest
) {

  try {
    const result = await db
        .select({
            id: schools.id,
            name: schools.name
        })
        .from(schools);
        
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting schools:', error);
    return NextResponse.json(
      { error: 'Failed to get schools' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
) {

  try {
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
