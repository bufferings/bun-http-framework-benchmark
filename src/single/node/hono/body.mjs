import { Hono } from 'hono'
import { RegExpRouter } from 'hono/router/reg-exp-router'
import { serve } from '@hono/node-server'

const app = new Hono({ router: new RegExpRouter() })

app.post('/', (c) => c.req.json().then((body) => c.json(body)))

serve({ fetch: app.fetch, port: 3000 })
