import { Hono } from 'hono'
import { RegExpRouter } from 'hono/router/reg-exp-router'
import { sValidator } from '@hono/standard-validator'
import { z } from 'zod'

const zodSchema = z.object({
	hello: z.string(),
	count: z.number().int().positive(),
	tags: z.array(z.string()).optional()
})

const app = new Hono({ router: new RegExpRouter() })
app.post('/', sValidator('json', zodSchema), (c) =>
	c.json(c.req.valid('json'))
)

Deno.serve({ port: 3000 }, app.fetch)
