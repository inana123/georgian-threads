import sharp from "sharp";

/**
 * dHash perceptual hash — resize to 9x8 grayscale, compare each pixel
 * to the one to its right → 64 bits → 16-char hex.
 * Hamming distance gives visual similarity (lower = more similar).
 */
export async function computePHash(input: Buffer | string): Promise<string> {
  const buf = await sharp(input)
    .grayscale()
    .resize(9, 8, { fit: "fill" })
    .raw()
    .toBuffer();
  let bits = "";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const left = buf[row * 9 + col];
      const right = buf[row * 9 + col + 1];
      bits += left < right ? "1" : "0";
    }
  }
  // bits → hex
  let hex = "";
  for (let i = 0; i < 64; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

export async function computeDominantColor(input: Buffer | string): Promise<{ r: number; g: number; b: number }> {
  const { dominant } = await sharp(input).stats();
  return { r: dominant.r, g: dominant.g, b: dominant.b };
}

export function hammingDistance(a: string, b: string): number {
  if (a.length !== b.length) return 64;
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    let xor = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (xor) { dist += xor & 1; xor >>= 1; }
  }
  return dist;
}

export function colorDistance(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }): number {
  return Math.sqrt((c1.r - c2.r) ** 2 + (c1.g - c2.g) ** 2 + (c1.b - c2.b) ** 2);
}

/**
 * Combined similarity score 0..1 (1 = identical).
 * 70% weight on pHash, 30% on dominant color.
 */
export function similarityScore(
  qHash: string, qColor: { r: number; g: number; b: number },
  iHash: string | null, iR: number | null, iG: number | null, iB: number | null
): number {
  const hashSim = iHash ? 1 - hammingDistance(qHash, iHash) / 64 : 0;
  const colorSim = (iR != null && iG != null && iB != null)
    ? 1 - Math.min(colorDistance(qColor, { r: iR, g: iG, b: iB }) / 441.7, 1) // sqrt(255^2 * 3)
    : 0;
  return hashSim * 0.7 + colorSim * 0.3;
}
