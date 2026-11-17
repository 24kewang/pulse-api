import { describe, expect, it, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { getAnonClient } from "../../common/supabase";
import { listTeamMembers, toTeamMember } from "./team-lib";
import { Database } from "../../types/database";
import { TeamMemberRow } from "./team-schemas";

vi.mock("../../common/supabase", () => ({ getAnonClient: vi.fn() }));

// A real client: getPublicUrl only builds a URL string, no network call
const CLIENT = createClient<Database>("http://localhost:54321", "test-anon-key");

const ROW: TeamMemberRow = {
    id: "3f1c2a9e-5b7d-4c8e-9a1f-2d3e4f5a6b7c",
    name: "Alex Smith",
    position: "Co-Director",
    team: "Directors",
    academic_year: "2025-26",
    image_path: "2025-26/alex.jpg",
    linkedin_url: "https://linkedin.com/in/alex",
    email: "alex@example.com",
    display_order: 1,
    created_at: "2025-08-01T00:00:00+00:00",
};

describe("team data layer", () => {
    it("maps database fields to the public API shape", () => {
        expect(toTeamMember(ROW, CLIENT)).toEqual({
            id: ROW.id,
            name: ROW.name,
            position: ROW.position,
            committee: ROW.team,
            year: ROW.academic_year,
            imageUrl: "http://localhost:54321/storage/v1/object/public/team-photos/2025-26/alex.jpg",
            linkedinUrl: ROW.linkedin_url,
            email: ROW.email,
            displayOrder: ROW.display_order,
            createdAt: ROW.created_at,
        });
    });

    it("returns null when a member has no photo", () => {
        expect(toTeamMember({ ...ROW, image_path: null }, CLIENT).imageUrl).toBeNull();
    });

    it("applies committee and year filters", async () => {
        const eq = vi.fn().mockReturnThis();
        const request = {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            eq,
            then: (resolve: (value: { data: TeamMemberRow[]; error: null }) => unknown) =>
                Promise.resolve(resolve({ data: [ROW], error: null })),
        };
        vi.mocked(getAnonClient).mockReturnValue({
            from: vi.fn().mockReturnValue(request),
            storage: CLIENT.storage,
        } as never);

        await listTeamMembers({ committee: "Directors", year: "2025-26" });

        expect(eq).toHaveBeenNthCalledWith(1, "team", "Directors");
        expect(eq).toHaveBeenNthCalledWith(2, "academic_year", "2025-26");
    });
});
