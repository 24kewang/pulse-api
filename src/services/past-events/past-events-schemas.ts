import { z } from "../../common/zod";
import { EventSchema } from "../events/events-schemas";

const HttpUrlSchema = z
    .string()
    .url()
    .regex(/^https?:\/\//i);

export const EventPhotoSchema = z
    .object({
        id: z.string().uuid(),
        url: HttpUrlSchema,
        altText: z.string().min(1),
        caption: z.string().nullable(),
    })
    .openapi("EventPhoto");

export const CompetitionProjectSchema = z
    .object({
        id: z.string().uuid(),
        projectName: z.string().min(1),
        competitionType: z.string().min(1),
        teamName: z.string().min(1),
        projectUrl: HttpUrlSchema.nullable(),
        repositoryUrl: HttpUrlSchema.nullable(),
    })
    .openapi("CompetitionProject");

export const PastEventSchema = EventSchema.omit({ location: true })
    .extend({
        // The events table requires end_time. Keep the existing /events schema unchanged.
        endTime: z.string().datetime({ offset: true }),
        imageUrl: HttpUrlSchema.nullable(),
        imageAlt: z.string().min(1).nullable(),
        photos: z.array(EventPhotoSchema),
        projects: z.array(CompetitionProjectSchema),
    })
    .openapi("PastEvent");

export const PastEventsSchema = z.array(PastEventSchema);
export const PastEventsInternalErrorSchema = z.object({
    error: z.literal("InternalError"),
    message: z.string(),
    id: z.string().uuid(),
});

export type PastEvent = z.infer<typeof PastEventSchema>;
