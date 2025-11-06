const express = require('express')

express()
	.get('/:id', ({ params: { id }, query: { name } }, res) => {
		res.setHeader('x-powered-by', 'benchmark')
			.setHeader('content-type', 'text/plain')
			.send(`${id} ${name}`)
	})
	.listen(3000)
