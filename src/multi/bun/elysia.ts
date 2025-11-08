import { Elysia } from "elysia";
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

const app = new Elysia()
  // 1. GET /api/users/:id
  .get("/api/users/:id", (c) => {
    return { id: c.params.id, name: "John Doe", email: "john@example.com" };
  }, {
    params: uuidSchema,
  })
  // 2. GET /api/users
  .get("/api/users", (c) => {
    return { page: c.query.page, limit: c.query.limit, users: [] };
  }, {
    query: paginationSchema,
  })
  // 3. POST /api/users
  .post("/api/users", (c) => c.body, {
    body: userBodySchema,
  })
  // 4. PUT /api/users/:id
  .put("/api/users/:id", (c) => {
    return { id: c.params.id, ...c.body };
  }, {
    params: uuidSchema,
    body: userBodySchema,
  })
  // 5. DELETE /api/users/:id
  .delete("/api/users/:id", (c) => {
    return { deleted: c.params.id };
  }, {
    params: uuidSchema,
  })
  // 6. GET /api/posts/:id
  .get("/api/posts/:id", (c) => {
    return { id: c.params.id, title: "Test Post", content: "Content" };
  }, {
    params: numericIdSchema,
  })
  // 7. GET /api/posts
  .get("/api/posts", (c) => {
    return { userId: c.query.userId, page: c.query.page, posts: [] };
  }, {
    query: postsQuerySchema,
  })
  // 8. POST /api/posts
  .post("/api/posts", (c) => c.body, {
    body: postBodySchema,
  })
  // 9. PUT /api/posts/:id
  .put("/api/posts/:id", (c) => {
    return { id: c.params.id, ...c.body };
  }, {
    params: numericIdSchema,
    body: postBodySchema,
  })
  // 10. POST /api/comments
  .post("/api/comments", (c) => c.body, {
    body: commentBodySchema,
  })
  .listen(3000);
