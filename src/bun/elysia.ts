import { Elysia, t } from 'elysia'
import { z } from 'zod'
import * as v from 'valibot'
import { type } from 'arktype'

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
	count: 'number>0',
	'tags?': 'string[]'
})

const app = new Elysia()
	.get('/', 'Hi')
	.get('/id/:id', (c) => {
		c.set.headers['x-powered-by'] = 'benchmark'

		return `${c.params.id} ${c.query.name}`
	})
	.post('/json', (c) => c.body, {
		parse: 'json'
	})
	.post('/validate-zod', (c) => c.body, {
		body: zodSchema
	})
	.post('/validate-valibot', (c) => c.body, {
		body: valibotSchema
	})
	.post('/validate-arktype', (c) => c.body, {
		body: arktypeSchema
	})
	.listen(3000)
