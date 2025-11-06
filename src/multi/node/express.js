const express = require('express')

express()
	.use(express.json())
	.get('/', (req, res) => {
		res.setHeader('content-type', 'text/plain').send('Hi')
	})
	.get('/id/:id', ({ params: { id }, query: { name } }, res) => {
		res.setHeader('x-powered-by', 'benchmark')
			.setHeader('content-type', 'text/plain')
			.send(`${id} ${name}`)
	})
	.post('/json', ({ body }, res) => {
		res.json(body)
	})
	.listen(3000)
