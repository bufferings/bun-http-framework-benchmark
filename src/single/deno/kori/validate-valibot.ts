import { createKori } from "@korix/kori";
import {
  enableStdRequestValidation,
  stdRequestSchema,
} from "@korix/std-schema-adapter";
import * as v from "valibot";

const valibotSchema = v.object({
  hello: v.string(),
  count: v.pipe(v.number(), v.integer(), v.minValue(1)),
  tags: v.optional(v.array(v.string())),
});

const app = createKori({
  ...enableStdRequestValidation(),
});

app.post("/", {
  requestSchema: stdRequestSchema({ body: valibotSchema }),
  handler: (c) => c.res.json(c.req.validatedBody()),
});

Deno.serve({ port: 3000 }, (await app.generate().onStart()).fetchHandler);
