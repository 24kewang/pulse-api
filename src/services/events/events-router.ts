import { Router } from "express";
import { z } from "../../common/zod";
import specification, { Tag } from "../../middleware/specification";
import { EventSchema } from "./events-schemas";
import { listEvents } from "./events-lib";
import { InvalidDateRangeError } from "./events-schemas";
import { InvalidDateRangeErrorSchema } from "./events-schemas";
import { EventQuerySchema } from "./events-schemas";

const eventsRouter = Router();

eventsRouter.get(
    "/",
    specification({
        method: "get",
        path: "/events/",
        tag: Tag.EVENTS,
        role: null,
        summary: "Gets all events",
        query: EventQuerySchema,
        responses: {
            200: { description: "All events, ordered by start time", schema: z.array(EventSchema) },
            400: { description: "Invalid date range", schema: InvalidDateRangeErrorSchema },
        },
    }),
    async (req, res) => {
        const { from, to } = req.query;
        if (from && to && new Date(from) >= new Date(to)) {
            return res.status(400).json({ error: InvalidDateRangeError.error, message: InvalidDateRangeError.message });
        }
        const events = await listEvents(from as string | undefined, to as string | undefined);
        return res.status(200).json(events);
    },
);

export default eventsRouter;
