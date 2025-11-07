const express = require('express')

const app = express()
app.use(express.json())

// 1. GET /api/users/:id
app.get('/api/users/:id', (req, res) => {
	const { id } = req.params
	// Basic UUID validation
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
	if (!uuidRegex.test(id)) {
		return res.status(400).json({ error: 'Invalid UUID' })
	}
	res.json({ id, name: 'John Doe', email: 'john@example.com' })
})

// 2. GET /api/users
app.get('/api/users', (req, res) => {
	const page = parseInt(req.query.page) || 1
	const limit = parseInt(req.query.limit) || 10
	if (page < 1 || limit < 1 || limit > 100) {
		return res.status(400).json({ error: 'Invalid pagination' })
	}
	res.json({ page, limit, users: [] })
})

// 3. POST /api/users
app.post('/api/users', (req, res) => {
	const { name, email, age } = req.body
	if (!name || !email) {
		return res.status(400).json({ error: 'Missing required fields' })
	}
	res.json({ name, email, age })
})

// 4. PUT /api/users/:id
app.put('/api/users/:id', (req, res) => {
	const { id } = req.params
	const { name, email, age } = req.body
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
	if (!uuidRegex.test(id)) {
		return res.status(400).json({ error: 'Invalid UUID' })
	}
	if (!name || !email) {
		return res.status(400).json({ error: 'Missing required fields' })
	}
	res.json({ id, name, email, age })
})

// 5. DELETE /api/users/:id
app.delete('/api/users/:id', (req, res) => {
	const { id } = req.params
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
	if (!uuidRegex.test(id)) {
		return res.status(400).json({ error: 'Invalid UUID' })
	}
	res.json({ deleted: id })
})

// 6. GET /api/posts/:id
app.get('/api/posts/:id', (req, res) => {
	const id = parseInt(req.params.id)
	if (isNaN(id) || id <= 0) {
		return res.status(400).json({ error: 'Invalid post ID' })
	}
	res.json({ id, title: 'Test Post', content: 'Content' })
})

// 7. GET /api/posts
app.get('/api/posts', (req, res) => {
	const userId = parseInt(req.query.userId)
	const page = parseInt(req.query.page) || 1
	if (isNaN(userId) || userId <= 0) {
		return res.status(400).json({ error: 'Invalid userId' })
	}
	if (page < 1) {
		return res.status(400).json({ error: 'Invalid page' })
	}
	res.json({ userId, page, posts: [] })
})

// 8. POST /api/posts
app.post('/api/posts', (req, res) => {
	const { title, content, tags } = req.body
	if (!title || !content) {
		return res.status(400).json({ error: 'Missing required fields' })
	}
	res.json({ title, content, tags })
})

// 9. PUT /api/posts/:id
app.put('/api/posts/:id', (req, res) => {
	const id = parseInt(req.params.id)
	const { title, content, tags } = req.body
	if (isNaN(id) || id <= 0) {
		return res.status(400).json({ error: 'Invalid post ID' })
	}
	if (!title || !content) {
		return res.status(400).json({ error: 'Missing required fields' })
	}
	res.json({ id, title, content, tags })
})

// 10. POST /api/comments
app.post('/api/comments', (req, res) => {
	const { postId, content, author } = req.body
	if (!postId || !content || !author) {
		return res.status(400).json({ error: 'Missing required fields' })
	}
	res.json({ postId, content, author })
})

app.listen(3000)
