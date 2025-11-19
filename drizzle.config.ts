import 'dotenv/config';
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    out: './drizzle',

    dialect: 'postgresql', // 'mysql' | 'sqlite' | 'turso'

    schema: './src/db/schema.ts',

    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },

    migrations: {
        prefix: "timestamp",
        table: "__drizzle_migrations__",
        schema: "public",
    },

    extensionsFilters: ["postgis"],
})
