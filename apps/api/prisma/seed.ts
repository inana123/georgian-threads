import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { computePHash, computeDominantColor } from "../src/lib/imageHash.js";
import { computeClipEmbedding } from "../src/lib/clip.js";

const prisma = new PrismaClient();

const TOP = [
  { name: "Women", nameKa: "ქალები", slug: "women" },
  { name: "Men", nameKa: "კაცები", slug: "men" },
  { name: "Kids", nameKa: "ბავშვები", slug: "kids" },
  { name: "Shoes", nameKa: "ფეხსაცმელი", slug: "shoes" },
  { name: "Bags", nameKa: "ჩანთები", slug: "bags" },
  { name: "Accessories", nameKa: "აქსესუარები", slug: "accessories" },
  { name: "Vintage", nameKa: "ვინტაჟი", slug: "vintage" },
];

const SUB: Record<string, { name: string; nameKa: string; slug: string }[]> = {
  women: [
    { name: "Dresses", nameKa: "კაბები", slug: "women-dresses" },
    { name: "Tops", nameKa: "ტოპები", slug: "women-tops" },
    { name: "Jeans", nameKa: "ჯინსები", slug: "women-jeans" },
    { name: "Outerwear", nameKa: "ზედა", slug: "women-outerwear" },
  ],
  men: [
    { name: "T-shirts", nameKa: "მაისურები", slug: "men-tshirts" },
    { name: "Jeans", nameKa: "ჯინსები", slug: "men-jeans" },
    { name: "Jackets", nameKa: "ქურთუკები", slug: "men-jackets" },
    { name: "Sweaters", nameKa: "სვიტრები", slug: "men-sweaters" },
  ],
  kids: [
    { name: "Boys", nameKa: "ბიჭები", slug: "kids-boys" },
    { name: "Girls", nameKa: "გოგოები", slug: "kids-girls" },
    { name: "Baby", nameKa: "ბავშვი", slug: "kids-baby" },
  ],
};

