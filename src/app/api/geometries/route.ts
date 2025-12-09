import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { geometries } from '@/db/schema';
import { requireAdmin } from '@/app/api/utils/auth';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { success } from 'better-auth';


export async function POST(
  request: NextRequest
) {
    try{
        const authError = await requireAdmin(request)
        if(authError) return authError

        const body = await request.json()

        const result = await db.insert(geometries).values({
            polygon: body.polygon
        }).returning({
            insertedGeometryId: geometries.id
        })

        NextResponse.json({
            success: true,
            data: result[0]
        })
    } catch(error){
        console.error('Error creating a new geometry:', error)
        NextResponse.json(      
            { error: 'Failed to create a new geometry' },
            { status: 500 }
        )
    }
}