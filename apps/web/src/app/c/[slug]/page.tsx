import { api } from "@/lib/api";
import { ItemCard } from "@/components/ItemCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { t } from "@/lib/i18n";
import Link from "next/link";

export default async function CategoryPage({
  params, searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | undefined>;
}) {
  const qs = new URLSearchParams();
  qs.set("categorySlug", params.slug);
  for (const [k, v] of Object.entries(searchParams)) if (v) qs.set(k, v);

  const [items, categories] = await Promise.all([
    api<any[]>(`/api/items?${qs.toString()}`),
    api<any[]>(`/api/categories`),
  ]);
  const top = categories.find((c) => c.slug === params.slug);
  const subs = categories.filter((c) => c.parentId === top?.id);

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-3xl font-extrabold">{top?.nameKa ?? params.slug}</h1>
        <p className="text-gray-500">{top?.name}</p>
      </div>

      {subs.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          <Link href={`/c/${params.slug}`}
            className="shrink-0 px-4 py-2 rounded-full border text-sm font-semibold whitespace-nowrap bg-brand text-white border-brand">
            {t.cat.all} {top?.nameKa}
          </Link>
          {subs.map((s) => (
            <Link key={s.id} href={`/?categoryId=${s.id}`}
              className="shrink-0 px-4 py-2 rounded-full border text-sm font-semibold whitespace-nowrap bg-white hover:border-brand">
              {s.nameKa} <span className="text-xs opacity-70">· {s.name}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        <FilterSidebar />
        <div>
          <div className="text-sm text-gray-500 mb-3">{t.itemsCount(items.length)}</div>
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-5xl mb-2">🛍️</div>
              <p>{t.beFirst}<Link href="/sell" className="text-brand underline">{t.postOne}</Link></p>
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
