import { createKori } from "@korix/kori";
import { startNodejsServer } from "@korix/nodejs-server";

const app = createKori();

app.get("/:id", (c) => {
  c.res.setHeader("x-powered-by", "benchmark");
  return c.res.text(`${c.req.param("id")} ${c.req.query("name")}`);
});
(async () => {
  await startNodejsServer(app, { port: 3000, hostname: "0.0.0.0" });
})();
