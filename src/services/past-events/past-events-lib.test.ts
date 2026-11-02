import { afterEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../../types/database";
import { getAnonClient } from "../../common/supabase";
import { listPastEvents } from "./past-events-lib";
import { PastEventsSchema } from "./past-events-schemas";

vi.mock("../../common/supabase", () => ({ getAnonClient: vi.fn() }));

const event = {
    id: "84c64b9d-f419-4b25-a13d-45aee4a391a2",
    title: "Example Challenge",
    description: null,
    start_time: "2026-09-19T15:00:00Z",
    end_time: "2026-09-19T21:00:00Z",
};
const photo = {
    id: "f1032beb-10e8-4851-b781-fc0942c380c5",
    storage_path: "example/cover image.jpg",
    alt_text: "Example presentation",
    caption: null,
    sort_order: 0,
};
const project = {
    id: "d20a5f97-803f-47af-b85d-8116d364c17a",
    project_name: "Example Compass",
    competition_type: "Innovation",
    team_name: "Example Maple",
    project_url: "https://example.com/compass",
    repository_url: null,
    sort_order: 0,
};

function mockDatabase(
    data: unknown,
    error: unknown = null,
): {
    select: ReturnType<typeof vi.fn>;
    lte: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    from: ReturnType<typeof vi.spyOn>;
} {
    // Real SDK client, intercepted before any network request; URL generation stays real.
    const client = createClient<Database>("https://example.supabase.co", "test-only", {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    const order = vi.fn().mockReturnThis();
    const lte = vi.fn().mockReturnThis();
    const select = vi.fn().mockReturnThis();
    const query = { select, lte, order };
    select.mockReturnValue(query);
    lte.mockReturnValue(query);
    order.mockReturnValueOnce(query).mockResolvedValueOnce({ data, error });
    // Only the SDK boundary is replaced; application query and mapping code run normally.
    const from = vi.spyOn(client, "from").mockReturnValue(query as unknown as ReturnType<typeof client.from>);
    vi.mocked(getAnonClient).mockReturnValue(client);
    return { from, select, lte, order };
}

afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
});

describe("listPastEvents", () => {
    it("selects completed events newest first with one fixed cutoff and both relationships", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-28T12:00:00Z"));
        const older = { ...event, id: "75e412d0-c61f-43d2-812d-84c19f4790c7", start_time: "2026-08-01T12:00:00Z" };
        const db = mockDatabase([
            { ...event, event_photos: [], competition_projects: [] },
            { ...older, event_photos: [], competition_projects: [] },
        ]);
        const result = await listPastEvents();
        expect(db.from).toHaveBeenCalledWith("events");
        expect(db.select).toHaveBeenCalledWith(expect.stringContaining("event_photos"));
        expect(db.select).toHaveBeenCalledWith(expect.stringContaining("competition_projects"));
        expect(db.lte).toHaveBeenCalledExactlyOnceWith("end_time", "2026-10-28T12:00:00.000Z");
        expect(db.order.mock.calls).toEqual([
            ["start_time", { ascending: false }],
            ["id", { ascending: true }],
        ]);
        expect(result.map((row) => row.id)).toEqual([event.id, older.id]);
    });

    it("sorts both child collections, breaks ties by id, and derives the cover", async () => {
        const firstPhoto = { ...photo, id: "11032beb-10e8-4851-b781-fc0942c380c5" };
        const lastPhoto = { ...photo, id: "21032beb-10e8-4851-b781-fc0942c380c5", sort_order: 2 };
        const firstProject = { ...project, id: "120a5f97-803f-47af-b85d-8116d364c17a" };
        const lastProject = { ...project, id: "220a5f97-803f-47af-b85d-8116d364c17a", sort_order: 2 };
        mockDatabase([
            {
                ...event,
                event_photos: [lastPhoto, photo, firstPhoto],
                competition_projects: [lastProject, project, firstProject],
            },
        ]);
        const result = await listPastEvents();
        expect(PastEventsSchema.parse(result)).toEqual(result);
        const row = result[0]!;
        expect(row.photos.map((item) => item.id)).toEqual([firstPhoto.id, photo.id, lastPhoto.id]);
        expect(row.projects.map((item) => item.id)).toEqual([firstProject.id, project.id, lastProject.id]);
        expect(row.imageUrl).toBe(
            "https://example.supabase.co/storage/v1/object/public/test-event-photos/example/cover%20image.jpg",
        );
        expect(row.imageUrl).toBe(row.photos[0]?.url);
        expect(row.imageAlt).toBe(firstPhoto.alt_text);
        expect(row.photos[0]?.caption).toBeNull();
        expect(row.projects[0]).toEqual({
            id: firstProject.id,
            projectName: project.project_name,
            competitionType: project.competition_type,
            teamName: project.team_name,
            projectUrl: project.project_url,
            repositoryUrl: null,
        });
    });

    it("keeps all keys and nulls when an event has no photos or projects", async () => {
        mockDatabase([{ ...event, event_photos: [], competition_projects: [] }]);
        expect(await listPastEvents()).toEqual([
            {
                id: event.id,
                title: event.title,
                description: null,
                startTime: event.start_time,
                endTime: event.end_time,
                imageUrl: null,
                imageAlt: null,
                photos: [],
                projects: [],
            },
        ]);
    });

    it("returns photos for ordinary events without projects", async () => {
        mockDatabase([{ ...event, event_photos: [photo], competition_projects: [] }]);
        const result = await listPastEvents();
        expect(result[0]?.photos).toHaveLength(1);
        expect(result[0]?.projects).toEqual([]);
    });

    it("retains projects when an event has no photos", async () => {
        mockDatabase([{ ...event, event_photos: [], competition_projects: [project] }]);
        const result = await listPastEvents();
        expect(result[0]?.imageUrl).toBeNull();
        expect(result[0]?.projects).toHaveLength(1);
    });

    it.each([[], null])("returns an empty array for empty data %j", async (data) => {
        mockDatabase(data);
        expect(await listPastEvents()).toEqual([]);
    });

    it("throws database failures for the shared error handler", async () => {
        const error = { message: "fictional database failure", code: "TEST" };
        mockDatabase(null, error);
        await expect(listPastEvents()).rejects.toBe(error);
    });
});
