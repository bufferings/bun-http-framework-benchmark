import { Hono } from 'hono'
import { RegExpRouter } from 'hono/router/reg-exp-router'
import { serve } from '@hono/node-server'
import { sValidator } from '@hono/standard-validator'
import { type } from 'arktype'

const arktypeSchema = type({
	hello: 'string',
	count: 'number>0',
	'tags?': 'string[]'
})

const app = new Hono({ router: new RegExpRouter() })

app.post('/', sValidator('json', arktypeSchema), (c) =>
	c.json(c.req.valid('json'))
)

serve({ fetch: app.fetch, port: 3000 })
