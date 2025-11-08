import { createKori } from "@korix/kori";

const app = createKori();
app.get("/", (c) => c.res.text("Hi"));

Deno.serve({ port: 3000 }, (await app.generate().onStart()).fetchHandler);
