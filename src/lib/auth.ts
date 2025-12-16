import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/index"; // your drizzle instance
import {schema} from "@/db/schema"
import { username } from "better-auth/plugins"

export const auth = betterAuth({
    emailAndPassword: { 
        enabled: true, 
    }, 
    user: {
        modelName: "user",
        fields: {
            name: "first_name",
            createdAt: "created_at",
            updatedAt: "updated_at",
            emailVerified: "email_verified"
        },
        additionalFields: {
            username: {
                type: "string",
                required: true,
                input: true, // don't allow user to set username
            },
            displayUsername: {
                type: "string",
                required: false,
                input: true, // don't allow user to set role
            },
            mid_name:{
                type: "string",
                required: false,
                input: true, // don't allow user to set username
            },
            last_name:{
                type: "string",
                required: true,
                defaultValue: "joe",
                input: true, // don't allow user to set username
            },
            is_student: {
                type: "boolean",
                required: true,
                defaultValue: false,
                input: true
            },
            is_admin: {
                type: "boolean",
                required: true,
                defaultValue: false,
                input: true
            }
        },
        changeEmail: {
            enabled: true,
            updateEmailWithoutVerification: true
        },
        
    },
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        usePlural: true,
        schema: {
            ...schema,
            user: schema.users,
        },
    }),
    plugins: [ 
        username({
            usernameNormalization: false
        }) 
    ] 
    // add authentication methods and the core schema required by better-auth
});