import { Hono } from "hono";

const app = new Hono();
app.get("/", (c) => c.text("Hi"));

Deno.serve({ port: 3000 }, app.fetch);
