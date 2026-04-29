import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";

export async function conversationRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [app.authenticate] }, async (req) => {
    return prisma.conversation.findMany({
      where: { OR: [{ buyerId: req.user.sub }, { sellerId: req.user.sub }] },
      include: {
        item: { include: { images: true } },
        buyer: { select: { id: true, username: true, avatarUrl: true } },
        seller: { select: { id: true, username: true, avatarUrl: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });
  });

  app.get("/:id", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const conv = await prisma.conversation.findUnique({
      where: { id },
      include: {
        item: { include: { images: true } },
        buyer: { select: { id: true, username: true, avatarUrl: true } },
        seller: { select: { id: true, username: true, avatarUrl: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!conv) return reply.code(404).send({ error: "not_found" });
    if (conv.buyerId !== req.user.sub && conv.sellerId !== req.user.sub)
      return reply.code(403).send({ error: "forbidden" });
    return conv;
  });

  // Start (or get existing) conversation about an item
  app.post("/start", { preHandler: [app.authenticate] }, async (req, reply) => {
    const body = z.object({ itemId: z.string(), message: z.string().min(1) }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: body.error.flatten() });
    const item = await prisma.item.findUnique({ where: { id: body.data.itemId } });
    if (!item) return reply.code(404).send({ error: "item_not_found" });
    if (item.sellerId === req.user.sub)
      return reply.code(400).send({ error: "cannot_message_yourself" });

    const conv = await prisma.conversation.upsert({
      where: { itemId_buyerId: { itemId: item.id, buyerId: req.user.sub } },
      create: { itemId: item.id, buyerId: req.user.sub, sellerId: item.sellerId },
      update: {},
    });
    await prisma.message.create({
      data: { conversationId: conv.id, senderId: req.user.sub, body: body.data.message },
    });
    await prisma.conversation.update({ where: { id: conv.id }, data: { updatedAt: new Date() } });
    return conv;
  });

  app.post("/:id/messages", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = z.object({ body: z.string().min(1) }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: body.error.flatten() });
    const conv = await prisma.conversation.findUnique({ where: { id } });
    if (!conv) return reply.code(404).send({ error: "not_found" });
    if (conv.buyerId !== req.user.sub && conv.sellerId !== req.user.sub)
      return reply.code(403).send({ error: "forbidden" });

    const msg = await prisma.message.create({
      data: { conversationId: id, senderId: req.user.sub, body: body.data.body },
    });
    await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });
    return msg;
  });
}
