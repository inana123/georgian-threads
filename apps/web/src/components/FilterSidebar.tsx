"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { t } from "@/lib/i18n";

export function FilterSidebar() {
  const router = useRouter();
  const params = useSearchParams();
  const [minPrice, setMin] = useState(params.get("minPrice") ?? "");
  const [maxPrice, setMax] = useState(params.get("maxPrice") ?? "");
  const [condition, setCondition] = useState(params.get("condition") ?? "");

  const apply = () => {
    const sp = new URLSearchParams(Array.from(params.entries()));
    minPrice ? sp.set("minPrice", String(Number(minPrice) * 100)) : sp.delete("minPrice");
    maxPrice ? sp.set("maxPrice", String(Number(maxPrice) * 100)) : sp.delete("maxPrice");
    condition ? sp.set("condition", condition) : sp.delete("condition");
    router.push(`/?${sp.toString()}`);
  };
  const clear = () => router.push("/");

  return (
    <aside className="bg-white border rounded-xl p-4 sticky top-32 text-sm space-y-4">
      <h3 className="font-bold">{t.filters}</h3>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">{t.price} (₾)</label>
        <div className="flex gap-2">
          <input value={minPrice} onChange={(e) => setMin(e.target.value)} placeholder={t.min} className="w-full border rounded p-1.5" />
          <input value={maxPrice} onChange={(e) => setMax(e.target.value)} placeholder={t.max} className="w-full border rounded p-1.5" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">{t.condition}</label>
        <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full border rounded p-1.5">
          <option value="">{t.any}</option>
          <option value="new">{t.cond.new}</option>
          <option value="like_new">{t.cond.like_new}</option>
          <option value="good">{t.cond.good}</option>
          <option value="fair">{t.cond.fair}</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={apply} className="flex-1 bg-brand text-white py-2 rounded-full font-semibold hover:bg-brand-dark">{t.apply}</button>
        <button onClick={clear} className="px-3 py-2 border rounded-full hover:border-brand">{t.clear}</button>
      </div>
    </aside>
  );
}
