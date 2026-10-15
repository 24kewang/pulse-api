// This file should be auto-generated. Ask API owner to regenerate it if it is out of date.
//   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts
// This hand-written version mirrors supabase/migrations/0001_create_events.sql so the template compiles.

export type Database = {
    public: {
        Tables: {
            events: {
                Row: {
                    id: string;
                    title: string;
                    description: string | null;
                    location: string | null;
                    start_time: string;
                    end_time: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    description?: string | null;
                    location?: string | null;
                    start_time: string;
                    end_time?: string | null;
                    created_at?: string;
                };
                Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
                Relationships: [];
            };
        };
        Views: { [_ in never]: never };
        Functions: { [_ in never]: never };
        Enums: { [_ in never]: never };
        CompositeTypes: { [_ in never]: never };
    };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
