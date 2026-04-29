import type { FastifyInstance } from "fastify";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6),
  displayName: z.string().optional(),
});

const loginSchema = z.object({
  emailOrUsername: z.string(),
  password: z.string(),
});

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", async (req, reply) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const { email, username, password, displayName } = parsed.data;

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (exists) return reply.code(409).send({ error: "email_or_username_taken" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, username, passwordHash, displayName: displayName ?? username },
    });

    const token = app.jwt.sign({ sub: user.id, username: user.username });
    return { token, user: publicUser(user) };
  });

  app.post("/login", async (req, reply) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const { emailOrUsername, password } = parsed.data;

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: emailOrUsername }, { username: emailOrUsername }] },
    });
    if (!user) return reply.code(401).send({ error: "invalid_credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return reply.code(401).send({ error: "invalid_credentials" });

    const token = app.jwt.sign({ sub: user.id, username: user.username });
    return { token, user: publicUser(user) };
  });

  app.get("/me", { preHandler: [app.authenticate] }, async (req) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    return user ? publicUser(user) : null;
  });
}

function publicUser(u: any) {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    bio: u.bio,
    city: u.city,
    createdAt: u.createdAt,
  };
}
