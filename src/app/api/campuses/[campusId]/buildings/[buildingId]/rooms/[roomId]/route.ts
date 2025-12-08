import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { buildings, rooms, geometries } from '@/db/schema';
import { eq, and } from 'drizzle-orm';



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campusId: string; buildingId: string; roomId: string }> }
) {

  try {
    const { campusId, buildingId, roomId } = await params;
    const campusIdNum = parseInt(campusId);
    const buildingIdNum = parseInt(buildingId)
    const roomIdNum = parseInt(roomId)

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('getGeometries')

    const getGeometries: boolean = query === "true"

    if (isNaN(campusIdNum) || isNaN(buildingIdNum) || isNaN(roomIdNum)) {
      return NextResponse.json(
        { error: 'Invalid campus ID, building ID, or room ID' },
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

    const subqueryRooms = db
        .select({
            roomId: rooms.id,
            roomName: rooms.name,
            buildingId: subquery.id,
            buildingName: subquery.name,
            roomDescription: rooms.description,
            roomFloorLvl: rooms.floor_level,
            //roomOfficeId: rooms.office_id,
            roomGeomId: rooms.geometry_id
        })
        .from(rooms)
        .innerJoin(subquery, eq(subquery.id, rooms.building_id))
        .where(
            and(
                eq(subquery.id, buildingIdNum),
                eq(rooms.id, roomIdNum)
            )
        )
        .as('room_of_building');

    const result = await db 
        .select({
            roomId: subqueryRooms.roomId,
            roomName: subqueryRooms.roomName,
            buildingId: subqueryRooms.buildingId,
            buildingName: subqueryRooms.buildingName,
            roomDescription: subqueryRooms.roomDescription,
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

  } catch (error) {
    console.error('Error getting the given room of the given building in the given campus:', error);
    return NextResponse.json(
      { error: 'Failed to get the given room of the given building in the given campus' },
      { status: 500 }
    );
  }
}