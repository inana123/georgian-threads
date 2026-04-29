import { api } from "@/lib/api";
import { ItemCard } from "@/components/ItemCard";
import { CategoryStrip } from "@/components/CategoryStrip";
import { FilterSidebar } from "@/components/FilterSidebar";
import { TrustBanner } from "@/components/TrustBanner";
import { t } from "@/lib/i18n";
import Link from "next/link";

const POPULAR_BRANDS = ["Zara", "H&M", "Levi's", "Nike", "Adidas", "Mango", "Uniqlo", "COS"];

export default async function Home({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) if (v) qs.set(k, v);

  const [items, categories] = await Promise.all([
    api<any[]>(`/api/items?${qs.toString()}`),
    api<any[]>(`/api/categories`),
  ]);
  const topCats = categories.filter((c) => !c.parentId);
  const isFiltered = !!(searchParams.search || searchParams.categoryId || searchParams.minPrice || searchParams.maxPrice || searchParams.condition);

  return (
    <div>
      {!isFiltered && (
        <>
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white p-8 md:p-12 mb-6">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-block bg-white/20 backdrop-blur text-xs font-bold px-3 py-1 rounded-full mb-3">{t.heroBadge}</span>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-3">{t.heroTitle}</h1>
              <p className="opacity-90 mb-5 text-lg">{t.heroSubtitle}</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/sell" className="bg-white text-brand px-6 py-3 rounded-full font-bold hover:bg-gray-100">{t.heroSell}</Link>
                <Link href="/search/visual" className="bg-white/15 backdrop-blur border border-white/30 text-white px-6 py-3 rounded-full font-bold hover:bg-white/25">{t.heroVisual}</Link>
              </div>
            </div>
            <div className="absolute right-0 top-0 text-[200px] opacity-10 select-none">🧵</div>
          </section>

          <TrustBanner />

          <section className="mb-6">
            <h2 className="font-bold mb-3">{t.popularBrands}</h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {POPULAR_BRANDS.map((b) => (
                <Link key={b} href={`/?search=${encodeURIComponent(b)}`}
                  className="shrink-0 bg-white border rounded-full px-4 py-2 text-sm font-semibold hover:border-brand">{b}</Link>
              ))}
            </div>
          </section>
        </>
      )}

      <CategoryStrip categories={topCats} />

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        <FilterSidebar />
        <div>
          <div className="text-sm text-gray-500 mb-3">{t.itemsCount(items.length)}</div>
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-5xl mb-2">🛍️</div>
              <p>{t.noItems} <Link href="/" className="text-brand underline">{t.clearFilters}</Link></p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((it) => <ItemCard key={it.id} item={it} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
