import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "./app";

describe("app", () => {
    it("responds to /status/", async () => {
        const response = await request(app).get("/status/").expect(200);
        expect(response.body).toMatchObject({ ok: true });
    });

    it("documents every endpoint at /docs/json", async () => {
        const response = await request(app).get("/docs/json").expect(200);
        expect(Object.keys(response.body.paths)).toContain("/events/");
    });

    it("returns a JSON 404 for unknown routes", async () => {
        const response = await request(app).get("/nope").expect(404);
        expect(response.body).toMatchObject({ error: "EndpointNotFound" });
    });
});
