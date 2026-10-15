import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Config from "./config";
import { Database } from "../types/database";

export type Supabase = SupabaseClient<Database>;

const options = { auth: { persistSession: false, autoRefreshToken: false } };

let anonClient: Supabase | undefined;
let serviceClient: Supabase | undefined;

// Respects Row Level Security as an anonymous visitor. Use for public reads.
export function getAnonClient(): Supabase {
    anonClient ??= createClient<Database>(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY, options);
    return anonClient;
}

// Respects Row Level Security as the logged-in user. Use for reads/writes on the user's behalf.
export function getUserClient(accessToken: string): Supabase {
    return createClient<Database>(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY, {
        ...options,
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
}

// BYPASSES Row Level Security. Only use behind an admin-only spec.
export function getServiceClient(): Supabase {
    serviceClient ??= createClient<Database>(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY, options);
    return serviceClient;
}
