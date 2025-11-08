import { Elysia } from "elysia";

new Elysia()
  .post("/", (c) => c.body, { parse: "json" })
  .listen(3000);
