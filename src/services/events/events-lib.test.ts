import { describe, expect, it } from "vitest";
import { toEvent } from "./events-lib";

describe("toEvent()", () => {
    it("maps database columns to the API shape", () => {
        const event = toEvent({
            id: "3f1c2a9e-5b7d-4c8e-9a1f-2d3e4f5a6b7c",
            title: "General Meeting",
            description: null,
            location: "Room 101",
            start_time: "2026-10-15T18:00:00+00:00",
            end_time: "2026-11-15T18:00:00+00:00",
            created_at: "2026-10-01T00:00:00+00:00",
        });

        expect(event).toEqual({
            id: "3f1c2a9e-5b7d-4c8e-9a1f-2d3e4f5a6b7c",
            title: "General Meeting",
            description: null,
            location: "Room 101",
            startTime: "2026-10-15T18:00:00+00:00",
            endTime: "2026-11-15T18:00:00+00:00",
        });
    });
});
