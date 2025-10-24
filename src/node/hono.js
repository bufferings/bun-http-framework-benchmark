const { Hono } = require("hono")
const { serve } = require("@hono/node-server")
const { RegExpRouter } = require("hono/router/reg-exp-router")
const { sValidator } = require("@hono/standard-validator")
const { z } = require("zod")
const v = require("valibot")
const { type } = require("arktype")

const app = new Hono({ router: new RegExpRouter() })

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
	'count': 'number>0',
	'tags?': 'string[]'
})

app.get("/", (c) => c.text("Hi"))
	.post("/json", (c) => c.req.json().then(c.json))
	.get("/id/:id", (c) => {
		const id = c.req.param("id")
		const name = c.req.query("name")

		c.header("x-powered-by", "benchmark")

		return c.text(`${id} ${name}`)
	})
	.post('/validate-zod', sValidator('json', zodSchema), (c) => {
		const body = c.req.valid('json')
		return c.json(body)
	})
	.post('/validate-valibot', sValidator('json', valibotSchema), (c) => {
		const body = c.req.valid('json')
		return c.json(body)
	})
	.post('/validate-arktype', sValidator('json', arktypeSchema), (c) => {
		const body = c.req.valid('json')
		return c.json(body)
	})

serve(app)
