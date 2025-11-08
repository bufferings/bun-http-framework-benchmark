const fastify = require("fastify")();
const { serializerCompiler, validatorCompiler } = require(
  "fastify-type-provider-zod",
);
const { z } = require("zod");

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

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

// 1. GET /api/users/:id
fastify.get("/api/users/:id", {
  schema: {
    params: uuidSchema,
  },
}, async (request, reply) => {
  const { id } = request.params;
  return { id, name: "John Doe", email: "john@example.com" };
});

// 2. GET /api/users
fastify.get("/api/users", {
  schema: {
    querystring: paginationSchema,
  },
}, async (request, reply) => {
  const { page, limit } = request.query;
  return { page, limit, users: [] };
});

// 3. POST /api/users
fastify.post("/api/users", {
  schema: {
    body: userBodySchema,
  },
}, async (request, reply) => {
  return request.body;
});

// 4. PUT /api/users/:id
fastify.put("/api/users/:id", {
  schema: {
    params: uuidSchema,
    body: userBodySchema,
  },
}, async (request, reply) => {
  const { id } = request.params;
  return { id, ...request.body };
});

// 5. DELETE /api/users/:id
fastify.delete("/api/users/:id", {
  schema: {
    params: uuidSchema,
  },
}, async (request, reply) => {
  const { id } = request.params;
  return { deleted: id };
});

// 6. GET /api/posts/:id
fastify.get("/api/posts/:id", {
  schema: {
    params: numericIdSchema,
  },
}, async (request, reply) => {
  const { id } = request.params;
  return { id, title: "Test Post", content: "Content" };
});

// 7. GET /api/posts
fastify.get("/api/posts", {
  schema: {
    querystring: postsQuerySchema,
  },
}, async (request, reply) => {
  const { userId, page } = request.query;
  return { userId, page, posts: [] };
});

// 8. POST /api/posts
fastify.post("/api/posts", {
  schema: {
    body: postBodySchema,
  },
}, async (request, reply) => {
  return request.body;
});

// 9. PUT /api/posts/:id
fastify.put("/api/posts/:id", {
  schema: {
    params: numericIdSchema,
    body: postBodySchema,
  },
}, async (request, reply) => {
  const { id } = request.params;
  return { id, ...request.body };
});

// 10. POST /api/comments
fastify.post("/api/comments", {
  schema: {
    body: commentBodySchema,
  },
}, async (request, reply) => {
  return request.body;
});

fastify.listen({ host: "0.0.0.0", port: 3000 });
