import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";

export async function userRoutes(app: FastifyInstance) {
  app.get("/:username", async (req, reply) => {
    const { username } = req.params as { username: string };
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true, username: true, displayName: true, avatarUrl: true,
        bio: true, city: true, createdAt: true,
        items: { where: { status: "active" }, include: { images: true }, orderBy: { createdAt: "desc" } },
      },
    });
    if (!user) return reply.code(404).send({ error: "not_found" });
    return user;
  });
}
