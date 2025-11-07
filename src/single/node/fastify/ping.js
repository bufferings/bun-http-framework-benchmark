const fastify = require('fastify')

fastify()
	.get('/', (req, reply) => {
		reply.header('content-type', 'text/plain').send('Hi')
	})
	.listen({ host: '0.0.0.0', port: 3000 })
