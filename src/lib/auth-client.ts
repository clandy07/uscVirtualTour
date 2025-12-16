import { createAuthClient } from "better-auth/react"
import { usernameClient, inferAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "./auth";

const getBaseURL = () => {
    // Use the current window location in the browser
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    // Fallback for SSR
    return process.env.NEXT_PUBLIC_APP_URL || "https://usc-virtual-tour.vercel.app";
};

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: getBaseURL(),
    plugins: [ 
        usernameClient(),
        inferAdditionalFields<typeof auth>() 
    ] 
})
