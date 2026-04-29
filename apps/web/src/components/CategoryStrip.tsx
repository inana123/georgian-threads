"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { t } from "@/lib/i18n";

const ICONS: Record<string, string> = {
  women: "👗", men: "👔", kids: "🧒", shoes: "👟",
  bags: "👜", accessories: "👓", vintage: "🕰️",
};

export function CategoryStrip({ categories }: { categories: any[] }) {
  const params = useSearchParams();
  const active = params.get("categoryId") ?? "";

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4">
      <Link href="/"
        className={`shrink-0 px-4 py-2 rounded-full border text-sm font-semibold whitespace-nowrap ${active === "" ? "bg-brand text-white border-brand" : "bg-white hover:border-brand"}`}>
        {t.cat.all}
      </Link>
      {categories.map((c) => (
        <Link key={c.id} href={`/?categoryId=${c.id}`}
          className={`shrink-0 px-4 py-2 rounded-full border text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 ${active === c.id ? "bg-brand text-white border-brand" : "bg-white hover:border-brand"}`}>
          <span>{ICONS[c.slug] ?? "🛍️"}</span>
          <span>{c.nameKa}</span>
        </Link>
      ))}
    </div>
  );
}
