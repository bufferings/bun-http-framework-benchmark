import { createKori } from '@korix/kori'
import {
	enableStdRequestValidation,
	stdRequestSchema
} from '@korix/standard-schema-adapter'
import { z } from 'zod'
import * as v from 'valibot'
import { type } from 'arktype'

const app = createKori({
	...enableStdRequestValidation()
})

// Validation schemas
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
	'count': 'number>0',
	'tags?': 'string[]'
})

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
	.post('/validate-zod', {
		requestSchema: stdRequestSchema({ body: zodSchema }),
		handler: async (c) => {
			const body = c.req.validatedBody()
			return c.res.json(body)
		}
	})
	.post('/validate-valibot', {
		requestSchema: stdRequestSchema({ body: valibotSchema }),
		handler: async (c) => {
			const body = c.req.validatedBody()
			return c.res.json(body)
		}
	})
	.post('/validate-arktype', {
		requestSchema: stdRequestSchema({ body: arktypeSchema }),
		handler: async (c) => {
			const body = c.req.validatedBody()
			return c.res.json(body)
		}
	})

export default {
	fetch: (await app.generate().onStart()).fetchHandler
}
