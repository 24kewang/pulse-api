// Prints a Supabase access token for the pulse-dev test user in .env, for calling protected endpoints locally:
//   curl -H "Authorization: Bearer $(npm run -s token)" http://localhost:3000/...
import { createClient } from "@supabase/supabase-js";

async function main(): Promise<void> {
    const { SUPABASE_URL, SUPABASE_ANON_KEY, DEV_USER_EMAIL, DEV_USER_PASSWORD } = process.env;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !DEV_USER_EMAIL || !DEV_USER_PASSWORD) {
        console.error("Set SUPABASE_URL, SUPABASE_ANON_KEY, DEV_USER_EMAIL and DEV_USER_PASSWORD in .env");
        process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const { data, error } = await supabase.auth.signInWithPassword({ email: DEV_USER_EMAIL, password: DEV_USER_PASSWORD });
    if (error || !data.session) {
        console.error(`Sign-in failed: ${error?.message ?? "no session returned"}`);
        process.exit(1);
    }

    console.log(data.session.access_token);
}

void main();
