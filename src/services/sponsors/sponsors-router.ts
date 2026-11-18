import { Router } from "express";

import { z } from "../../common/zod";

import specification, { Tag } from "../../middleware/specification";

import { listSponsors } from "./sponsors-lib";
import { SponsorSchema, SponsorQuerySchema } from "./sponsors-schemas";

const sponsorsRouter = Router();

sponsorsRouter.get(
    "/",
    specification({
        method: "get",
        path: "/sponsors/",
        tag: Tag.SPONSORS,
        role: null,
        summary: "Gets all sponsors",
        description: "Optionally filters sponsors by year.",
        query: SponsorQuerySchema,
        responses: {
            200: {
                description: "Sponsors ordered by name",
                schema: z.array(SponsorSchema),
            },
        },
    }),
    async (req, res) => {
        const sponsors = await listSponsors(req.query);
        res.status(200).json(sponsors);
    },
);

export default sponsorsRouter;
