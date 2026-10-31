import { z } from "../../common/zod";
import { Tables } from "../../types/database";
import { CreateErrorAndSchema } from "../../common/errors";

export type EventRow = Tables<"events">;

// TODO: define the public shape of an event (what the frontend receives). Keep toEvent() in events-lib.ts in sync.
export const EventSchema = z
    .object({
        id: z.string().uuid().openapi({ example: "3f1c2a9e-5b7d-4c8e-9a1f-2d3e4f5a6b7c" }),
        title: z.string().openapi({ example: "General Meeting" }),
        description: z.string().nullable().openapi({ example: "Kickoff meeting for the semester" }),
        location: z.string().nullable().openapi({ example: "Siebel Center 1404" }),
        startTime: z.string().datetime({ offset: true }).openapi({ example: "2026-10-15T18:00:00+00:00" }),
        endTime: z.string().datetime({ offset: true }).openapi({ example: "2026-10-15T19:30:00+00:00" }),
    })
    .openapi("Event");

export type Event = z.infer<typeof EventSchema>;

export const EventQuerySchema = z.object({
    from: z.string().datetime({ offset: true }).optional().openapi({ example: "2026-02-16T00:00:00-06:00" }),
    to: z.string().datetime({ offset: true }).optional().openapi({ example: "2026-02-17T00:00:00-06:00" }),
});

export const [InvalidDateRangeError, InvalidDateRangeErrorSchema] = CreateErrorAndSchema({
    error: "InvalidDateRange",
    message: "`to` must be after `from`",
});
