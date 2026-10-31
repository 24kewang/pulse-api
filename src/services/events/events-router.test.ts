import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../app";
import { listEvents } from "./events-lib";
import { Event } from "./events-schemas";

vi.mock("./events-lib", () => ({ listEvents: vi.fn() }));
beforeEach(() => {
    vi.clearAllMocks();
});

const TEST_EVENT: Event = {
    id: "3f1c2a9e-5b7d-4c8e-9a1f-2d3e4f5a6b7c",
    title: "General Meeting",
    description: null,
    location: "Siebel Center 1404",
    startTime: "2026-10-15T18:00:00+00:00",
    endTime: "2026-10-15T19:00:00+00:00",
};

describe("GET /events/", async () => {
    it("returns events from the data layer");
    {
        vi.mocked(listEvents).mockResolvedValueOnce([TEST_EVENT]);

        const response = await request(app).get("/events/").expect(200);
        expect(response.body).toEqual([TEST_EVENT]);
        expect(listEvents).toHaveBeenCalledWith(undefined, undefined);
    }
    it("returns 200 for valid date range", async () => {
        await request(app)
            .get("/events/")
            .query({ from: "2026-02-16T00:00:00-06:00", to: "2026-02-17T00:00:00-06:00" })
            .expect(200);
        expect(listEvents).toHaveBeenCalledWith("2026-02-16T00:00:00-06:00", "2026-02-17T00:00:00-06:00");
    });
    it("returns 400 for invalid date range", async () => {
        await request(app).get("/events/").query({ from: "banana", to: "2026-02-17T00:00:00-06:00" }).expect(400);
        expect(listEvents).not.toHaveBeenCalled();
    });
    it("returns 400 for invalid date range where from is after to", async () => {
        await request(app)
            .get("/events/")
            .query({ from: "2026-02-18T00:00:00-06:00", to: "2026-02-17T00:00:00-06:00" })
            .expect(400, { error: "InvalidDateRange", message: "`to` must be after `from`" });
        expect(listEvents).not.toHaveBeenCalled();
    });
});
