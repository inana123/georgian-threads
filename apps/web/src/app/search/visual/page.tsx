"use client";
import { useEffect, useRef, useState } from "react";
import { ItemCard } from "@/components/ItemCard";
import { API_URL } from "@/lib/api";
import { t } from "@/lib/i18n";

export default function VisualSearchPage() {
  const [items, setItems] = useState<any[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem("gt_visual_results");
    const prev = sessionStorage.getItem("gt_visual_preview");
    if (cached) setItems(JSON.parse(cached).items ?? []);
    if (prev) setPreview(prev);
  }, []);

  const upload = async (file: File) => {
    setLoading(true);
    setPreview(URL.createObjectURL(file));
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_URL}/api/visual-search/`, { method: "POST", body: fd });
    const data = await res.json();
    setItems(data.items ?? []);
    sessionStorage.setItem("gt_visual_results", JSON.stringify(data));
    setLoading(false);
  };

  return (
    <div>
      <div className="bg-gradient-to-r from-brand to-brand-dark text-white rounded-2xl p-6 md:p-8 mb-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1">{t.visualTitle}</h1>
          <p className="opacity-90 mb-4">{t.visualSub}</p>
          <button onClick={() => fileRef.current?.click()}
            className="bg-white text-brand px-6 py-3 rounded-full font-bold hover:bg-gray-100">
            {preview ? t.uploadAnother : t.uploadImage}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
        </div>
        {preview && <img src={preview} className="w-40 h-40 object-cover rounded-xl border-4 border-white shadow-lg" />}
      </div>

      {loading && <p className="text-gray-500">{t.analyzing}</p>}

      {!loading && preview && items.length > 0 && (
        <>
          <div className="text-sm text-gray-500 mb-3">
            {t.found(items.length)} <span className="font-bold text-brand">{items[0]._score}% {t.similarity}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((it) => (
              <div key={it.id} className="relative">
                <ItemCard item={it} />
                <div className="absolute top-2 left-2 bg-brand text-white text-xs font-bold px-2 py-1 rounded-full shadow">{it._score}%</div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !preview && (
        <div className="text-center py-16 text-gray-500">
          <div className="text-6xl mb-3">📸</div>
          <p>{t.startUpload}</p>
        </div>
      )}
    </div>
  );
}
