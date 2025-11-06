import { Elysia } from 'elysia'
import { type } from 'arktype'

const arktypeSchema = type({
	hello: 'string',
	count: 'number>0',
	'tags?': 'string[]'
})

new Elysia()
	.post('/', (c) => c.body, { body: arktypeSchema })
	.listen(3000)
