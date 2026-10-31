import { z } from "../../common/zod";
import { Tables } from "../../types/database";

export type TeamMemberRow = Tables<"team_members">;

export const TeamMemberSchema = z
    .object({
        id: z.string().uuid(),
        name: z.string(),
        position: z.string(),
        committee: z.string(),
        year: z.string(),
        imageUrl: z.string().url().nullable(),
        linkedinUrl: z.string().url().nullable(),
        email: z.string().email().nullable(),
        displayOrder: z.number().int(),
        createdAt: z.string().datetime(),
    })
    .openapi("TeamMember");

export const TeamQuerySchema = z.object({
    committee: z.string().min(1).optional().openapi({ example: "Technical" }),
    year: z.string().min(1).optional().openapi({ example: "2025-26" }),
});

export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type TeamQuery = z.infer<typeof TeamQuerySchema>;
