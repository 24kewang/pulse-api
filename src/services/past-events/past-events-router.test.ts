import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../app";
import { listPastEvents } from "./past-events-lib";
import { PastEvent, PastEventsInternalErrorSchema, PastEventsSchema } from "./past-events-schemas";

vi.mock("./past-events-lib", () => ({ listPastEvents: vi.fn() }));

const TEST_EVENT: PastEvent = {
    id: "84c64b9d-f419-4b25-a13d-45aee4a391a2",
    title: "Example Challenge",
    description: "Fictional test event",
    startTime: "2026-09-19T15:00:00Z",
    endTime: "2026-09-19T21:00:00Z",
    imageUrl: "https://example.com/cover.jpg",
    imageAlt: "Example presentation",
    photos: [
        {
            id: "f1032beb-10e8-4851-b781-fc0942c380c5",
            url: "https://example.com/cover.jpg",
            altText: "Example presentation",
            caption: null,
        },
    ],
    projects: [
        {
            id: "d20a5f97-803f-47af-b85d-8116d364c17a",
            projectName: "Compass",
            competitionType: "Innovation",
            teamName: "Maple",
            projectUrl: null,
            repositoryUrl: null,
        },
    ],
};

describe("GET /past-events", () => {
    it.each(["/past-events", "/past-events/"])("returns the approved array publicly at %s", async (path) => {
        vi.mocked(listPastEvents).mockResolvedValueOnce([TEST_EVENT]);
        const response = await request(app).get(path).expect(200);
        expect(response.body).toEqual([TEST_EVENT]);
        expect(PastEventsSchema.parse(response.body)).toEqual(response.body);
    });

    it("returns an empty array", async () => {
        vi.mocked(listPastEvents).mockResolvedValueOnce([]);
        const response = await request(app).get("/past-events").expect(200);
        expect(response.body).toEqual([]);
    });

    it("returns nullable cover fields and empty collections", async () => {
        const empty = { ...TEST_EVENT, description: null, imageUrl: null, imageAlt: null, photos: [], projects: [] };
        vi.mocked(listPastEvents).mockResolvedValueOnce([empty]);
        const response = await request(app).get("/past-events").expect(200);
        expect(response.body).toEqual([empty]);
    });

    it("uses the existing generic 500 without exposing database details", async () => {
        const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
        try {
            vi.mocked(listPastEvents).mockRejectedValueOnce(new Error("fictional internal database detail"));
            const response = await request(app).get("/past-events").expect(500);
            expect(PastEventsInternalErrorSchema.parse(response.body)).toEqual(response.body);
            expect(JSON.stringify(response.body)).not.toContain("fictional internal database detail");
        } finally {
            log.mockRestore();
        }
    });
});
