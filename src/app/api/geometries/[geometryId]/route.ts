import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { geometries } from '@/db/schema';
import { requireAdmin } from '@/app/api/utils/auth';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { isNumericString } from '@/app/utils';
import { success } from 'better-auth';


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ geometryId: string; }> }
) {
    try{
        const authError = await requireAdmin(request)
        if(authError) return authError

        const {geometryId} = await params

        const geometryIdNum = isNumericString(geometryId) ? parseInt(geometryId) : null
        
        if(geometryIdNum === null){
            return NextResponse.json(
                { error: 'Invalid geometry ID' },
                { status: 400 }
            )
        }
        
        const body = await request.json()

        const result = await db.update(geometries).set({
            polygon: body.polygon
        }).where(eq(geometries.id, geometryIdNum)).returning({
            updatedGeometryId: geometries.id
        })

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch(error){
        console.error('Error updating the geometry:', error);
        return NextResponse.json(
            { error: 'Failed to update the geometry' },
            { status: 500 }
        );
    }

}


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ geometryId: string; }> }
) {
    try{
        const authError = await requireAdmin(request)
        if(authError) return authError

        const {geometryId} = await params
        const geometryIdNum = isNumericString(geometryId) ? parseInt(geometryId) : null

        if(geometryIdNum === null){
            return NextResponse.json(
                {error: 'Invalid geometry ID'},
                {status: 400}
            )
        }

        const result = await db.delete(geometries).where(
            eq(geometries.id, geometryIdNum)
        ).returning({
            deletedGeometryId: geometries.id
        })

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch(error){
        console.error('Error deleting the given geometry:', error);
        return NextResponse.json(
            { error: 'Failed to delete the given geometry' },
            { status: 500 }
        );
    }
}