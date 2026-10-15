import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../app";
import { NotImplementedError } from "../../common/errors";
import { listEvents } from "./events-lib";
import { Event } from "./events-schemas";

vi.mock("./events-lib", () => ({ listEvents: vi.fn() }));

const TEST_EVENT: Event = {
    id: "3f1c2a9e-5b7d-4c8e-9a1f-2d3e4f5a6b7c",
    title: "General Meeting",
    description: null,
    location: "Siebel Center 1404",
    startTime: "2026-10-15T18:00:00+00:00",
    endTime: null,
};

describe("GET /events/", () => {
    it("returns events from the data layer", async () => {
        vi.mocked(listEvents).mockResolvedValueOnce([TEST_EVENT]);

        const response = await request(app).get("/events/").expect(200);
        expect(response.body).toEqual([TEST_EVENT]);
    });

    it("returns a JSON 501 while not implemented", async () => {
        vi.mocked(listEvents).mockRejectedValueOnce(new NotImplementedError("Listing events"));

        const response = await request(app).get("/events/").expect(501);
        expect(response.body).toMatchObject({ error: "NotImplemented" });
    });
});
