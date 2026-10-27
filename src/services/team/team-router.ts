import { Router } from "express";
import { z } from "../../common/zod";
import specification, { Tag } from "../../middleware/specification";
import { listTeamMembers } from "./team-lib";
import { TeamMemberSchema, TeamQuerySchema } from "./team-schemas";

const teamRouter = Router();

teamRouter.get(
    "/",
    specification({
        method: "get",
        path: "/team/",
        tag: Tag.TEAM,
        role: null,
        summary: "Gets team members",
        description: "Optionally filters team members by committee and academic year.",
        query: TeamQuerySchema,
        responses: {
            200: { description: "Team members ordered by committee and display order", schema: z.array(TeamMemberSchema) },
        },
    }),
    async (req, res) => {
        const teamMembers = await listTeamMembers(req.query);
        res.status(200).json(teamMembers);
    },
);

export default teamRouter;
