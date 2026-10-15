import { Router } from "express";
import { z } from "../../common/zod";
import specification, { Tag } from "../../middleware/specification";
import { EventSchema } from "./events-schemas";
import { listEvents } from "./events-lib";

const eventsRouter = Router();

eventsRouter.get(
    "/",
    specification({
        method: "get",
        path: "/events/",
        tag: Tag.EVENTS,
        role: null,
        summary: "Gets all events",
        responses: {
            200: { description: "All events, ordered by start time", schema: z.array(EventSchema) },
        },
    }),
    async (_req, res) => {
        const events = await listEvents();
        res.status(200).json(events);
    },
);

export default eventsRouter;
