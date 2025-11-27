import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { locations, buildings } from '@/db/schema';
import { requireAdmin } from '../../../../utils/auth';
import { eq } from 'drizzle-orm';

// PATCH /api/campuses/:campusId/locations/:locationId - Update a location (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ campusId: string; locationId: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { campusId, locationId } = await params;
    const campusIdNum = parseInt(campusId);
    const locationIdNum = parseInt(locationId);

    if (isNaN(campusIdNum) || isNaN(locationIdNum)) {
      return NextResponse.json(
        { error: 'Invalid campus or location ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, category, description, latitude, longitude, floor_count, basement_count } = body;

    // Build update object for location
    const locationUpdateData: any = {};
    if (name !== undefined) locationUpdateData.name = name;
    if (category !== undefined) locationUpdateData.category = category;
    if (description !== undefined) locationUpdateData.description = description;
    if (latitude !== undefined) locationUpdateData.latitude = latitude;
    if (longitude !== undefined) locationUpdateData.longitude = longitude;

    if (Object.keys(locationUpdateData).length === 0 && floor_count === undefined && basement_count === undefined) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Update location
    let updatedLocation = null;
    if (Object.keys(locationUpdateData).length > 0) {
      [updatedLocation] = await db
        .update(locations)
        .set(locationUpdateData)
        .where(eq(locations.id, locationIdNum))
        .returning();

      if (!updatedLocation) {
        return NextResponse.json(
          { error: 'Location not found' },
          { status: 404 }
        );
      }
    } else {
      // Fetch location even if not updating it
      [updatedLocation] = await db
        .select()
        .from(locations)
        .where(eq(locations.id, locationIdNum));
    }

    // Check if there's an associated building and update it if needed
    let updatedBuilding = null;
    const [existingBuilding] = await db
      .select()
      .from(buildings)
      .where(eq(buildings.location_id, locationIdNum));

    if (existingBuilding) {
      const buildingUpdateData: any = {};
      if (name !== undefined) buildingUpdateData.name = name;
      if (floor_count !== undefined) buildingUpdateData.floor_count = floor_count;
      if (basement_count !== undefined) buildingUpdateData.basement_count = basement_count;

      if (Object.keys(buildingUpdateData).length > 0) {
        [updatedBuilding] = await db
          .update(buildings)
          .set(buildingUpdateData)
          .where(eq(buildings.id, existingBuilding.id))
          .returning();
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        location: updatedLocation,
        building: updatedBuilding
      }
    });
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

// DELETE /api/campuses/:campusId/locations/:locationId - Delete a location and its associated building (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ campusId: string; locationId: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { campusId, locationId } = await params;
    const campusIdNum = parseInt(campusId);
    const locationIdNum = parseInt(locationId);

    if (isNaN(campusIdNum) || isNaN(locationIdNum)) {
      return NextResponse.json(
        { error: 'Invalid campus or location ID' },
        { status: 400 }
      );
    }

    // Check if there's an associated building and delete it first
    const [existingBuilding] = await db
      .select()
      .from(buildings)
      .where(eq(buildings.location_id, locationIdNum));

    if (existingBuilding) {
      await db
        .delete(buildings)
        .where(eq(buildings.id, existingBuilding.id));
    }

    // Delete the location
    const [deletedLocation] = await db
      .delete(locations)
      .where(eq(locations.id, locationIdNum))
      .returning();

    if (!deletedLocation) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Location and associated building deleted successfully',
      data: deletedLocation
    });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    );
  }
}