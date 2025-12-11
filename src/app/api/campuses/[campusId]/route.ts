import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { campuses } from '@/db/schema';
import { requireAdmin } from '../../utils/auth';
import { eq } from 'drizzle-orm';

// PATCH /api/campuses/:campusId - Update a campus (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ campusId: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { campusId } = await params;
    const campusIdNum = parseInt(campusId);

    if (isNaN(campusIdNum)) {
      return NextResponse.json(
        { error: 'Invalid campus ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, address } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const [updatedCampus] = await db
      .update(campuses)
      .set(updateData)
      .where(eq(campuses.id, campusIdNum))
      .returning();

    if (!updatedCampus) {
      return NextResponse.json(
        { error: 'Campus not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCampus
    });
  } catch (error) {
    console.error('Error updating campus:', error);
    return NextResponse.json(
      { error: 'Failed to update campus' },
      { status: 500 }
    );
  }
}

// DELETE /api/campuses/:campusId - Delete a campus (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ campusId: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { campusId } = await params;
    const campusIdNum = parseInt(campusId);

    if (isNaN(campusIdNum)) {
      return NextResponse.json(
        { error: 'Invalid campus ID' },
        { status: 400 }
      );
    }

    const [deletedCampus] = await db
      .delete(campuses)
      .where(eq(campuses.id, campusIdNum))
      .returning();

    if (!deletedCampus) {
      return NextResponse.json(
        { error: 'Campus not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Campus deleted successfully',
      data: deletedCampus
    });
  } catch (error) {
    console.error('Error deleting campus:', error);
    return NextResponse.json(
      { error: 'Failed to delete campus' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campusId: string }> }
) {

  try {
    const { campusId } = await params;
    const campusIdNum = parseInt(campusId);

    if (isNaN(campusIdNum)) {
      return NextResponse.json(
        { error: 'Invalid campus ID' },
        { status: 400 }
      );
    }

    const result = await db.select({
      id: campuses.id,
      name: campuses.name,
      address: campuses.address
    }).from(campuses).where(eq(campuses.id, campusIdNum));

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting campuses:', error);
    return NextResponse.json(
      { error: 'Failed to get campuses' },
      { status: 500 }
    );
  }
}
