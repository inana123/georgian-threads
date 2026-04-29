import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";

export async function favoriteRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [app.authenticate] }, async (req) => {
    return prisma.favorite.findMany({
      where: { userId: req.user.sub },
      include: { item: { include: { images: true } } },
      orderBy: { createdAt: "desc" },
    });
  });

  app.post("/:itemId", { preHandler: [app.authenticate] }, async (req) => {
    const { itemId } = req.params as { itemId: string };
    return prisma.favorite.upsert({
      where: { userId_itemId: { userId: req.user.sub, itemId } },
      create: { userId: req.user.sub, itemId },
      update: {},
    });
  });

  app.delete("/:itemId", { preHandler: [app.authenticate] }, async (req) => {
    const { itemId } = req.params as { itemId: string };
    await prisma.favorite.deleteMany({ where: { userId: req.user.sub, itemId } });
    return { ok: true };
  });
}
