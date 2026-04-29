import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";

const createSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().min(2).max(4000),
  priceGel: z.number().int().positive(), // in tetri
  categoryId: z.string(),
  size: z.string().optional(),
  brand: z.string().optional(),
  condition: z.enum(["new", "like_new", "good", "fair"]),
  color: z.string().optional(),
  imageUrls: z.array(z.string()).default([]),
  images: z.array(z.object({
    url: z.string(),
    phash: z.string().optional(),
    r: z.number().optional(),
    g: z.number().optional(),
    b: z.number().optional(),
    embedding: z.string().optional(),
  })).optional(),
});

export async function itemRoutes(app: FastifyInstance) {
  // List / search
  app.get("/", async (req) => {
    const q = req.query as Record<string, string | undefined>;
    const where: any = { status: "active" };
    if (q.search) {
      where.OR = [
        { title: { contains: q.search } },
        { description: { contains: q.search } },
        { brand: { contains: q.search } },
      ];
    }
    if (q.categoryId) where.categoryId = q.categoryId;
    if (q.categorySlug) {
      where.category = { OR: [{ slug: q.categorySlug }, { parent: { slug: q.categorySlug } }] };
    }
    if (q.condition) where.condition = q.condition;
    if (q.minPrice) where.priceGel = { ...(where.priceGel ?? {}), gte: Number(q.minPrice) };
    if (q.maxPrice) where.priceGel = { ...(where.priceGel ?? {}), lte: Number(q.maxPrice) };
    if (q.sellerId) where.sellerId = q.sellerId;

    const items = await prisma.item.findMany({
      where,
      include: { images: true, seller: { select: { id: true, username: true, avatarUrl: true } }, category: true },
      orderBy: { createdAt: "desc" },
      take: 60,
    });
    return items;
  });

  // Detail
  app.get("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        seller: { select: { id: true, username: true, displayName: true, avatarUrl: true, city: true, createdAt: true } },
        category: true,
      },
    });
    if (!item) return reply.code(404).send({ error: "not_found" });
    return item;
  });

  // Create
  app.post("/", { preHandler: [app.authenticate] }, async (req, reply) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const { imageUrls, images, ...rest } = parsed.data;

    const imageData = images && images.length
      ? images.map((im, order) => ({ url: im.url, order, phash: im.phash, dominantR: im.r, dominantG: im.g, dominantB: im.b, embedding: im.embedding }))
      : imageUrls.map((url, order) => ({ url, order }));

    const item = await prisma.item.create({
      data: {
        ...rest,
        sellerId: req.user.sub,
        images: { create: imageData },
      },
      include: { images: true },
    });
    return item;
  });

  // Update
  app.patch("/:id", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) return reply.code(404).send({ error: "not_found" });
    if (item.sellerId !== req.user.sub) return reply.code(403).send({ error: "forbidden" });

    const updated = await prisma.item.update({
      where: { id },
      data: req.body as any,
    });
    return updated;
  });

  // Delete
  app.delete("/:id", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) return reply.code(404).send({ error: "not_found" });
    if (item.sellerId !== req.user.sub) return reply.code(403).send({ error: "forbidden" });
    await prisma.item.delete({ where: { id } });
    return { ok: true };
  });
}
