import type { InferSessionFromAuth } from "better-auth";
import type { auth } from "@/lib/auth";

declare module "better-auth/types" {
  interface Session extends InferSessionFromAuth<typeof auth> {}
}

// Extend the User type to include custom fields
declare module "better-auth" {
  interface User {
    username: string;
    displayUsername?: string | null;
    mid_name?: string | null;
    last_name: string;
    is_student: boolean;
    is_admin: boolean;
  }
}
