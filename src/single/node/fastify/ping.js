const fastify = require('fastify')

fastify()
	.get('/', (req, reply) => {
		reply.header('content-type', 'text/plain').send('Hi')
	})
	.listen({ port: 3000 })
