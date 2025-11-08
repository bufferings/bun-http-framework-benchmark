import { Hono } from "hono";
import { RegExpRouter } from "hono/router/reg-exp-router";
import { sValidator } from "@hono/standard-validator";
import * as v from "valibot";

const valibotSchema = v.object({
  hello: v.string(),
  count: v.pipe(v.number(), v.integer(), v.minValue(1)),
  tags: v.optional(v.array(v.string())),
});

const app = new Hono({ router: new RegExpRouter() });

app.post(
  "/",
  sValidator("json", valibotSchema),
  (c) => c.json(c.req.valid("json")),
);

export default app;
