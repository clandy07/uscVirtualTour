import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { campuses, buildings, rooms, geometries } from '@/db/schema';
import { requireAdmin } from '@/app/api/utils/auth';
import { eq, and, SQL } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { isNumericString } from '@/app/utils';



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campusId: string; buildingId: string }> }
) {

  try {
    const { campusId, buildingId } = await params;
    const campusIdNum = parseInt(campusId);
    const buildingIdNum = parseInt(buildingId)

    const searchParams = request.nextUrl.searchParams
    const queryGeom = searchParams.get('getGeometries')
    const queryOffice = searchParams.get('officeId')
    const officeIdNum = (queryOffice != null && isNumericString(queryOffice)) ? parseInt(queryOffice) : null

    if(queryOffice != null && officeIdNum === null){
        return NextResponse.json(
            {error: "The given office ID was invalid. It has to be numeric or just exclude the office ID from the query parameters."},
            {status: 400}
        )
    }

    const getGeometries: boolean = queryGeom === "true"


    if (isNaN(campusIdNum) || isNaN(buildingIdNum)) {
      return NextResponse.json(
        { error: 'Invalid campus ID or building ID' },
        { status: 400 }
      );
    }

    const subquery = db
        .select()
        .from(buildings)
        .where(
            eq(buildings.campus_id, campusIdNum)
        )
        .as('buildings_of_campus');

    const filters: SQL[] = [eq(subquery.id, buildingIdNum)]
    if(officeIdNum != null) filters.push(eq(rooms.office_id, officeIdNum))

    const mainQuery = db
        .select({
            roomId: rooms.id,
            roomName: rooms.name,
            buildingId: subquery.id,
            buildingName: subquery.name,
            //roomDescription: rooms.description,
            roomFloorLvl: rooms.floor_level,
            //roomOfficeId: rooms.office_id,
            roomGeomId: rooms.geometry_id
        })
        .from(rooms)
        .innerJoin(subquery, eq(subquery.id, rooms.building_id))
        .where(and(...filters))
        
    if(getGeometries === true){
        const subqueryRooms = mainQuery.as('rooms_of_building')
        const result = await db 
            .select({
                roomId: subqueryRooms.roomId,
                roomName: subqueryRooms.roomName,
                buildingId: subqueryRooms.buildingId,
                buildingName: subqueryRooms.buildingName,
                //roomDescription: subqueryRooms.roomDescription,
                roomFloorLvl: subqueryRooms.roomFloorLvl,
                //roomOfficeId: subqueryRooms.roomOfficeId,
                roomGeomId: geometries.id,
                roomPolygon: geometries.polygon
            })
            .from(geometries)
            .rightJoin(subqueryRooms, eq(subqueryRooms.roomGeomId, geometries.id));

        return NextResponse.json({
            success: true,
            data: result
        });
    }

    const result = await mainQuery

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting rooms of the given building in the given campus:', error);
    return NextResponse.json(
      { error: 'Failed to get rooms of the given building in the given campus' },
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
    console.error('Error creating a new room for the given building in the given campus:', error);
    return NextResponse.json(
      { error: 'Failed to create a new room for the given building in the given campus' },
      { status: 500 }
    );
  }
}