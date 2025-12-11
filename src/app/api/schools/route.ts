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
    const authError = await requireAdmin(request)
    if(authError) return authError
    
    const body = await request.json()

    const result = await db
        .insert(schools)
        .values({
            name: body.name
        })
        .returning({
            insertedSchoolId: schools.id
        });
 

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error inserting the school:', error);
    return NextResponse.json(
      { error: 'Failed to insert the school' },
      { status: 500 }
    );
  }
}
