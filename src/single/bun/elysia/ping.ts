import { Elysia } from 'elysia'

new Elysia()
	.get('/', 'Hi')
	.listen(3000)
