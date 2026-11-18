import { z } from "../../common/zod";

import { Tables } from "../../types/database";

export type SponsorRow = Tables<"sponsors">;

export const SponsorSchema = z
    .object({
        id: z.string().uuid(),
        name: z.string(),
        logoUrl: z.string().url().nullable(),
        websiteUrl: z.string().url().nullable(),
        description: z.string().nullable(),
        year: z.number().int().nullable(),
        createdAt: z.string().datetime(),
    })
    .openapi("Sponsor");

export const SponsorQuerySchema = z.object({
    year: z
        .string()
        .regex(/^\d{4}$/)
        .optional()
        .openapi({ example: "2026" }),
});

export type Sponsor = z.infer<typeof SponsorSchema>;
export type SponsorQuery = z.infer<typeof SponsorQuerySchema>;
