import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { computePHash, computeDominantColor, similarityScore } from "../lib/imageHash.js";
import { computeClipEmbedding, cosineSimilarity } from "../lib/clip.js";

export async function visualSearchRoutes(app: FastifyInstance) {
  app.post("/", async (req) => {
    const file = await req.file();
    if (!file) return { items: [] };
    const buf = await file.toBuffer();

    let qEmbedding: number[] | null = null;
    try { qEmbedding = await computeClipEmbedding(buf); }
    catch (e) { console.error("query embed failed:", e); }

    const qHash = await computePHash(buf).catch(() => "0".repeat(16));
    const qColor = await computeDominantColor(buf).catch(() => ({ r: 128, g: 128, b: 128 }));

    const images = await prisma.image.findMany({
      where: { order: 0, item: { status: "active" } },
      include: {
        item: {
          include: {
            images: true,
            seller: { select: { id: true, username: true, avatarUrl: true } },
            category: true,
          },
        },
      },
    });

    const scored = images
      .map((im) => {
        let score: number;
        if (qEmbedding && im.embedding) {
          try {
            const e = JSON.parse(im.embedding) as number[];
            // CLIP cosine ranges roughly 0.2..1; rescale to 0..1
            score = Math.max(0, Math.min(1, (cosineSimilarity(qEmbedding, e) - 0.2) / 0.8));
          } catch { score = 0; }
        } else {
          // Fallback for items without an embedding
          score = similarityScore(qHash, qColor, im.phash, im.dominantR, im.dominantG, im.dominantB) * 0.6;
        }
        return { item: im.item, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 60);

    return {
      query: { mode: qEmbedding ? "clip" : "phash" },
      items: scored.map((s) => ({ ...s.item, _score: Math.round(s.score * 100) })),
    };
  });
}
