const fastify = require('fastify')

fastify()
	.post('/', async (req, reply) => {
		reply.send(req.body)
	})
	.listen({ port: 3000 })
