import { NextFunction, Request, RequestHandler, Response } from "express";
import { RouteConfig } from "@asteasolutions/zod-to-openapi";
import { AnyZodObject, ZodIssue, ZodObject, ZodType, ZodUnknown } from "zod";
import { z } from "../common/zod";
import { APIError } from "../common/errors";
import { ForbiddenError, getAuthenticatedUser, Role } from "../common/auth";
import { bearerAuth, Registry } from "../common/openapi";

// TODO(you): add a tag per service; it groups endpoints in the generated docs.
export enum Tag {
    EVENTS = "Events",
    TEAM = "Team",
}

export interface ResponseObject {
    description: string;
    schema: ZodType;
}
export type ResponsesObject = Record<number, ResponseObject>;

export interface Specification<Params, Query, Responses, Body> {
    method: RouteConfig["method"];
    path: string; // OpenAPI style, e.g. "/events/{id}/"
    tag: Tag;
    role: Role | Role[] | null; // null = public. Role.USER = any logged-in user.
    summary: string;
    description?: string;
    parameters?: Params;
    query?: Query;
    body?: Body;
    responses: Responses;
}

type InferResponseBody<T> = T extends ResponseObject ? z.infer<T["schema"]> : never;
type ResponseBody<T extends ResponsesObject> = InferResponseBody<T[keyof T]>;
type ZodEmptyObject = ZodObject<NonNullable<unknown>>;

export class SpecificationError extends APIError {
    constructor(issues: Record<string, ZodIssue[]>) {
        const summary = Object.entries(issues)
            .flatMap(([location, list]) =>
                list.map(({ path, message }) => `  - ${location}${path.length ? `.${path.join(".")}` : ""}: ${message}`),
            )
            .join("\n");
        super("BadRequest", `Bad request made - invalid format.\n${summary}`, 400, issues);
    }
}

function registerSpecification(spec: Specification<AnyZodObject, AnyZodObject, ResponsesObject, ZodType>): void {
    const roles = spec.role === null ? [] : [spec.role].flat();
    const roleHeader = roles.length ? `**Requires one of: ${roles.join(", ")}**` : undefined;

    Registry.registerPath({
        method: spec.method,
        path: spec.path,
        tags: [spec.tag],
        summary: spec.summary,
        description: [roleHeader, spec.description].filter(Boolean).join("\n\n") || undefined,
        security: roles.length ? [{ [bearerAuth.name]: [] }] : undefined,
        request: {
            params: spec.parameters,
            query: spec.query,
            body: spec.body ? { content: { "application/json": { schema: spec.body } } } : undefined,
        },
        responses: Object.fromEntries(
            Object.entries(spec.responses).map(([status, { description, schema }]) => [
                status,
                { description, content: { "application/json": { schema } } },
            ]),
        ),
    });
}

/**
 * Declares an endpoint once: registers it in the OpenAPI docs, checks the caller's role,
 * validates params/query/body, and types `req` and `res.send()` for the handler that follows.
 */
export default function specification<
    Responses extends ResponsesObject,
    Params extends AnyZodObject = ZodEmptyObject,
    Query extends AnyZodObject = ZodEmptyObject,
    Body extends ZodType = ZodUnknown,
>(
    spec: Specification<Params, Query, Responses, Body>,
): RequestHandler<z.infer<Params>, ResponseBody<Responses>, z.infer<Body>, z.infer<Query>> {
    registerSpecification(spec);

    const handler = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        if (spec.role !== null) {
            const allowed = [spec.role].flat();
            const user = await getAuthenticatedUser(req);
            if (!allowed.some((role) => user.roles.includes(role))) {
                throw new ForbiddenError(allowed);
            }
        }

        const issues: Record<string, ZodIssue[]> = {};
        const parse = async (location: string, schema: ZodType | undefined, data: unknown): Promise<unknown> => {
            if (!schema) {
                return data;
            }
            const result = await schema.safeParseAsync(data);
            if (!result.success) {
                issues[location] = result.error.issues;
                return data;
            }
            return result.data;
        };

        const params = await parse("parameters", spec.parameters, req.params);
        const query = await parse("query", spec.query, req.query);
        const body = await parse("body", spec.body, req.body);

        if (Object.keys(issues).length > 0) {
            throw new SpecificationError(issues);
        }

        req.params = params as Request["params"];
        Object.defineProperty(req, "query", { value: query, writable: true });
        req.body = body;
        next();
    };

    return handler as unknown as RequestHandler<z.infer<Params>, ResponseBody<Responses>, z.infer<Body>, z.infer<Query>>;
}
