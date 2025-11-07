import { Elysia, t } from 'elysia'

// Define validation schemas using Elysia's t
const uuidSchema = t.String({ format: 'uuid' })
const numericIdSchema = t.Numeric()

const paginationSchema = t.Object({
	page: t.Numeric({ minimum: 1, default: 1 }),
	limit: t.Numeric({ minimum: 1, maximum: 100, default: 10 })
})

const postsQuerySchema = t.Object({
	userId: t.Numeric({ minimum: 1 }),
	page: t.Numeric({ minimum: 1, default: 1 })
})

const userBodySchema = t.Object({
	name: t.String({ minLength: 1 }),
	email: t.String({ format: 'email' }),
	age: t.Optional(t.Number({ minimum: 0 }))
})

const postBodySchema = t.Object({
	title: t.String({ minLength: 1 }),
	content: t.String({ minLength: 1 }),
	tags: t.Optional(t.Array(t.String()))
})

const commentBodySchema = t.Object({
	postId: t.String(),
	content: t.String({ minLength: 1 }),
	author: t.String({ minLength: 1 })
})

const app = new Elysia()
	// 1. GET /api/users/:id
	.get('/api/users/:id', (c) => {
		return { id: c.params.id, name: 'John Doe', email: 'john@example.com' }
	}, {
		params: t.Object({ id: uuidSchema })
	})

	// 2. GET /api/users
	.get('/api/users', (c) => {
		return { page: c.query.page, limit: c.query.limit, users: [] }
	}, {
		query: paginationSchema
	})

	// 3. POST /api/users
	.post('/api/users', (c) => c.body, {
		body: userBodySchema
	})

	// 4. PUT /api/users/:id
	.put('/api/users/:id', (c) => {
		return { id: c.params.id, ...c.body }
	}, {
		params: t.Object({ id: uuidSchema }),
		body: userBodySchema
	})

	// 5. DELETE /api/users/:id
	.delete('/api/users/:id', (c) => {
		return { deleted: c.params.id }
	}, {
		params: t.Object({ id: uuidSchema })
	})

	// 6. GET /api/posts/:id
	.get('/api/posts/:id', (c) => {
		return { id: c.params.id, title: 'Test Post', content: 'Content' }
	}, {
		params: t.Object({ id: numericIdSchema })
	})

	// 7. GET /api/posts
	.get('/api/posts', (c) => {
		return { userId: c.query.userId, page: c.query.page, posts: [] }
	}, {
		query: postsQuerySchema
	})

	// 8. POST /api/posts
	.post('/api/posts', (c) => c.body, {
		body: postBodySchema
	})

	// 9. PUT /api/posts/:id
	.put('/api/posts/:id', (c) => {
		return { id: c.params.id, ...c.body }
	}, {
		params: t.Object({ id: numericIdSchema }),
		body: postBodySchema
	})

	// 10. POST /api/comments
	.post('/api/comments', (c) => c.body, {
		body: commentBodySchema
	})
	.listen(3000)
