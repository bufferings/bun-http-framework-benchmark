import { createKori } from '@korix/kori'
import { startNodejsServer } from '@korix/nodejs-server'
import {
	enableStdRequestValidation,
	stdRequestSchema
} from '@korix/standard-schema-adapter'
import { type } from 'arktype'

const arktypeSchema = type({
	hello: 'string',
	count: 'number>0',
	'tags?': 'string[]'
})

const app = createKori({
	...enableStdRequestValidation()
})

app.post('/', {
	requestSchema: stdRequestSchema({ body: arktypeSchema }),
	handler: (c) => c.res.json(c.req.validatedBody())
})

;(async () => {
	await startNodejsServer(app, { port: 3000, hostname: '0.0.0.0' })
})()
