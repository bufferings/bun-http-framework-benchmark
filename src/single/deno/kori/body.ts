import { createKori } from "@korix/kori";

const app = createKori();
app.post("/", (c) => c.req.bodyJson().then((body) => c.res.json(body)));

Deno.serve({ port: 3000 }, (await app.generate().onStart()).fetchHandler);
