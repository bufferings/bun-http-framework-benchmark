import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.get("/", (c) => c.text("Hi"));

serve({ fetch: app.fetch, port: 3000 });
