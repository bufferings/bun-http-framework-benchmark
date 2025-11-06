import { Hono } from 'hono'
import { RegExpRouter } from 'hono/router/reg-exp-router'
import { serve } from '@hono/node-server'

const app = new Hono({ router: new RegExpRouter() })

app.get('/:id', (c) => {
	c.header('x-powered-by', 'benchmark')
	return c.text(`${c.req.param('id')} ${c.req.query('name')}`)
})

serve({ fetch: app.fetch, port: 3000 })
