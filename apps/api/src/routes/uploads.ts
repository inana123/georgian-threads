import type { FastifyInstance } from "fastify";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { computePHash, computeDominantColor } from "../lib/imageHash.js";
import { computeClipEmbedding } from "../lib/clip.js";

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");

export async function uploadRoutes(app: FastifyInstance) {
  app.post("/", { preHandler: [app.authenticate] }, async (req) => {
    const parts = req.files();
    const results: { url: string; phash: string; r: number; g: number; b: number; embedding?: string }[] = [];
    for await (const part of parts) {
      const ext = path.extname(part.filename) || ".jpg";
      const name = `${crypto.randomBytes(12).toString("hex")}${ext}`;
      const dest = path.join(UPLOAD_DIR, name);
      const buf = await part.toBuffer();
      fs.writeFileSync(dest, buf);
      let phash = "0".repeat(16);
      let color = { r: 128, g: 128, b: 128 };
      let embedding: string | undefined;
      try { phash = await computePHash(buf); } catch {}
      try { color = await computeDominantColor(buf); } catch {}
      try {
        const emb = await computeClipEmbedding(buf);
        embedding = JSON.stringify(emb);
      } catch (e) { console.error("CLIP embed failed:", e); }
      results.push({ url: `/uploads/${name}`, phash, r: color.r, g: color.g, b: color.b, embedding });
    }
    return { urls: results.map(r => r.url), images: results };
  });
}
