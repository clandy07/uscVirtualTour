import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { campuses } from '@/db/schema';
import { requireAdmin } from '../utils/auth';
import { eq } from 'drizzle-orm';

// GET /api/campuses - Get all campuses
export async function GET(request: NextRequest) {
  try {
    const allCampuses = await db.select().from(campuses);
    
    return NextResponse.json({
      success: true,
      data: allCampuses
    });
  } catch (error) {
    console.error('Error fetching campuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campuses' },
      { status: 500 }
    );
  }
}

// POST /api/campuses - Create a new campus (Admin only)
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { name, address } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const [newCampus] = await db.insert(campuses).values({
      name,
      address: address || null,
    }).returning();

    return NextResponse.json({
      success: true,
      data: newCampus
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating campus:', error);
    return NextResponse.json(
      { error: 'Failed to create campus' },
      { status: 500 }
    );
  }
}
