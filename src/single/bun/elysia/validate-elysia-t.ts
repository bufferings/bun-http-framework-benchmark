import { Elysia, t } from "elysia";

const tSchema = t.Object({
  hello: t.String(),
  count: t.Integer({ minimum: 1 }),
  tags: t.Optional(t.Array(t.String())),
});

new Elysia()
  .post("/", (c) => c.body, { body: tSchema })
  .listen(3000);
