import { Elysia } from "elysia";
import { z } from "zod";

const zodSchema = z.object({
  hello: z.string(),
  count: z.number().int().positive(),
  tags: z.array(z.string()).optional(),
});

new Elysia()
  .post("/", (c) => c.body, { body: zodSchema })
  .listen(3000);
