import { createKori } from "@korix/kori";
import {
  enableStdRequestValidation,
  stdRequestSchema,
} from "@korix/standard-schema-adapter";
import { z } from "zod";

const zodSchema = z.object({
  hello: z.string(),
  count: z.number().int().positive(),
  tags: z.array(z.string()).optional(),
});

const app = createKori({
  ...enableStdRequestValidation(),
});

app.post("/", {
  requestSchema: stdRequestSchema({ body: zodSchema }),
  handler: (c) => c.res.json(c.req.validatedBody()),
});

export default {
  fetch: (await app.generate().onStart()).fetchHandler,
};
