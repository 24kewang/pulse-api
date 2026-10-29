import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../app";
import { listTeamMembers } from "./team-lib";
import { TeamMember } from "./team-schemas";

vi.mock("./team-lib", () => ({ listTeamMembers: vi.fn() }));

beforeEach(() => {
    vi.clearAllMocks();
});

const TEST_MEMBER: TeamMember = {
    id: "3f1c2a9e-5b7d-4c8e-9a1f-2d3e4f5a6b7c",
    name: "Alex Smith",
    position: "Co-Director",
    committee: "Directors",
    year: "2025-26",
    imageUrl: "https://example.com/alex.jpg",
    linkedinUrl: "https://linkedin.com/in/alex",
    email: "alex@example.com",
    displayOrder: 1,
};

describe("GET /team/", () => {
    it("returns team members and passes filters to the data layer", async () => {
        vi.mocked(listTeamMembers).mockResolvedValueOnce([TEST_MEMBER]);

        const response = await request(app).get("/team/?committee=Directors&year=2025-26").expect(200);

        expect(response.body).toEqual([TEST_MEMBER]);
        expect(listTeamMembers).toHaveBeenCalledWith({ committee: "Directors", year: "2025-26" });
    });

    it("rejects empty filters", async () => {
        const response = await request(app).get("/team/?year=").expect(400);

        expect(response.body.error).toBe("BadRequest");
        expect(listTeamMembers).not.toHaveBeenCalled();
    });
});
