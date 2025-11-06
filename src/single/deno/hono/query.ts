import { Hono } from 'hono'
import { RegExpRouter } from 'hono/router/reg-exp-router'

const app = new Hono({ router: new RegExpRouter() })
app.get('/:id', (c) => {
	c.header('x-powered-by', 'benchmark')
	return c.text(`${c.req.param('id')} ${c.req.query('name')}`)
})

Deno.serve({ port: 3000 }, app.fetch)
