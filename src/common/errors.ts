import { z } from "./zod";

export class APIError extends Error {
    constructor(
        public error: string,
        message: string,
        public status: number,
        public context?: unknown,
    ) {
        super(message);
    }
}

export class NotImplementedError extends APIError {
    constructor(what: string) {
        super("NotImplemented", `${what} has not been implemented yet`, 501);
    }
}

/**
 * Creates an error body to send plus a matching schema to list under a spec's `responses`.
 * @example
 * export const [EventNotFoundError, EventNotFoundErrorSchema] = CreateErrorAndSchema({
 *     error: "NotFound",
 *     message: "Failed to find event",
 * });
 */
export function CreateErrorAndSchema<TError extends string, TMessage extends string>(params: {
    error: TError;
    message: TMessage;
}): [{ error: TError; message: TMessage }, z.ZodObject<{ error: z.ZodLiteral<TError>; message: z.ZodLiteral<TMessage> }>] {
    const { error, message } = params;
    const schema = z
        .object({ error: z.literal(error), message: z.literal(message) })
        .openapi({ example: { error, message } as never });
    return [{ error, message }, schema];
}
