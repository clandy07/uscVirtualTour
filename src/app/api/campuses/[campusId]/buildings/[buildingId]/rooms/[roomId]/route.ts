import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/index';
import { buildings, rooms, geometries } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAdmin } from '@/app/api/utils/auth';



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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ campusId: string; buildingId: string; roomId: string }> }
) {

  try {
    const authError = await requireAdmin(request)
    if(authError) return authError

    const { campusId, buildingId, roomId } = await params;
    const campusIdNum = parseInt(campusId);
    const buildingIdNum = parseInt(buildingId)
    const roomIdNum = parseInt(roomId)

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('updateGeometry')

    const updateGeometry: boolean = query === "true"

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

    const mainQueryRooms = await db
        .select({
            roomId: rooms.id
        })
        .from(rooms)
        .innerJoin(subquery, eq(subquery.id, rooms.building_id))
        .where(
            and(
                eq(subquery.id, buildingIdNum),
                eq(rooms.id, roomIdNum)
            )
        );
    
    if(mainQueryRooms.length <= 0){
        return NextResponse.json(
            { error: 'Given room of the given building in the given campus does not exist' },
            { status: 400 }
        );
    }

    const body = await request.json()

    if(updateGeometry === true){
        const updatedGeoms = await db.update(geometries).set({
                polygon: body.polygon
            }
        ).where(eq(geometries.id, body.geometryId)).returning({
            updatedGeomId: geometries.id
        });

        const result = await db.update(rooms).set({
                name: body.name,
                building_id: body.buildingId,
                office_id: body.officeId,
                geometry_id: updatedGeoms[0].updatedGeomId,
                description: body.description,
                floor_level: body.floorLevel
            }
        ).where(eq(rooms.id, roomIdNum)).returning({
            updatedRoomId: rooms.id
        });

        return NextResponse.json({
            success: true,
            data: {
                updatedGeomId: updatedGeoms[0].updatedGeomId,
                updatedRoomId: result[0].updatedRoomId
            }
        });

    }
    else{
        const result = await db.update(rooms).set({
                name: body.name,
                building_id: body.buildingId,
                office_id: body.officeId,
                geometry_id: body.geometryId,
                description: body.description,
                floor_level: body.floorLevel
            }
        ).where(eq(rooms.id, roomIdNum)).returning({
            updatedRoomId: rooms.id
        });

        return NextResponse.json({
            success: true,
            data: result
        });
    }

  } catch (error) {
    console.error('Error updating the given room of the given building in the given campus:', error);
    return NextResponse.json(
      { error: 'Failed to update the given room of the given building in the given campus' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ campusId: string; buildingId: string; roomId: string }> }
) {

  try {
    const authError = await requireAdmin(request)
    if(authError) return authError
    
    const { campusId, buildingId, roomId } = await params;
    const campusIdNum = parseInt(campusId);
    const buildingIdNum = parseInt(buildingId)
    const roomIdNum = parseInt(roomId)

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

    const mainQueryRooms = await db
        .select({
            roomId: rooms.id
        })
        .from(rooms)
        .innerJoin(subquery, eq(subquery.id, rooms.building_id))
        .where(
            and(
                eq(subquery.id, buildingIdNum),
                eq(rooms.id, roomIdNum)
            )
        );
    
    if(mainQueryRooms.length <= 0){
        return NextResponse.json(
            { error: 'Given room of the given building in the given campus does not exist' },
            { status: 400 }
        );
    }

    const deletedRooms = await db.delete(rooms).where(eq(rooms.id, roomIdNum)).returning({
        deletedRoomId: rooms.id,
        geomIdToDelete: rooms.geometry_id
    })

    if(deletedRooms[0].geomIdToDelete === null){
        return NextResponse.json({
            success: true,
            data: deletedRooms
        });
    }

    const deletedGeoms = await db.delete(geometries).where(
        eq(geometries.id, deletedRooms[0].geomIdToDelete)
    ).returning({
        deletedRoomGeomId: geometries.id
    })

    return NextResponse.json({
        success: true,
        data: {
            deletedRoomId: deletedRooms[0].deletedRoomId,
            geomIdToDelete: deletedRooms[0].geomIdToDelete,
            deletedRoomGeomId: deletedGeoms[0].deletedRoomGeomId
        }
    });

  } catch (error) {
    console.error('Error deleting the given room of the given building in the given campus:', error);
    return NextResponse.json(
      { error: 'Failed to delete the given room of the given building in the given campus' },
      { status: 500 }
    );
  }
}