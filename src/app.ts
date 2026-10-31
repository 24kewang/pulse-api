import express, { Request, Response } from "express";
import cors from "cors";
import Config from "./common/config";
import { getOpenAPISpec } from "./common/openapi";
import { ErrorHandler } from "./middleware/error-handler";
import eventsRouter from "./services/events/events-router";
import pastEventsRouter from "./services/past-events/past-events-router";
import teamRouter from "./services/team/team-router";

const app = express();

app.enable("trust proxy");
app.use(
    cors({
        origin: (origin, callback) => callback(null, !origin || Config.ALLOWED_ORIGINS.some((regex) => regex.test(origin))),
    }),
);
app.use(express.json({ limit: Config.MAX_REQUEST_SIZE }));

// Routers: one per service
app.use("/events/", eventsRouter);
app.use("/past-events/", pastEventsRouter);
app.use("/team", teamRouter);

app.get("/docs/json", (_req: Request, res: Response) => {
    res.json(getOpenAPISpec());
});

app.get(["/", "/status/"], (_req: Request, res: Response) => {
    res.json({ ok: true, docs: "/docs/json" });
});

app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "EndpointNotFound", message: "This endpoint doesn't exist, see /docs/json" });
});

app.use(ErrorHandler);

export default app;
