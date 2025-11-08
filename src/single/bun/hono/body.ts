import { Hono } from "hono";

const app = new Hono();

app.post("/", (c) => c.req.json().then((body) => c.json(body)));

export default app;
