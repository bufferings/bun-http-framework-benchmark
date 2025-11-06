import { createKori } from '@korix/kori'

const app = createKori()

app.get('/', (c) => c.res.text('Hi'))

export default {
	fetch: (await app.generate().onStart()).fetchHandler
}
