import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { buildings, locations } from '@/db/schema';
import { requireAdmin } from '../../../../utils/auth';
import { eq } from 'drizzle-orm';

// PATCH /api/campuses/:campusId/buildings/:buildingId - Update a building (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ campusId: string; buildingId: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { campusId, buildingId } = await params;
    const campusIdNum = parseInt(campusId);
    const buildingIdNum = parseInt(buildingId);

    if (isNaN(campusIdNum) || isNaN(buildingIdNum)) {
      return NextResponse.json(
        { error: 'Invalid campus or building ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, floor_count, basement_count, latitude, longitude, description } = body;

    // Build update object for building
    const buildingUpdateData: any = {};
    if (name !== undefined) buildingUpdateData.name = name;
    if (floor_count !== undefined) buildingUpdateData.floor_count = floor_count;
    if (basement_count !== undefined) buildingUpdateData.basement_count = basement_count;

    if (Object.keys(buildingUpdateData).length === 0 && latitude === undefined && longitude === undefined && description === undefined) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Get the building first
    const [building] = await db
      .select()
      .from(buildings)
      .where(eq(buildings.id, buildingIdNum));

    if (!building) {
      return NextResponse.json(
        { error: 'Building not found' },
        { status: 404 }
      );
    }

    // Update building
    let updatedBuilding = null;
    if (Object.keys(buildingUpdateData).length > 0) {
      [updatedBuilding] = await db
        .update(buildings)
        .set(buildingUpdateData)
        .where(eq(buildings.id, buildingIdNum))
        .returning();
    } else {
      updatedBuilding = building;
    }

    // Update associated location if it exists and has relevant fields
    let updatedLocation = null;
    if (building.location_id) {
      const locationUpdateData: any = {};
      if (name !== undefined) locationUpdateData.name = name;
      if (latitude !== undefined) locationUpdateData.latitude = latitude;
      if (longitude !== undefined) locationUpdateData.longitude = longitude;
      if (description !== undefined) locationUpdateData.description = description;

      if (Object.keys(locationUpdateData).length > 0) {
        [updatedLocation] = await db
          .update(locations)
          .set(locationUpdateData)
          .where(eq(locations.id, building.location_id))
          .returning();
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        building: updatedBuilding,
        location: updatedLocation
      }
    });
  } catch (error) {
    console.error('Error updating building:', error);
    return NextResponse.json(
      { error: 'Failed to update building' },
      { status: 500 }
    );
  }
}

// DELETE /api/campuses/:campusId/buildings/:buildingId - Delete a building and optionally its location (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ campusId: string; buildingId: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { campusId, buildingId } = await params;
    const campusIdNum = parseInt(campusId);
    const buildingIdNum = parseInt(buildingId);

    if (isNaN(campusIdNum) || isNaN(buildingIdNum)) {
      return NextResponse.json(
        { error: 'Invalid campus or building ID' },
        { status: 400 }
      );
    }

    // Get the building first to find its location_id
    const [building] = await db
      .select()
      .from(buildings)
      .where(eq(buildings.id, buildingIdNum));

    if (!building) {
      return NextResponse.json(
        { error: 'Building not found' },
        { status: 404 }
      );
    }

    // Delete the building
    await db
      .delete(buildings)
      .where(eq(buildings.id, buildingIdNum));

    // If building had an associated location, delete it too
    if (building.location_id) {
      await db
        .delete(locations)
        .where(eq(locations.id, building.location_id));
    }

    return NextResponse.json({
      success: true,
      message: 'Building and associated location deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting building:', error);
    return NextResponse.json(
      { error: 'Failed to delete building' },
      { status: 500 }
    );
  }
}
