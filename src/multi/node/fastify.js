const fastify = require('fastify')()

// 1. GET /api/users/:id
fastify.get('/api/users/:id', {
	schema: {
		params: {
			type: 'object',
			required: ['id'],
			properties: {
				id: { type: 'string', format: 'uuid' }
			}
		}
	}
}, async (request, reply) => {
	const { id } = request.params
	return { id, name: 'John Doe', email: 'john@example.com' }
})

// 2. GET /api/users
fastify.get('/api/users', {
	schema: {
		querystring: {
			type: 'object',
			properties: {
				page: { type: 'integer', minimum: 1, default: 1 },
				limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
			}
		}
	}
}, async (request, reply) => {
	const { page, limit } = request.query
	return { page, limit, users: [] }
})

// 3. POST /api/users
fastify.post('/api/users', {
	schema: {
		body: {
			type: 'object',
			required: ['name', 'email'],
			properties: {
				name: { type: 'string', minLength: 1 },
				email: { type: 'string', format: 'email' },
				age: { type: 'integer', minimum: 0 }
			}
		}
	}
}, async (request, reply) => {
	return request.body
})

// 4. PUT /api/users/:id
fastify.put('/api/users/:id', {
	schema: {
		params: {
			type: 'object',
			required: ['id'],
			properties: {
				id: { type: 'string', format: 'uuid' }
			}
		},
		body: {
			type: 'object',
			required: ['name', 'email'],
			properties: {
				name: { type: 'string', minLength: 1 },
				email: { type: 'string', format: 'email' },
				age: { type: 'integer', minimum: 0 }
			}
		}
	}
}, async (request, reply) => {
	const { id } = request.params
	return { id, ...request.body }
})

// 5. DELETE /api/users/:id
fastify.delete('/api/users/:id', {
	schema: {
		params: {
			type: 'object',
			required: ['id'],
			properties: {
				id: { type: 'string', format: 'uuid' }
			}
		}
	}
}, async (request, reply) => {
	const { id } = request.params
	return { deleted: id }
})

// 6. GET /api/posts/:id
fastify.get('/api/posts/:id', {
	schema: {
		params: {
			type: 'object',
			required: ['id'],
			properties: {
				id: { type: 'integer', minimum: 1 }
			}
		}
	}
}, async (request, reply) => {
	const { id } = request.params
	return { id, title: 'Test Post', content: 'Content' }
})

// 7. GET /api/posts
fastify.get('/api/posts', {
	schema: {
		querystring: {
			type: 'object',
			required: ['userId'],
			properties: {
				userId: { type: 'integer', minimum: 1 },
				page: { type: 'integer', minimum: 1, default: 1 }
			}
		}
	}
}, async (request, reply) => {
	const { userId, page } = request.query
	return { userId, page, posts: [] }
})

// 8. POST /api/posts
fastify.post('/api/posts', {
	schema: {
		body: {
			type: 'object',
			required: ['title', 'content'],
			properties: {
				title: { type: 'string', minLength: 1 },
				content: { type: 'string', minLength: 1 },
				tags: { type: 'array', items: { type: 'string' } }
			}
		}
	}
}, async (request, reply) => {
	return request.body
})

// 9. PUT /api/posts/:id
fastify.put('/api/posts/:id', {
	schema: {
		params: {
			type: 'object',
			required: ['id'],
			properties: {
				id: { type: 'integer', minimum: 1 }
			}
		},
		body: {
			type: 'object',
			required: ['title', 'content'],
			properties: {
				title: { type: 'string', minLength: 1 },
				content: { type: 'string', minLength: 1 },
				tags: { type: 'array', items: { type: 'string' } }
			}
		}
	}
}, async (request, reply) => {
	const { id } = request.params
	return { id, ...request.body }
})

// 10. POST /api/comments
fastify.post('/api/comments', {
	schema: {
		body: {
			type: 'object',
			required: ['postId', 'content', 'author'],
			properties: {
				postId: { type: 'string' },
				content: { type: 'string', minLength: 1 },
				author: { type: 'string', minLength: 1 }
			}
		}
	}
}, async (request, reply) => {
	return request.body
})

fastify.listen({ port: 3000 })
