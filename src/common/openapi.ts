import { OpenApiGeneratorV31, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import type { OpenAPIObject } from "openapi3-ts/oas31";

export const Registry = new OpenAPIRegistry();

export const bearerAuth = Registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Supabase access token (session.access_token on the frontend)",
});

let spec: OpenAPIObject | undefined;

export function getOpenAPISpec(): OpenAPIObject {
    spec ??= new OpenApiGeneratorV31(Registry.definitions).generateDocument({
        openapi: "3.1.0",
        info: { title: "pulse-api", version: "0.1.0" },
    });
    return spec;
}
