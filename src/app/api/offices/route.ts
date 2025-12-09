import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { campuses, buildings, rooms, geometries, offices } from '@/db/schema';
import { requireAdmin } from '@/app/api/utils/auth';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { isNumericString } from '@/app/utils';
import { SQL } from 'drizzle-orm';
import { off } from 'process';



export async function GET(
  request: NextRequest
) {

  try {
    const searchParams = request.nextUrl.searchParams
    const schoolFilter = searchParams.get('schoolId')
    const departmentFilter = searchParams.get('departmentId')

    const filters: SQL[] = [];

    if(schoolFilter){
        const schoolIdNum = isNumericString(schoolFilter) ? parseInt(schoolFilter) : null
        if(schoolIdNum != null){
            filters.push(eq(offices.school_id, schoolIdNum))
        }
    }
    if(departmentFilter){
        const departmentIdNum = isNumericString(departmentFilter) ? parseInt(departmentFilter) : null
        if(departmentIdNum != null){
            filters.push(eq(offices.department_id, departmentIdNum))
        }
    }


    const result = await db
        .select()
        .from(offices)
        .where(
            (filters.length > 0) ? and(...filters) : undefined
        );


    return NextResponse.json({
        success: true,
        data: result
    });
    
  } catch (error) {
    console.error('Error getting offices:', error);
    return NextResponse.json(
      { error: 'Failed to get offices' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campusId: string; buildingId: string }> }
) {

  try {
    const authError = await requireAdmin(request)
    if(authError) return authError

    const { campusId, buildingId } = await params;
    const campusIdNum = parseInt(campusId);
    const buildingIdNum = parseInt(buildingId)

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('makeGeometry')

    const makeGeometry: boolean = query === "true"

    if (isNaN(campusIdNum) || isNaN(buildingIdNum)) {
      return NextResponse.json(
        { error: 'Invalid campus ID or building ID' },
        { status: 400 }
      );
    }

    const buildingsArr = await db.select({id: buildings.id}).from(buildings).where(
        and(
            eq(buildings.id, buildingIdNum),
            eq(buildings.campus_id, campusIdNum)
        )
    )

    if(buildingsArr.length <= 0){
        return NextResponse.json(
            { error: 'Given building in the given campus does not exist' },
            { status: 400 }
        );
    }

    const body = await request.json()

    if(makeGeometry === true){
        const geomsInserted = await db.insert(geometries).values({
            polygon: body.polygon
        }).returning({insertedGeomId: geometries.id})

        const roomsInserted = await db.insert(rooms).values({
            name: body.name,
            building_id: buildingIdNum,
            office_id: body.officeId,
            geometry_id: geomsInserted[0].insertedGeomId,
            description: body.description,
            floor_level: body.floorLevel
        }).returning({insertedRoomId: rooms.id})

        return NextResponse.json({
            success: true,
            data: {
                insertedRoomId: roomsInserted[0].insertedRoomId,
                insertedGeomId: geomsInserted[0].insertedGeomId
            }
        })
    }
    else {
        const roomsInserted = await db.insert(rooms).values({
            name: body.name,
            building_id: buildingIdNum,
            office_id: body.officeId,
            description: body.description,
            floor_level: body.floorLevel
        }).returning({insertedRoomId: rooms.id})

        return NextResponse.json({
            success: true,
            data: roomsInserted
        });
    }
    
  } catch (error) {
    console.error('Error :', error);
    return NextResponse.json(
        { error: 'Failed to ' },
        { status: 500 }
    );
  }
}