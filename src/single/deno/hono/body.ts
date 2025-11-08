import { Hono } from "hono";

const app = new Hono();
app.post("/", (c) => c.req.json().then((body) => c.json(body)));

Deno.serve({ port: 3000 }, app.fetch);
