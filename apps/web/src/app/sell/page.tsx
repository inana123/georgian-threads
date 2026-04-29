"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, API_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";

export default function SellPage() {
  const { token, user, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "", description: "", priceGel: "", categoryId: "",
    size: "", brand: "", condition: "good", color: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { api("/api/categories").then(setCategories); }, []);
  useEffect(() => { if (!loading && !user) router.push("/login"); }, [loading, user, router]);

  const onFiles = (fl: FileList | null) => {
    if (!fl) return;
    const arr = Array.from(fl).slice(0, 8);
    setFiles(arr);
    setPreviews(arr.map((f) => URL.createObjectURL(f)));
  };
  const removeImg = (i: number) => {
    setFiles(files.filter((_, idx) => idx !== i));
    setPreviews(previews.filter((_, idx) => idx !== i));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      let images: any[] = [];
      if (files.length) {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        const res = await fetch(`${API_URL}/api/uploads`, {
          method: "POST", body: fd, headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        images = data.images ?? data.urls.map((url: string) => ({ url }));
      }
      const item = await api<any>("/api/items", {
        method: "POST", token,
        body: JSON.stringify({
          ...form,
          priceGel: Math.round(Number(form.priceGel) * 100),
          imageUrls: images.map((i) => i.url),
          images,
        }),
      });
      router.push(`/items/${item.id}`);
    } catch (e: any) { alert(String(e)); }
    finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={submit} className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-2xl border space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">{t.listItem}</h1>
        <p className="text-gray-500 text-sm">{t.listItemSub}</p>
      </div>

      <section>
        <h2 className="font-bold mb-2">{t.photos}</h2>
        <div className="grid grid-cols-4 gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
              <img src={src} className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeImg(i)}
                className="absolute top-1 right-1 bg-white/90 rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100">×</button>
            </div>
          ))}
          {previews.length < 8 && (
            <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-gray-400 text-3xl cursor-pointer hover:border-brand hover:text-brand">
              +<span className="text-xs mt-1 font-semibold">{t.add}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
            </label>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <label className="block text-sm font-semibold mb-1">{t.title}</label>
          <input required placeholder={t.titlePh}
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">{t.description}</label>
          <textarea required placeholder={t.descPh}
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border p-2.5 rounded-lg min-h-28 focus:outline-none focus:ring-2 focus:ring-brand" />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold mb-1">{t.category}</label>
          <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full border p-2.5 rounded-lg">
            <option value="">{t.choose}</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.nameKa} · {c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">{t.condition}</label>
          <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}
            className="w-full border p-2.5 rounded-lg">
            <option value="new">{t.cond.new}</option>
            <option value="like_new">{t.cond.like_new}</option>
            <option value="good">{t.cond.good}</option>
            <option value="fair">{t.cond.fair}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">{t.brand_}</label>
          <input placeholder={t.brandPh} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
            className="w-full border p-2.5 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">{t.size}</label>
          <input placeholder={t.sizePh} value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}
            className="w-full border p-2.5 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">{t.color}</label>
          <input placeholder={t.colorPh} value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="w-full border p-2.5 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">{t.price} (₾)</label>
          <input required type="number" step="0.01" placeholder={t.pricePh}
            value={form.priceGel} onChange={(e) => setForm({ ...form, priceGel: e.target.value })}
            className="w-full border p-2.5 rounded-lg" />
        </div>
      </section>

      <button disabled={submitting}
        className="w-full bg-brand text-white py-3 rounded-full font-bold hover:bg-brand-dark disabled:opacity-50">
        {submitting ? t.posting : t.post}
      </button>
    </form>
  );
}
