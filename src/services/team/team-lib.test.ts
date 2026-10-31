import { describe, expect, it, vi } from "vitest";
import { getAnonClient } from "../../common/supabase";
import { listTeamMembers, toTeamMember } from "./team-lib";
import { TeamMemberRow } from "./team-schemas";

vi.mock("../../common/supabase", () => ({ getAnonClient: vi.fn() }));

const ROW: TeamMemberRow = {
    id: "3f1c2a9e-5b7d-4c8e-9a1f-2d3e4f5a6b7c",
    name: "Alex Smith",
    position: "Co-Director",
    team: "Directors",
    academic_year: "2025-26",
    image_url: "https://example.com/alex.jpg",
    linkedin_url: "https://linkedin.com/in/alex",
    email: "alex@example.com",
    display_order: 1,
    created_at: "2025-08-01T00:00:00+00:00",
};

describe("team data layer", () => {
    it("maps database fields to the public API shape", () => {
        expect(toTeamMember(ROW)).toEqual({
            id: ROW.id,
            name: ROW.name,
            position: ROW.position,
            committee: ROW.team,
            year: ROW.academic_year,
            imageUrl: ROW.image_url,
            linkedinUrl: ROW.linkedin_url,
            email: ROW.email,
            displayOrder: ROW.display_order,
            createdAt: ROW.created_at,
        });
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
        } as never);

        await listTeamMembers({ committee: "Directors", year: "2025-26" });

        expect(eq).toHaveBeenNthCalledWith(1, "team", "Directors");
        expect(eq).toHaveBeenNthCalledWith(2, "academic_year", "2025-26");
    });
});
