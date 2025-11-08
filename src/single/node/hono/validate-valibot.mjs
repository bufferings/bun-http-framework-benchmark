import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { sValidator } from "@hono/standard-validator";
import * as v from "valibot";

const valibotSchema = v.object({
  hello: v.string(),
  count: v.pipe(v.number(), v.integer(), v.minValue(1)),
  tags: v.optional(v.array(v.string())),
});

const app = new Hono();

app.post(
  "/",
  sValidator("json", valibotSchema),
  (c) => c.json(c.req.valid("json")),
);

serve({ fetch: app.fetch, port: 3000 });
