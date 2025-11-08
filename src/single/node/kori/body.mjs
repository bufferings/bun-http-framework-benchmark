import { createKori } from "@korix/kori";
import { startNodejsServer } from "@korix/nodejs-server";

const app = createKori();

app.post("/", (c) => c.req.bodyJson().then((body) => c.res.json(body)));
(async () => {
  await startNodejsServer(app, { port: 3000, hostname: "0.0.0.0" });
})();
