import { Hono } from "hono";
import { sValidator } from "@hono/standard-validator";
import { z } from "zod";

const zodSchema = z.object({
  hello: z.string(),
  count: z.number().int().positive(),
  tags: z.array(z.string()).optional(),
});

const app = new Hono();

app.post(
  "/",
  sValidator("json", zodSchema),
  (c) => c.json(c.req.valid("json")),
);

export default app;