const ITEMS = [
  // women
  { cat: "women-dresses", title: "Floral midi dress", brand: "Zara", size: "S", priceGel: 4500, condition: "like_new", color: "Floral", img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800" },
  { cat: "women-dresses", title: "Black evening dress", brand: "Mango", size: "M", priceGel: 7000, condition: "good", color: "Black", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800" },
  { cat: "women-tops", title: "Linen blouse", brand: "H&M", size: "S", priceGel: 2200, condition: "like_new", color: "White", img: "https://images.unsplash.com/photo-1564257577-2d3ee8740ed4?w=800" },
  { cat: "women-jeans", title: "High-waist mom jeans", brand: "Levi's", size: "M", priceGel: 5500, condition: "good", color: "Blue", img: "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=800" },
  { cat: "women-outerwear", title: "Beige trench coat", brand: "Uniqlo", size: "S", priceGel: 9000, condition: "like_new", color: "Beige", img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800" },
  { cat: "women", title: "Vintage Levi's denim jacket", brand: "Levi's", size: "M", priceGel: 7500, condition: "good", color: "Blue", img: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800" },

  // men
  { cat: "men-tshirts", title: "Plain white tee", brand: "COS", size: "L", priceGel: 1800, condition: "good", color: "White", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800" },
  { cat: "men-jeans", title: "Slim-fit dark jeans", brand: "Levi's", size: "32", priceGel: 6000, condition: "like_new", color: "Black", img: "https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?w=800" },
  { cat: "men-jackets", title: "Bomber jacket", brand: "Bershka", size: "M", priceGel: 5500, condition: "good", color: "Green", img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800" },
  { cat: "men-sweaters", title: "Wool knit sweater", brand: "Pull&Bear", size: "M", priceGel: 4000, condition: "good", color: "Grey", img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800" },

  // kids
  { cat: "kids-boys", title: "Kids hoodie", brand: "Nike", size: "8y", priceGel: 3500, condition: "like_new", color: "Blue", img: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800" },
  { cat: "kids-girls", title: "Pink summer dress", brand: "Zara Kids", size: "6y", priceGel: 2500, condition: "good", color: "Pink", img: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800" },
  { cat: "kids-baby", title: "Baby onesie set (3 pcs)", brand: "Carter's", size: "6m", priceGel: 1500, condition: "like_new", color: "White", img: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800" },

  // shoes
  { cat: "shoes", title: "White leather sneakers", brand: "Adidas", size: "39", priceGel: 4500, condition: "like_new", color: "White", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800" },
  { cat: "shoes", title: "Black ankle boots", brand: "Dr. Martens", size: "38", priceGel: 12000, condition: "good", color: "Black", img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800" },
  { cat: "shoes", title: "Running shoes", brand: "Nike", size: "42", priceGel: 6500, condition: "good", color: "Grey", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800" },

  // bags
  { cat: "bags", title: "Black mini bag", brand: "Zara", priceGel: 3000, condition: "good", color: "Black", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800" },
  { cat: "bags", title: "Brown leather tote", brand: "Mango", priceGel: 8000, condition: "like_new", color: "Brown", img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800" },
  { cat: "bags", title: "Quilted crossbody", brand: "Mango", priceGel: 5500, condition: "good", color: "Beige", img: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800" },

  // accessories / vintage
  { cat: "accessories", title: "Gold hoop earrings", brand: "H&M", priceGel: 800, condition: "like_new", color: "Gold", img: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800" },
  { cat: "vintage", title: "70s vintage silk scarf", brand: "Vintage", priceGel: 4500, condition: "good", color: "Multi", img: "https://images.unsplash.com/photo-1601762603339-fd61e28b698a?w=800" },
];

async function fetchHash(url: string) {
  try {
    const r = await fetch(url);
    const buf = Buffer.from(await r.arrayBuffer());
    const phash = await computePHash(buf);
    const color = await computeDominantColor(buf);
    let embedding: string | undefined;
    try {
      const emb = await computeClipEmbedding(buf);
      embedding = JSON.stringify(emb);
    } catch (e) { console.error("\nembed failed for", url, (e as Error).message); }
    return { phash, ...color, embedding };
  } catch {
    return { phash: "0".repeat(16), r: 128, g: 128, b: 128 };
  }
}

async function main() {
  // Top-level categories
  for (const c of TOP) {
    await prisma.category.upsert({ where: { slug: c.slug }, create: c, update: c });
  }
  // Subcategories
  for (const [parentSlug, subs] of Object.entries(SUB)) {
    const parent = await prisma.category.findUnique({ where: { slug: parentSlug } });
    if (!parent) continue;
    for (const s of subs) {
      await prisma.category.upsert({
        where: { slug: s.slug },
        create: { ...s, parentId: parent.id },
        update: { ...s, parentId: parent.id },
      });
    }
  }

  const passwordHash = await bcrypt.hash("password123", 10);
  const sellers = [];
  for (const u of [
    { email: "demo@georgianthreads.ge", username: "demo", displayName: "Demo Seller", city: "Tbilisi", bio: "Selling pieces from my closet ✨" },
    { email: "nino@georgianthreads.ge", username: "nino", displayName: "Nino", city: "Batumi", bio: "Vintage hunter 🕵️‍♀️" },
    { email: "luka@georgianthreads.ge", username: "luka", displayName: "Luka", city: "Tbilisi", bio: "Streetwear" },
  ]) {
    sellers.push(await prisma.user.upsert({
      where: { email: u.email },
      create: { ...u, passwordHash },
      update: {},
    }));
  }

  // Wipe items so reseed is idempotent
  await prisma.item.deleteMany({});

  for (let i = 0; i < ITEMS.length; i++) {
    const it = ITEMS[i];
    const cat = await prisma.category.findUnique({ where: { slug: it.cat } });
    if (!cat) continue;
    const seller = sellers[i % sellers.length];
    const h = await fetchHash(it.img);
    await prisma.item.create({
      data: {
        title: it.title,
        description: `${it.title}. Selling because I rarely wear it. From a smoke-free home.`,
        priceGel: it.priceGel,
        size: (it as any).size ?? null,
        brand: it.brand,
        color: it.color,
        condition: it.condition,
        sellerId: seller.id,
        categoryId: cat.id,
        images: {
          create: [{
            url: it.img, order: 0,
            phash: h.phash, dominantR: h.r, dominantG: h.g, dominantB: h.b,
            embedding: (h as any).embedding,
          }],
        },
      },
    });
    process.stdout.write(`.`);
  }

  console.log("\n✅ seeded");
}

main().finally(() => prisma.$disconnect());
