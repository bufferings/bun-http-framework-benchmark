import { createKori } from "@korix/kori";
import { startNodejsServer } from "@korix/nodejs-server";

const app = createKori();

app.get("/", (c) => c.res.text("Hi"));
(async () => {
  await startNodejsServer(app, { port: 3000, hostname: "0.0.0.0" });
})();
