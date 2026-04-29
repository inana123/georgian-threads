// CLIP image embedding via @xenova/transformers (runs locally, no API key needed)
// Lazy-loads the model on first use; cached for the lifetime of the process.

import sharp from "sharp";

let extractorPromise: Promise<any> | null = null;
let RawImageCtor: any = null;

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const tf = await import("@xenova/transformers");
      RawImageCtor = tf.RawImage;
      // Force ONNX runtime to use CPU; suppress noisy warnings
      tf.env.allowLocalModels = false;
      console.log("⏳ Loading CLIP model (first run downloads ~150MB)…");
      const extractor = await tf.pipeline(
        "image-feature-extraction",
        "Xenova/clip-vit-base-patch16",
        { quantized: true }
      );
      console.log("✅ CLIP model ready");
      return extractor;
    })();
  }
  return extractorPromise;
}

/** Returns a 512-d L2-normalized embedding for the given image buffer. */
export async function computeClipEmbedding(buf: Buffer): Promise<number[]> {
  const extractor = await getExtractor();

  // Convert buffer → RawImage via sharp → raw RGBA pixels
  const { data, info } = await sharp(buf)
    .removeAlpha()
    .toFormat("png")
    .raw()
    .toBuffer({ resolveWithObject: true });
  const img = new RawImageCtor(new Uint8ClampedArray(data), info.width, info.height, 3);

  const out = await extractor(img, { pooling: "mean", normalize: true });
  return Array.from(out.data as Float32Array);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d ? dot / d : 0;
}

export async function preloadClip() {
  try { await getExtractor(); } catch (e) { console.error("CLIP preload failed:", e); }
}
