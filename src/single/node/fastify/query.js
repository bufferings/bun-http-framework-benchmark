const fastify = require('fastify')

fastify()
	.get('/:id', (req, reply) => {
		const { id } = req.params
		const { name } = req.query
		reply
			.header('x-powered-by', 'benchmark')
			.header('content-type', 'text/plain')
			.send(`${id} ${name}`)
	})
	.listen({ port: 3000 })
