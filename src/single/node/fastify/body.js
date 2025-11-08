const fastify = require("fastify");

fastify()
  .post("/", async (req, reply) => {
    reply.send(req.body);
  })
  .listen({ host: "0.0.0.0", port: 3000 });
