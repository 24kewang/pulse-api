import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        env: {
            PAST_EVENT_PHOTOS_BUCKET: "test-event-photos",
            SUPABASE_URL: "http://localhost:54321",
            SUPABASE_ANON_KEY: "test-anon-key",
            SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
        },
    },
});
