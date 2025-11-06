import { createKori } from '@korix/kori'

const app = createKori()

app.get('/:id', (c) => {
	c.res.setHeader('x-powered-by', 'benchmark')
	return c.res.text(`${c.req.param('id')} ${c.req.query('name')}`)
})

export default {
	fetch: (await app.generate().onStart()).fetchHandler
}
