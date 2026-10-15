import { AuthenticatedUser, Role } from "./auth";

export const TEST_USER_ID = "00000000-0000-0000-0000-000000000001";

// A fake logged-in user to return from a mocked getAuthenticatedUser. Always has Role.USER.
export function makeUser(...roles: Role[]): AuthenticatedUser {
    return {
        id: TEST_USER_ID,
        email: "tester@example.com",
        roles: [...new Set([Role.USER, ...roles])],
        accessToken: "test-access-token",
    };
}
