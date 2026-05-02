import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import path from "node:path";
import fs from "node:fs";
import { authRoutes } from "./routes/auth.js";
import { itemRoutes } from "./routes/items.js";
import { categoryRoutes } from "./routes/categories.js";
import { uploadRoutes } from "./routes/uploads.js";
import { favoriteRoutes } from "./routes/favorites.js";
import { conversationRoutes } from "./routes/conversations.js";
import { userRoutes } from "./routes/users.js";
import { visualSearchRoutes } from "./routes/visualSearch.js";
import { preloadClip } from "./lib/clip.js";

const PORT = Number(process.env.PORT ?? 4000);
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = Fastify({ logger: true });

// CORS: allow CORS_ORIGINS (comma-separated) in prod, anything in dev
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim())
  : true;
await app.register(cors, { origin: corsOrigins, credentials: true });
await app.register(jwt, { secret: process.env.JWT_SECRET ?? "dev-secret" });
await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });
await app.register(fastifyStatic, {
  root: UPLOAD_DIR,
  prefix: "/uploads/",
});

app.decorate("authenticate", async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch {
    reply.code(401).send({ error: "unauthorized" });
  }
});

app.get("/health", async () => ({ ok: true }));

await app.register(authRoutes, { prefix: "/api/auth" });
await app.register(itemRoutes, { prefix: "/api/items" });
await app.register(categoryRoutes, { prefix: "/api/categories" });
await app.register(uploadRoutes, { prefix: "/api/uploads" });
await app.register(favoriteRoutes, { prefix: "/api/favorites" });
await app.register(conversationRoutes, { prefix: "/api/conversations" });
await app.register(userRoutes, { prefix: "/api/users" });
await app.register(visualSearchRoutes, { prefix: "/api/visual-search" });

app.listen({ port: PORT, host: "0.0.0.0" }).then(() => {
  console.log(`🧵 Georgian Threads API on http://localhost:${PORT}`);
  preloadClip(); // warm up CLIP in background
});

declare module "fastify" {
  interface FastifyInstance {
    authenticate: any;
  }
  interface FastifyRequest {
    user: { sub: string; username: string };
  }
}
