import { buildings, campuses, locations } from "@/db/schema";
import { db } from "@/index";

// NOTE: RUN THIS FILE ONLY ONCE TO INITIALIZE THE DATABASE FOR ROUTING INSIDE BUNZEL BUILDING FLOOR 1 AND 4

try{
    const campus = await db.insert(campuses).values({
        name: "Talamban",
        address: "9W27+R8R, Sitio Nasipit, Brgy, Cebu City"
    }).returning({
        insertedCampusId: campuses.id
    })

    const talambanId = campus[0].insertedCampusId

    const location = await db.insert(locations).values({
        name: "Lawrence-Bunzel",
        category: "buildings",
        description: "The Lawrence Bunzel Building, commonly known as the Bunzel Building, is the home of the future engineers in the Talamban Campus of the University of San Carlos. The Bunzel Building is also known as a historical structure since it has been in the university for more than 50 years already. Widely annotated as the witness of USC’s growth, it has transformed aspiring engineers into successful ones, who are now considered as big names not only in the city but also in the country. ",
        latitude: "10.3520853",
        longitude: "123.9131221",
        campus_id: talambanId
    }).returning({
        insertedLocationId: locations.id
    })

    const bunzelLocId = location[0].insertedLocationId

    const building = await db.insert(buildings).values({
        name: "Lawrence-Bunzel",
        location_id: bunzelLocId,
        campus_id: talambanId,
        basement_count: 1,
        floor_count: 5
    }).returning({
        insertedBuildingId: buildings.id
    })

    const bunzelBldgId = building[0].insertedBuildingId
} catch (error){
// 1. Log the error for debugging/monitoring
    console.error("Database insertion failed:", error);

    // 2. Add an optional, more detailed log if the error is a known type
    if (error instanceof Error) {
        console.error("Error message:", error.message);
        // If your database library has specific error codes (e.g., PostgreSQL unique violation),
        // you might check for those here:
        // if ('code' in error && error.code === '23505') { ... } 
    }

    // 3. Optional: Clean-up (e.g., if you were managing a manual transaction)
    // In this specific code, the insertions are sequential and not in a single transaction,
    // so no database rollback is needed here, but keep this in mind for the future.

    // 4. Re-throw the error
    // Re-throwing ensures that the calling function (the API route, the main script, etc.) 
    // knows the operation failed and can stop execution or return an error response.
    throw new Error("Failed to initialize database data due to an insertion error.");
}
