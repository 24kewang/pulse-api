// This file should be auto-generated. Ask API owner to regenerate it if it is out of date.
//   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts
// This hand-written version mirrors the event, sponsor, and team migrations
// so the template compiles.

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
                    end_time: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    description?: string | null;
                    location?: string | null;
                    start_time: string;
                    end_time: string;
                    created_at?: string;
                };
                Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
                Relationships: [];
            };
            sponsors: {
                Row: {
                    id: string;
                    name: string;
                    logo_url: string | null;
                    website_url: string | null;
                    description: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    logo_url?: string | null;
                    website_url?: string | null;
                    description?: string | null;
                    created_at?: string;
                };
                Update: Partial<Database["public"]["Tables"]["sponsors"]["Insert"]>;
                Relationships: [];
            };
            team_members: {
                Row: {
                    id: string;
                    name: string;
                    position: string;
                    team: string;
                    academic_year: string;
                    image_url: string | null;
                    linkedin_url: string | null;
                    email: string | null;
                    display_order: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    position: string;
                    team: string;
                    academic_year: string;
                    image_url?: string | null;
                    linkedin_url?: string | null;
                    email?: string | null;
                    display_order?: number;
                    created_at?: string;
                };
                Update: Partial<Database["public"]["Tables"]["team_members"]["Insert"]>;
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
