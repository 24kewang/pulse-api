import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

import app from "../../app";

import { listSponsors } from "./sponsors-lib";
import { Sponsor } from "./sponsors-schemas";

vi.mock("./sponsors-lib", () => ({
    listSponsors: vi.fn(),
}));

beforeEach(() => {
    vi.clearAllMocks();
});

const TEST_SPONSOR: Sponsor = {
    id: "3f1c2a9e-5b7d-4c8e-9a1f-2d3e4f5a6b7c",
    name: "Example Technologies",
    logoUrl: null,
    websiteUrl: "https://example.com",
    description: "Example technology sponsor",
    year: 2026,
    createdAt: "2026-01-01T00:00:00+00:00",
};

describe("GET /sponsors/", () => {
    it("returns all sponsors", async () => {
        vi.mocked(listSponsors).mockResolvedValueOnce([TEST_SPONSOR]);

        const response = await request(app).get("/sponsors/").expect(200);

        expect(response.body).toEqual([TEST_SPONSOR]);
        expect(listSponsors).toHaveBeenCalledWith({});
    });

    it("passes year filters to the data layer", async () => {
        vi.mocked(listSponsors).mockResolvedValueOnce([TEST_SPONSOR]);

        const response = await request(app).get("/sponsors/?year=2026").expect(200);

        expect(response.body).toEqual([TEST_SPONSOR]);
        expect(listSponsors).toHaveBeenCalledWith({ year: "2026" });
    });

    it("rejects invalid years", async () => {
        const response = await request(app).get("/sponsors/?year=hello").expect(400);

        expect(response.body.error).toBe("BadRequest");
        expect(listSponsors).not.toHaveBeenCalled();
    });
});
