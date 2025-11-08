import { Hono } from "hono";
import { RegExpRouter } from "hono/router/reg-exp-router";
import { sValidator } from "@hono/standard-validator";
import { z } from "zod";

// Validation schemas
const uuidSchema = z.object({
  id: z.uuid(),
});

const numericIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

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

const app = new Hono({ router: new RegExpRouter() });

// 1. GET /api/users/:id
app.get("/api/users/:id", sValidator("param", uuidSchema), (c) => {
  const { id } = c.req.valid("param");
  return c.json({ id, name: "John Doe", email: "john@example.com" });
});

// 2. GET /api/users
app.get("/api/users", sValidator("query", paginationSchema), (c) => {
  const { page, limit } = c.req.valid("query");
  return c.json({ page, limit, users: [] });
});

// 3. POST /api/users
app.post("/api/users", sValidator("json", userBodySchema), (c) => {
  const body = c.req.valid("json");
  return c.json(body);
});

// 4. PUT /api/users/:id
app.put(
  "/api/users/:id",
  sValidator("param", uuidSchema),
  sValidator("json", userBodySchema),
  (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    return c.json({ id, ...body });
  },
);

// 5. DELETE /api/users/:id
app.delete("/api/users/:id", sValidator("param", uuidSchema), (c) => {
  const { id } = c.req.valid("param");
  return c.json({ deleted: id });
});

// 6. GET /api/posts/:id
app.get("/api/posts/:id", sValidator("param", numericIdSchema), (c) => {
  const { id } = c.req.valid("param");
  return c.json({ id, title: "Test Post", content: "Content" });
});

// 7. GET /api/posts
app.get("/api/posts", sValidator("query", postsQuerySchema), (c) => {
  const { userId, page } = c.req.valid("query");
  return c.json({ userId, page, posts: [] });
});

// 8. POST /api/posts
app.post("/api/posts", sValidator("json", postBodySchema), (c) => {
  const body = c.req.valid("json");
  return c.json(body);
});

// 9. PUT /api/posts/:id
app.put(
  "/api/posts/:id",
  sValidator("param", numericIdSchema),
  sValidator("json", postBodySchema),
  (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    return c.json({ id, ...body });
  },
);

// 10. POST /api/comments
app.post("/api/comments", sValidator("json", commentBodySchema), (c) => {
  const body = c.req.valid("json");
  return c.json(body);
});

export default app;
