import { Router } from "express";
import specification, { Tag } from "../../middleware/specification";
import { listPastEvents } from "./past-events-lib";
import { PastEventsInternalErrorSchema, PastEventsSchema } from "./past-events-schemas";

const pastEventsRouter = Router();

pastEventsRouter.get(
    "/",
    specification({
        method: "get",
        path: "/past-events/",
        tag: Tag.PAST_EVENTS,
        role: null,
        summary: "Gets completed events with photos and competition projects",
        responses: {
            200: { description: "Past events, newest start time first", schema: PastEventsSchema },
            500: { description: "Unexpected server error", schema: PastEventsInternalErrorSchema },
        },
    }),
    async (_req, res) => {
        const events = await listPastEvents();
        res.status(200).json(events);
    },
);

export default pastEventsRouter;
