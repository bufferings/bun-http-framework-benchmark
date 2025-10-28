import { Hono } from 'hono'
import { RegExpRouter } from 'hono/router/reg-exp-router'
import { sValidator } from '@hono/standard-validator'
import { z } from 'zod'
import * as v from 'valibot'
import { type } from 'arktype'

const zodSchema = z.object({
	hello: z.string(),
	count: z.number().int().positive(),
	tags: z.array(z.string()).optional()
})

const valibotSchema = v.object({
	hello: v.string(),
	count: v.pipe(v.number(), v.integer(), v.minValue(1)),
	tags: v.optional(v.array(v.string()))
})

const arktypeSchema = type({
	hello: 'string',
	count: 'number>0',
	'tags?': 'string[]'
})

const app = new Hono({ router: new RegExpRouter() })

app.get('/', (c) => c.text('Hi'))
	.get('/id/:id', (c) => {
		c.header('x-powered-by', 'benchmark')
		return c.text(`${c.req.param('id')} ${c.req.query('name')}`)
	})
	.post('/json', (c) => c.req.json().then((body) => c.json(body)))
	.post('/validate-zod', sValidator('json', zodSchema), (c) =>
		c.json(c.req.valid('json'))
	)
	.post('/validate-valibot', sValidator('json', valibotSchema), (c) =>
		c.json(c.req.valid('json'))
	)
	.post('/validate-arktype', sValidator('json', arktypeSchema), (c) =>
		c.json(c.req.valid('json'))
	)

export default app
