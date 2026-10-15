# pulse-api

Backend API for the Pulse club website: an Express 5 app with Supabase providing Postgres and auth, deployed to Vercel automatically by CI.

- **Validation, types and docs** all come from [zod](https://zod.dev) schemas. Each endpoint is declared once with `specification()`.
- **Auth:** the frontend logs in with Supabase and sends the access token. The API verifies it and checks roles.
- **You only need Node and Git.** No Vercel account or CLI is needed: open a PR and CI tests it, then deploys a preview.

## Getting started

Requires Node 20+ (CI uses 24).

```bash
git clone <repo-url> && cd pulse-api
npm install
npm test                  # works immediately, no keys needed
cp .env.example .env      # then paste in the pulse-dev keys from the API owner
npm run dev               # http://localhost:3000, restarts on change
```

Open `http://localhost:3000/status/` and `http://localhost:3000/docs/json`.
To browse the docs, paste the JSON into [editor.swagger.io](https://editor.swagger.io).

Your `.env` points at **pulse-dev**, a separate Supabase project with throwaway data, so you can't break anything real.
Never put production keys in `.env`; nobody but the API owner should have them.

| Script                    | What it does                                                                |
| ------------------------- | --------------------------------------------------------------------------- |
| `npm run dev`             | Local server with hot reload (reads `.env`)                                 |
| `npm test`                | Run the test suite once (Vitest)                                            |
| `npm run test:watch`      | Re-run affected tests on every save                                         |
| `npm run verify`          | Typecheck, lint and format check (the same checks CI runs)                  |
| `npm run lint` / `format` | Auto-fix lint / formatting                                                  |
| `npm run token`           | Print an access token for the pulse-dev test user (see [Testing](#testing)) |

## Development workflow

```
feature branch ──▶ PR ──▶ CI: verify + tests ──▶ preview deploy (pulse-dev data) ──▶ review ──▶ merge to main ──▶ CI ──▶ production (pulse-prod data)
```

1. Create a branch from `main` (`git switch -c events-detail-endpoint`).
2. Make your change, run `npm run verify && npm test`, and test it manually with `npm run dev`.
3. Push and open a PR. CI runs the same checks. If they pass, it deploys a **preview**, and the PR gets a **View deployment** link.
   The preview uses the pulse-dev database, so it is safe to click around.
4. Once the PR is approved and merged, CI runs again on `main` and deploys to **production**.

`main` is protected: you can't push to it directly, and a PR can't merge until CI passes.
If CI fails, open the failed job on the PR's **Checks** tab. The output is the same as running `npm run verify` or `npm test` locally.

## Repo structure

```
api/index.ts                    Vercel entrypoint. Just re-exports the Express app.
vercel.json                     Routes every path to the Express app; turns off Vercel's own Git deploys (CI deploys instead).
src/
  app.ts                        Builds the app: CORS, JSON parsing, routers, /docs/json, /status, 404, error handler.
  server.ts                     Local dev only (app.listen).
  common/
    config.ts                   The ONLY place env vars are read. Fails fast if one is missing.
    zod.ts                      Import `z` from here, not from "zod" (adds .openapi()).
    errors.ts                   APIError, NotImplementedError, CreateErrorAndSchema().
    auth.ts                     Role enum, getAuthenticatedUser(req), role lookup.
    supabase.ts                 Supabase clients: anon, per-user, service (admin).
    openapi.ts                  OpenAPI registry and document generation.
    test-tools.ts               Test helpers (makeUser).
  middleware/
    specification.ts            specification(): docs, role check, validation and typing for one endpoint. Also the Tag enum.
    error-handler.ts            Turns any thrown error into a JSON response.
  services/<name>/              One folder per resource:
    <name>-router.ts              endpoints (spec and handler)
    <name>-schemas.ts             zod request/response shapes and errors
    <name>-lib.ts                 data access and business logic (Supabase queries live here)
    <name>-*.test.ts              tests
  types/database.ts             TypeScript types for the database tables.
scripts/get-token.ts            Gets an access token for the pulse-dev test user.
supabase/migrations/            SQL that defines tables and Row Level Security policies.
supabase/seed.sql               Sample data for pulse-dev.
.github/workflows/ci.yml        CI: verify and test, then deploy a preview (PRs) or production (main).
GUIDE.md                        Owner-only: setting up Supabase, Vercel and GitHub.
```

## How a request flows

```
Vercel  ──rewrite──▶  api/index.ts  ──▶  app.ts  ──▶  services/<name>/<name>-router.ts
                                                        │
                                                        ├─ specification()   role check → validate params/query/body (400/401/403)
                                                        ├─ handler           calls <name>-lib.ts
                                                        └─ <name>-lib.ts     queries Supabase, maps rows → API shape
                                     any thrown error ──▶ middleware/error-handler.ts ──▶ { error, message }
```

All errors use the same shape: `{ "error": "MachineReadableCode", "message": "Human readable text" }`.
Unexpected errors return `500 InternalError` with an `id`. Locally the full stack trace is printed in your terminal. On a preview or in production, send the `id` to the API owner, who can find it in the logs.

## Contributing

### Add an endpoint to an existing service

1. Define any new request and response shapes in `<name>-schemas.ts` (see [Change a schema](#change-a-schema)).
2. Add a route in `<name>-router.ts`:

    ```ts
    eventsRouter.get(
        "/:id/",
        specification({
            method: "get",
            path: "/events/{id}/", // OpenAPI style path
            tag: Tag.EVENTS,
            role: null, // or Role.USER / Role.ADMIN / [Role.MEMBER, Role.ADMIN]
            summary: "Gets one event",
            parameters: z.object({ id: z.string().uuid() }),
            responses: {
                200: { description: "The event", schema: EventSchema },
                404: { description: "No such event", schema: EventNotFoundErrorSchema },
            },
        }),
        async (req, res) => {
            const event = await getEvent(req.params.id); // req.params is typed and already validated
            if (!event) {
                return res.status(404).json(EventNotFoundError);
            }
            return res.status(200).json(event); // must match a schema in `responses`
        },
    );
    ```

3. Put the Supabase query in `<name>-lib.ts`, not in the handler.
4. Write tests (see [Testing](#testing)).
5. Run `npm run verify && npm test`, then open a PR.

Rules: never hand-validate `req.body` (use `body:` in the spec), and list every status code the handler can return under `responses`.

### Add a new service

1. Create `src/services/<name>/` with `-router.ts`, `-schemas.ts`, `-lib.ts` and tests. Copy `events/` as a starting point.
2. Add a `Tag` entry in [src/middleware/specification.ts](src/middleware/specification.ts).
3. Mount the router in [src/app.ts](src/app.ts) with `app.use("/<name>/", router)`.
4. If the service needs a table, see [Database changes](#database-changes).

### Change a schema

There are two kinds of schema, and they are kept separate on purpose:

| Schema                    | Lives in                                          | Defines                                                    |
| ------------------------- | ------------------------------------------------- | ---------------------------------------------------------- |
| **API schema** (zod)      | `services/<name>/<name>-schemas.ts`               | What clients send and receive. Drives validation and docs. |
| **Database schema** (SQL) | `supabase/migrations/*.sql` → `types/database.ts` | Columns stored in Postgres                                 |

The `to<Thing>()` function in `<name>-lib.ts` maps one to the other, e.g. `start_time` → `startTime`.

- To change what clients see, edit the zod schema and `to<Thing>()`. No database work is needed.
- To change what is stored, follow [Database changes](#database-changes).

### Database changes

You don't need access to the Supabase dashboard. Database changes go through your PR, and the API owner applies them:

1. Add a new file in `supabase/migrations/`, numbered after the last one (e.g. `0002_add_event_capacity.sql`).
   Never edit a migration that is already on `main`.
2. Update `src/types/database.ts` by hand to match. Add the new columns to `Row`, `Insert` and `Update`.
3. If the new table or column needs sample data, update `supabase/seed.sql`.
4. Enable Row Level Security on any new table and add policies for who may read and write (see the existing migration).
5. Add the **`needs migration`** label to the PR, or say so in the description. The owner applies it to pulse-dev so your preview works, then to production before merging.

Until the owner has applied it to pulse-dev, `npm run dev` and the preview will error on the new columns. Your tests still pass because they mock the database.

Choosing a client from [src/common/supabase.ts](src/common/supabase.ts):

| Client                            | Use for                                | RLS                                           |
| --------------------------------- | -------------------------------------- | --------------------------------------------- |
| `getAnonClient()`                 | Public reads (e.g. listing events)     | Applies (anonymous)                           |
| `getUserClient(user.accessToken)` | Acting on behalf of the logged-in user | Applies (as that user)                        |
| `getServiceClient()`              | Admin-only operations                  | **Bypassed**: only use behind an admin `role` |

### Auth and roles

- The frontend signs users in with Supabase Auth and sends `Authorization: Bearer <session.access_token>` on API requests.
- To require login, set `role: Role.USER` in the spec. To require a specific role, use e.g. `role: Role.ADMIN` or `[Role.MEMBER, Role.ADMIN]`. Use `role: null` for public endpoints.
- Inside a handler, `const user = await getAuthenticatedUser(req)` returns `{ id, email, roles, accessToken }`. It is cached, so calling it after the spec has checked the role costs nothing.
- Roles are defined in the `Role` enum in [src/common/auth.ts](src/common/auth.ts) and read from each user's `app_metadata.roles`. Only the API owner can assign roles. Ask them if your pulse-dev test user needs one.

### Errors

- Expected failures: define them with `CreateErrorAndSchema` in `-schemas.ts`. Either `return res.status(404).json(SomeError)` and list `SomeErrorSchema` under `responses`, or `throw new APIError(code, message, status)` from anywhere.
- Unexpected failures: just `throw`. Express 5 forwards it to the error handler, which logs it and returns a 500.

### Environment variables

1. Read new variables **only** in [src/common/config.ts](src/common/config.ts) with `requireEnv("NAME")`, then use `Config.NAME` elsewhere.
2. Add the variable to `.env.example` with an empty value, and give it a dummy value in [vitest.config.ts](vitest.config.ts) so tests still run.
3. Say in the PR description that a new variable is needed. The API owner adds the real values to the preview and production environments before merging; otherwise the deploy would crash on startup.

`.env` is gitignored. Never commit real values.

## Testing

### How testing works here

- **Tests never touch a real database or the network.** The data layer (`<name>-lib.ts`) and auth are mocked, so `npm test` runs in about a second and needs no keys, both locally and in CI.
- **Endpoints are tested over HTTP.** [supertest](https://github.com/ladjs/supertest) sends real requests to the Express `app`, so routing, `specification()` validation, role checks, the handler, and the error handler all run exactly as in production.
- **Real Supabase queries are tested manually**, with `npm run dev` against pulse-dev and then on the PR preview. Keep queries in `-lib.ts` small and simple so most logic stays in code the tests can cover.
- Tests live next to the code they test, named `*.test.ts`. Vitest finds them automatically.

### Running tests

```bash
npm test                               # everything, once
npm run test:watch                     # re-run on save; press h for options
npx vitest run events                  # only files whose path contains "events"
npx vitest run -t "returns a JSON 501" # only tests whose name matches
```

### Anatomy of an endpoint test

From [src/services/events/events-router.test.ts](src/services/events/events-router.test.ts):

```ts
import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../app";
import { listEvents } from "./events-lib";

// 1. Replace every export of the lib with an empty mock function (vi.mock is hoisted to the top of the file).
vi.mock("./events-lib", () => ({ listEvents: vi.fn() }));

describe("GET /events/", () => {
    it("returns events from the data layer", async () => {
        // 2. Decide what the "database" returns for this test.
        vi.mocked(listEvents).mockResolvedValueOnce([TEST_EVENT]);

        // 3. Make a real HTTP request and check the status and body.
        const response = await request(app).get("/events/").expect(200);
        expect(response.body).toEqual([TEST_EVENT]);
    });
});
```

Useful mock calls:

| Call                                                     | Use it to                                               |
| -------------------------------------------------------- | ------------------------------------------------------- |
| `vi.mocked(fn).mockResolvedValueOnce(value)`             | Make the next call return `value`                       |
| `vi.mocked(fn).mockRejectedValueOnce(new APIError(...))` | Simulate a failure (not found, DB error, ...)           |
| `expect(fn).toHaveBeenCalledWith(args)`                  | Check the handler passed the right arguments to the lib |

Mocks are reset between test files. Within a file, prefer `...Once` so tests don't leak into each other.

### Testing protected endpoints

Mock `getAuthenticatedUser` and use `makeUser()` from [src/common/test-tools.ts](src/common/test-tools.ts) to choose who is calling.
[src/middleware/specification.test.ts](src/middleware/specification.test.ts) is a complete example:

```ts
import { AuthenticationError, getAuthenticatedUser, Role } from "../../common/auth";
import { makeUser } from "../../common/test-tools";

// Keep the real auth module but replace getAuthenticatedUser.
vi.mock("../../common/auth", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../common/auth")>()),
    getAuthenticatedUser: vi.fn(),
}));

it("only lets admins create events", async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValueOnce(new AuthenticationError());
    await request(app).post("/events/").send(body).expect(401); // not logged in

    vi.mocked(getAuthenticatedUser).mockResolvedValueOnce(makeUser(Role.MEMBER));
    await request(app).post("/events/").send(body).expect(403); // wrong role

    vi.mocked(getAuthenticatedUser).mockResolvedValueOnce(makeUser(Role.ADMIN));
    await request(app).post("/events/").send(body).expect(201); // allowed
});
```

`makeUser()` always includes `Role.USER`. Its `id` is `TEST_USER_ID`, which is handy for asserting that the handler passed the caller's id to the lib.

### Testing validation

`specification()` returns `400 BadRequest` and lists every problem under `context`. Test at least one invalid input per endpoint that takes params, a query or a body:

```ts
const response = await request(app).post("/events/").send({ title: "" }).expect(400);
expect(response.body.context).toHaveProperty("body");
```

### Unit-testing lib functions

Pure functions such as the `to<Thing>()` mappers can be tested directly, without HTTP. Do this in a separate file from the router test, because the router test mocks the whole lib.
See [src/services/events/events-lib.test.ts](src/services/events/events-lib.test.ts).

### Manual testing against pulse-dev

With your `.env` filled in:

```bash
npm run dev
curl http://localhost:3000/events/                                              # public endpoint
curl -H "Authorization: Bearer $(npm run -s token)" http://localhost:3000/...   # protected endpoint
```

`npm run token` signs in as the pulse-dev test user from `DEV_USER_EMAIL` / `DEV_USER_PASSWORD` in `.env` (get these from the API owner) and prints an access token.
Tokens expire after about an hour; just run it again. pulse-dev data is shared with the rest of the team, so clean up anything you create.

### Testing on the preview deployment

Every PR that passes CI gets a preview URL (the **View deployment** button on the PR). It runs your branch against pulse-dev, exactly as production would run against pulse-prod.
Point the frontend at it, or `curl` it, to check the whole flow before merging.

### What CI checks

CI runs `npm run verify` (typecheck, lint, Prettier) and `npm test` on every PR and every push to `main`. Nothing deploys unless both pass.

### Checklist for each new endpoint

- [ ] Success case: status code and body
- [ ] Each error response listed in its spec (e.g. 404)
- [ ] At least one invalid input → 400
- [ ] If protected: no token → 401, wrong role → 403, right role → success
- [ ] If the handler passes user input or the caller's id to the lib: `toHaveBeenCalledWith(...)`

## Deployment

Deployment is automatic, and only the API owner has access to Vercel:

- **PR passes CI** → preview deployment against pulse-dev, linked on the PR.
- **Merged to `main` and CI passes** → production deployment against pulse-prod.

If a deploy step fails while verify and tests passed, tell the API owner. It is usually a missing env var or an expired token.
If the frontend calls this API from a new domain, add that origin to `ALLOWED_ORIGINS` in [src/common/config.ts](src/common/config.ts).

## Conventions checklist

- [ ] Each endpoint uses `specification()`, with every response listed.
- [ ] `z` is imported from `common/zod`, and env vars are read only in `common/config.ts`.
- [ ] Supabase queries live in `-lib.ts`, and DB rows are mapped to API shapes before sending.
- [ ] New tables have RLS enabled, and `getServiceClient()` is used only behind admin roles.
- [ ] Schema changes come with a migration and updated `types/database.ts`, and the PR says so.
- [ ] Each new endpoint has tests, and `npm run verify && npm test` passes before you push.
