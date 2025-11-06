import { createKori } from '@korix/kori'

const app = createKori()

app.post('/', (c) => c.req.bodyJson().then((body) => c.res.json(body)))

export default {
	fetch: (await app.generate().onStart()).fetchHandler
}
