import { createKori } from "@korix/kori";
import {
  enableStdRequestValidation,
  stdRequestSchema,
} from "@korix/std-schema-adapter";
import { z } from "zod";

// Validation schemas
const uuidSchema = z.uuid();

const numericIdSchema = z.coerce.number().int().positive();

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const postsQuerySchema = z.object({
  userId: z.coerce.number().int().positive(),
  page: z.coerce.number().int().min(1).default(1),
});

const userBodySchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  age: z.number().int().min(0).optional(),
});

const postBodySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

const commentBodySchema = z.object({
  postId: z.string(),
  content: z.string().min(1),
  author: z.string().min(1),
});

const app = createKori({
  ...enableStdRequestValidation(),
});

// 1. GET /api/users/:id
app.get("/api/users/:id", {
  requestSchema: stdRequestSchema({ params: z.object({ id: uuidSchema }) }),
  handler: (c) => {
    const { id } = c.req.validatedParams();
    return c.res.json({ id, name: "John Doe", email: "john@example.com" });
  },
});

// 2. GET /api/users
app.get("/api/users", {
  requestSchema: stdRequestSchema({ queries: paginationSchema }),
  handler: (c) => {
    const { page, limit } = c.req.validatedQueries();
    return c.res.json({ page, limit, users: [] });
  },
});

// 3. POST /api/users
app.post("/api/users", {
  requestSchema: stdRequestSchema({ body: userBodySchema }),
  handler: (c) => c.res.json(c.req.validatedBody()),
});

// 4. PUT /api/users/:id
app.put("/api/users/:id", {
  requestSchema: stdRequestSchema({
    params: z.object({ id: uuidSchema }),
    body: userBodySchema,
  }),
  handler: (c) => {
    const { id } = c.req.validatedParams();
    const body = c.req.validatedBody();
    return c.res.json({ id, ...body });
  },
});

// 5. DELETE /api/users/:id
app.delete("/api/users/:id", {
  requestSchema: stdRequestSchema({ params: z.object({ id: uuidSchema }) }),
  handler: (c) => {
    const { id } = c.req.validatedParams();
    return c.res.json({ deleted: id });
  },
});

// 6. GET /api/posts/:id
app.get("/api/posts/:id", {
  requestSchema: stdRequestSchema({
    params: z.object({ id: numericIdSchema }),
  }),
  handler: (c) => {
    const { id } = c.req.validatedParams();
    return c.res.json({ id, title: "Test Post", content: "Content" });
  },
});

// 7. GET /api/posts
app.get("/api/posts", {
  requestSchema: stdRequestSchema({ queries: postsQuerySchema }),
  handler: (c) => {
    const { userId, page } = c.req.validatedQueries();
    return c.res.json({ userId, page, posts: [] });
  },
});

// 8. POST /api/posts
app.post("/api/posts", {
  requestSchema: stdRequestSchema({ body: postBodySchema }),
  handler: (c) => c.res.json(c.req.validatedBody()),
});

// 9. PUT /api/posts/:id
app.put("/api/posts/:id", {
  requestSchema: stdRequestSchema({
    params: z.object({ id: numericIdSchema }),
    body: postBodySchema,
  }),
  handler: (c) => {
    const { id } = c.req.validatedParams();
    const body = c.req.validatedBody();
    return c.res.json({ id, ...body });
  },
});

// 10. POST /api/comments
app.post("/api/comments", {
  requestSchema: stdRequestSchema({ body: commentBodySchema }),
  handler: (c) => c.res.json(c.req.validatedBody()),
});

Deno.serve({ port: 3000 }, (await app.generate().onStart()).fetchHandler);
