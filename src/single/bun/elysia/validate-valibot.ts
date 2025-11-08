import { Elysia } from "elysia";
import * as v from "valibot";

const valibotSchema = v.object({
  hello: v.string(),
  count: v.pipe(v.number(), v.integer(), v.minValue(1)),
  tags: v.optional(v.array(v.string())),
});

new Elysia()
  .post("/", (c) => c.body, { body: valibotSchema })
  .listen(3000);
