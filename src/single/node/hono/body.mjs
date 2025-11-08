import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.post("/", (c) => c.req.json().then((body) => c.json(body)));

serve({ fetch: app.fetch, port: 3000 });
