import { createKori } from '@korix/kori'
import { startNodejsServer } from '@korix/nodejs-server'
import {
	enableStdRequestValidation,
	stdRequestSchema
} from '@korix/standard-schema-adapter'
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

const app = createKori({
	...enableStdRequestValidation()
})

app.get('/', (c) => c.res.text('Hi'))
	.get('/id/:id', (c) => {
		c.res.setHeader('x-powered-by', 'benchmark')
		return c.res.text(`${c.req.param('id')} ${c.req.query('name')}`)
	})
	.post('/json', (c) => c.req.bodyJson().then((body) => c.res.json(body)))
	.post('/validate-zod', {
		requestSchema: stdRequestSchema({ body: zodSchema }),
		handler: (c) => c.res.json(c.req.validatedBody())
	})
	.post('/validate-valibot', {
		requestSchema: stdRequestSchema({ body: valibotSchema }),
		handler: (c) => c.res.json(c.req.validatedBody())
	})
	.post('/validate-arktype', {
		requestSchema: stdRequestSchema({ body: arktypeSchema }),
		handler: (c) => c.res.json(c.req.validatedBody())
	})
;(async () => {
	await startNodejsServer(app, { port: 3000, hostname: '0.0.0.0' })
})()
