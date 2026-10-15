import { describe, expect, it, vi } from "vitest";
import express, { Router } from "express";
import request from "supertest";
import { z } from "../common/zod";
import { AuthenticationError, getAuthenticatedUser, Role } from "../common/auth";
import { makeUser } from "../common/test-tools";
import { ErrorHandler } from "./error-handler";
import specification, { Tag } from "./specification";

vi.mock("../common/auth", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../common/auth")>()),
    getAuthenticatedUser: vi.fn(),
}));

const router = Router();
router.post(
    "/:id/",
    specification({
        method: "post",
        path: "/spec-test/{id}/",
        tag: Tag.EVENTS,
        role: Role.ADMIN,
        summary: "Test-only endpoint",
        parameters: z.object({ id: z.coerce.number().int() }),
        body: z.object({ name: z.string().min(1) }),
        responses: {
            200: { description: "Echo", schema: z.object({ id: z.number(), name: z.string() }) },
        },
    }),
    (req, res) => {
        res.status(200).json({ id: req.params.id, name: req.body.name });
    },
);

const app = express();
app.use(express.json());
app.use("/spec-test/", router);
app.use(ErrorHandler);

describe("specification()", () => {
    it("rejects requests without a valid token", async () => {
        vi.mocked(getAuthenticatedUser).mockRejectedValueOnce(new AuthenticationError());

        const response = await request(app).post("/spec-test/1/").send({ name: "x" }).expect(401);
        expect(response.body).toMatchObject({ error: "Unauthorized" });
    });

    it("rejects users without the required role", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValueOnce(makeUser(Role.MEMBER));

        const response = await request(app).post("/spec-test/1/").send({ name: "x" }).expect(403);
        expect(response.body).toMatchObject({ error: "Forbidden" });
    });

    it("rejects invalid bodies with details", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValueOnce(makeUser(Role.ADMIN));

        const response = await request(app).post("/spec-test/1/").send({ name: "" }).expect(400);
        expect(response.body).toMatchObject({ error: "BadRequest" });
        expect(response.body.context).toHaveProperty("body");
    });

    it("passes parsed values to the handler", async () => {
        vi.mocked(getAuthenticatedUser).mockResolvedValueOnce(makeUser(Role.ADMIN));

        const response = await request(app).post("/spec-test/42/").send({ name: "x" }).expect(200);
        expect(response.body).toEqual({ id: 42, name: "x" });
    });
});
