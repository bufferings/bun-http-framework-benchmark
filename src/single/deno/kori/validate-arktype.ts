import { createKori } from "@korix/kori";
import {
  enableStdRequestValidation,
  stdRequestSchema,
} from "@korix/std-schema-adapter";
import { type } from "arktype";

const arktypeSchema = type({
  hello: "string",
  count: "number>0",
  "tags?": "string[]",
});

const app = createKori({
  ...enableStdRequestValidation(),
});

app.post("/", {
  requestSchema: stdRequestSchema({ body: arktypeSchema }),
  handler: (c) => c.res.json(c.req.validatedBody()),
});

Deno.serve({ port: 3000 }, (await app.generate().onStart()).fetchHandler);
