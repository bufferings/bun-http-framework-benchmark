import { createKori } from "@korix/kori";
import { startNodejsServer } from "@korix/nodejs-server";
import {
  enableStdRequestValidation,
  stdRequestSchema,
} from "@korix/standard-schema-adapter";
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
(async () => {
  await startNodejsServer(app, { port: 3000, hostname: "0.0.0.0" });
})();
