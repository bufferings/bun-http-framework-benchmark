const { createKori } = require('@korix/kori')
const { startNodejsServer } = require('@korix/nodejs-server')

const app = createKori()

app.get('/', (c) => c.res.text('Hi'))
	.post('/json', async (c) => {
		const body = await c.req.bodyJson()
		return c.res.json(body)
	})
	.get('/id/:id', (c) => {
		const id = c.req.param('id')
		const name = c.req.query('name')

		c.res.setHeader('x-powered-by', 'benchmark')

		return c.res.text(`${id} ${name}`)
	})

await startNodejsServer(app)
