import { createKori } from "@korix/kori";

const app = createKori();
app.get("/:id", (c) => {
  c.res.setHeader("x-powered-by", "benchmark");
  return c.res.text(`${c.req.param("id")} ${c.req.query("name")}`);
});

Deno.serve({ port: 3000 }, (await app.generate().onStart()).fetchHandler);
