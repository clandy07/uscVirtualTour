import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { buildings, locations, campuses } from '@/db/schema';
import { requireAdmin } from '../../../utils/auth';
import { eq } from 'drizzle-orm';

// GET /api/campuses/:campusId/buildings - Get all buildings for a campus
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

    // Verify campus exists
    const [campus] = await db
      .select()
      .from(campuses)
      .where(eq(campuses.id, campusIdNum));

    if (!campus) {
      return NextResponse.json(
        { error: 'Campus not found' },
        { status: 404 }
      );
    }

    const campusBuildings = await db
      .select()
      .from(buildings)
      .where(eq(buildings.campus_id, campusIdNum));

    return NextResponse.json({
      success: true,
      data: campusBuildings
    });
  } catch (error) {
    console.error('Error fetching buildings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buildings' },
      { status: 500 }
    );
  }
}

// POST /api/campuses/:campusId/buildings - Create a new building (Admin only)
export async function POST(
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

    // Verify campus exists
    const [campus] = await db
      .select()
      .from(campuses)
      .where(eq(campuses.id, campusIdNum));

    if (!campus) {
      return NextResponse.json(
        { error: 'Campus not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');

    const { name, floor_count, basement_count, latitude, longitude, description,
            total_rooms, facilities, accessibility_features, fun_facts } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    let locationIdNum: number | null = null;
    let newLocation = null;

    // If locationId is provided, verify it exists
    if (locationId) {
      locationIdNum = parseInt(locationId);
      
      if (isNaN(locationIdNum)) {
        return NextResponse.json(
          { error: 'Invalid location ID' },
          { status: 400 }
        );
      }

      const [existingLocation] = await db
        .select()
        .from(locations)
        .where(eq(locations.id, locationIdNum));

      if (!existingLocation) {
        return NextResponse.json(
          { error: 'Location not found' },
          { status: 404 }
        );
      }

      // Check if location already has a building
      const [existingBuilding] = await db
        .select()
        .from(buildings)
        .where(eq(buildings.location_id, locationIdNum));

      if (existingBuilding) {
        return NextResponse.json(
          { error: 'This location already has a building associated with it' },
          { status: 400 }
        );
      }

      newLocation = existingLocation;
    } else {
      // Create a new location for this building
      [newLocation] = await db.insert(locations).values({
        name,
        category: 'buildings',
        description: description || null,
        campus_id: campusIdNum,
        latitude: latitude || null,
        longitude: longitude || null,
      }).returning();

      locationIdNum = newLocation.id;
    }

    // Create the building
    const [newBuilding] = await db.insert(buildings).values({
      name,
      campus_id: campusIdNum,
      location_id: locationIdNum,
      floor_count: floor_count || null,
      basement_count: basement_count || null,
      total_rooms: total_rooms || null,
      facilities: facilities || null,
      accessibility_features: accessibility_features || null,
      fun_facts: fun_facts || null,
    }).returning();

    return NextResponse.json({
      success: true,
      data: {
        building: newBuilding,
        location: newLocation
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating building:', error);
    return NextResponse.json(
      { error: 'Failed to create building' },
      { status: 500 }
    );
  }
}
