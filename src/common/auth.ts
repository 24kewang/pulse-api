import { Request } from "express";
import { User } from "@supabase/supabase-js";
import { getAnonClient } from "./supabase";
import { APIError } from "./errors";

// TODO: define the roles your club needs. Every logged-in user gets USER.
export enum Role {
    USER = "USER",
    MEMBER = "MEMBER",
    ADMIN = "ADMIN",
}

export interface AuthenticatedUser {
    id: string;
    email: string | undefined;
    roles: Role[];
    accessToken: string;
}

type RequestWithAuth = Request & { authenticatedUser?: AuthenticatedUser };

export class AuthenticationError extends APIError {
    constructor() {
        super("Unauthorized", "You must be logged in to do that", 401);
    }
}

export class ForbiddenError extends APIError {
    constructor(roles: Role[]) {
        super("Forbidden", `You require one of the roles: ${roles.join(", ")} to do that`, 403);
    }
}

// TODO: decide where roles live. This reads `app_metadata.roles`, which only the service role can set.
// Alternative: look the user up in a `profiles` table with getServiceClient().
async function getRoles(user: User): Promise<Role[]> {
    const raw: unknown = user.app_metadata?.roles;
    const validRoles: string[] = Object.values(Role);
    const extra = Array.isArray(raw) ? raw.filter((r): r is Role => validRoles.includes(r)) : [];
    return [...new Set([Role.USER, ...extra])];
}

function getBearerToken(req: Request): string | undefined {
    const header = req.headers.authorization;
    return header?.startsWith("Bearer ") ? header.substring("Bearer ".length) : undefined;
}

/**
 * Verifies the Supabase access token the frontend sends as `Authorization: Bearer <token>`.
 * Throws AuthenticationError if it is missing or invalid. Cached per request.
 */
export async function getAuthenticatedUser(req: Request): Promise<AuthenticatedUser> {
    const cached = (req as RequestWithAuth).authenticatedUser;
    if (cached) {
        return cached;
    }

    const token = getBearerToken(req);
    if (!token) {
        throw new AuthenticationError();
    }

    const { data, error } = await getAnonClient().auth.getUser(token);
    if (error || !data.user) {
        throw new AuthenticationError();
    }

    const user: AuthenticatedUser = {
        id: data.user.id,
        email: data.user.email,
        roles: await getRoles(data.user),
        accessToken: token,
    };
    (req as RequestWithAuth).authenticatedUser = user;
    return user;
}
