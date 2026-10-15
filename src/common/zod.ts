import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Always import `z` from here (not "zod") so `.openapi()` is available on every schema.
extendZodWithOpenApi(z);

export { z };
