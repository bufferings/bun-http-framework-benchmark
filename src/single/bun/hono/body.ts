import { Hono } from 'hono'
import { RegExpRouter } from 'hono/router/reg-exp-router'

const app = new Hono({ router: new RegExpRouter() })

app.post('/', (c) => c.req.json().then((body) => c.json(body)))

export default app
