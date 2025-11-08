import { Hono } from "hono";
import { sValidator } from "@hono/standard-validator";
import { type } from "arktype";

const arktypeSchema = type({
  hello: "string",
  count: "number>0",
  "tags?": "string[]",
});

const app = new Hono();

app.post(
  "/",
  sValidator("json", arktypeSchema),
  (c) => c.json(c.req.valid("json")),
);

export default app;
