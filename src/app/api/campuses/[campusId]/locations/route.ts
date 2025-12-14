import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { locations, buildings, campuses } from '@/db/schema';
import { requireAdmin } from '../../../utils/auth';
import { eq, and } from 'drizzle-orm';

// GET /api/campuses/:campusId/locations - Get all locations for a campus
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

    const campusLocations = await db
      .select()
      .from(locations)
      .where(eq(locations.campus_id, campusIdNum));

    return NextResponse.json({
      success: true,
      data: campusLocations
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

// POST /api/campuses/:campusId/locations - Create a new location (Admin only)
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
    const createBuilding = searchParams.get('createBuilding') === 'true';

    const { name, category, description, latitude, longitude, floor_count, basement_count,
            operating_hours, contact_number, email, website_url, images, amenities, tags } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Create location
    const [newLocation] = await db.insert(locations).values({
      name,
      category: category || null,
      description: description || null,
      campus_id: campusIdNum,
      latitude: latitude || null,
      longitude: longitude || null,
      operating_hours: operating_hours || null,
      contact_number: contact_number || null,
      email: email || null,
      website_url: website_url || null,
      images: images || null,
      amenities: amenities || null,
      tags: tags || null,
    }).returning();

    // If createBuilding is true, also create a building record
    let newBuilding = null;
    if (createBuilding) {
      [newBuilding] = await db.insert(buildings).values({
        name,
        campus_id: campusIdNum,
        location_id: newLocation.id,
        floor_count: floor_count || null,
        basement_count: basement_count || null,
      }).returning();
    }

    return NextResponse.json({
      success: true,
      data: {
        location: newLocation,
        building: newBuilding
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}
