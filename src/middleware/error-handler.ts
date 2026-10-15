import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";
import { APIError } from "../common/errors";

function hasType(error: unknown, type: string): boolean {
    return typeof error === "object" && error !== null && "type" in error && error.type === type;
}

export function ErrorHandler(error: unknown, req: Request, res: Response, _next: NextFunction): void {
    if (error instanceof APIError) {
        res.status(error.status).json({ error: error.error, message: error.message, context: error.context });
        return;
    }
    if (hasType(error, "entity.parse.failed")) {
        res.status(400).json({ error: "BadRequest", message: "Unable to parse the request. Are you sending valid JSON?" });
        return;
    }
    if (hasType(error, "entity.too.large")) {
        res.status(413).json({ error: "PayloadTooLarge", message: "Your request body is too large" });
        return;
    }

    const id = randomUUID();
    const detail = error instanceof Error ? error.stack : String(error);
    console.error(`ERROR ${id} - ${req.method} ${req.path}:\n${detail}`);
    res.status(500).json({ error: "InternalError", message: `Something went wrong. Id: ${id}`, id });
}
