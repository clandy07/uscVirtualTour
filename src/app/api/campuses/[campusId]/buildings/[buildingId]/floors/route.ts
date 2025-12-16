import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { buildings } from '@/db/schema';
import { requireAdmin } from '../../../../../utils/auth';
import { eq } from 'drizzle-orm';

// GET /api/campuses/:campusId/buildings/:buildingId/floors - Get floor data for a building
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campusId: string; buildingId: string }> }
) {
  try {
    const { buildingId } = await params;
    const buildingIdNum = parseInt(buildingId);

    if (isNaN(buildingIdNum)) {
      return NextResponse.json(
        { error: 'Invalid building ID' },
        { status: 400 }
      );
    }

    const [building] = await db
      .select({
        id: buildings.id,
        name: buildings.name,
        floor_data: buildings.floor_data,
        floor_count: buildings.floor_count,
        basement_count: buildings.basement_count,
      })
      .from(buildings)
      .where(eq(buildings.id, buildingIdNum));

    if (!building) {
      return NextResponse.json(
        { error: 'Building not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        building_id: building.id,
        building_name: building.name,
        floor_count: building.floor_count,
        basement_count: building.basement_count,
        floor_data: building.floor_data || {}
      }
    });
  } catch (error) {
    console.error('Error fetching floor data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch floor data' },
      { status: 500 }
    );
  }
}

// PATCH /api/campuses/:campusId/buildings/:buildingId/floors - Update floor data for a building (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ campusId: string; buildingId: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { buildingId } = await params;
    const buildingIdNum = parseInt(buildingId);

    if (isNaN(buildingIdNum)) {
      return NextResponse.json(
        { error: 'Invalid building ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { floor_number, kmlUrl, embedUrl, center, zoom, virtualTour } = body;

    if (floor_number === undefined) {
      return NextResponse.json(
        { error: 'floor_number is required' },
        { status: 400 }
      );
    }

    if (!center || !center.lat || !center.lng) {
      return NextResponse.json(
        { error: 'center with lat and lng is required' },
        { status: 400 }
      );
    }

    if (zoom === undefined) {
      return NextResponse.json(
        { error: 'zoom is required' },
        { status: 400 }
      );
    }

    // Get current building
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

    // Prepare the new floor data
    const currentFloorData = (building.floor_data as any) || {};
    const newFloorData = {
      ...currentFloorData,
      [floor_number]: {
        ...(kmlUrl !== undefined && { kmlUrl }),
        ...(embedUrl !== undefined && { embedUrl }),
        ...(virtualTour !== undefined && { virtualTour }),
        center: {
          lat: center.lat,
          lng: center.lng
        },
        zoom
      }
    };

    // Update the building with new floor data
    const [updatedBuilding] = await db
      .update(buildings)
      .set({ floor_data: newFloorData })
      .where(eq(buildings.id, buildingIdNum))
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        building_id: updatedBuilding.id,
        building_name: updatedBuilding.name,
        floor_data: updatedBuilding.floor_data
      },
      message: `Floor ${floor_number} data updated successfully`
    });
  } catch (error) {
    console.error('Error updating floor data:', error);
    return NextResponse.json(
      { error: 'Failed to update floor data' },
      { status: 500 }
    );
  }
}

// DELETE /api/campuses/:campusId/buildings/:buildingId/floors?floor_number=X - Delete floor data (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ campusId: string; buildingId: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { buildingId } = await params;
    const buildingIdNum = parseInt(buildingId);
    const { searchParams } = new URL(request.url);
    const floorNumber = searchParams.get('floor_number');

    if (isNaN(buildingIdNum)) {
      return NextResponse.json(
        { error: 'Invalid building ID' },
        { status: 400 }
      );
    }

    if (!floorNumber) {
      return NextResponse.json(
        { error: 'floor_number query parameter is required' },
        { status: 400 }
      );
    }

    // Get current building
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

    // Remove the floor data
    const currentFloorData = (building.floor_data as any) || {};
    const { [floorNumber]: removed, ...remainingFloorData } = currentFloorData;

    // Update the building
    const [updatedBuilding] = await db
      .update(buildings)
      .set({ floor_data: Object.keys(remainingFloorData).length > 0 ? remainingFloorData : null })
      .where(eq(buildings.id, buildingIdNum))
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        building_id: updatedBuilding.id,
        floor_data: updatedBuilding.floor_data
      },
      message: `Floor ${floorNumber} data deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting floor data:', error);
    return NextResponse.json(
      { error: 'Failed to delete floor data' },
      { status: 500 }
    );
  }
}
