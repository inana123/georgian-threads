"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { API_URL } from "@/lib/api";
import { t } from "@/lib/i18n";

const PRIMARY = [
  { slug: "women", emoji: "👗" },
  { slug: "men", emoji: "👔" },
  { slug: "kids", emoji: "🧒" },
  { slug: "shoes", emoji: "👟" },
  { slug: "bags", emoji: "👜" },
  { slug: "accessories", emoji: "👓" },
  { slug: "vintage", emoji: "🕰️" },
] as const;

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("search") ?? "");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const onCameraPick = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_URL}/api/visual-search/`, { method: "POST", body: fd });
      const data = await res.json();
      sessionStorage.setItem("gt_visual_results", JSON.stringify(data));
      sessionStorage.setItem("gt_visual_preview", URL.createObjectURL(file));
      router.push("/search/visual");
    } finally { setUploading(false); }
  };

  return (
    <header className="bg-white border-b sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-brand text-xl whitespace-nowrap">
          <span className="text-2xl">🧵</span>
          <span className="hidden sm:inline">{t.brand}</span>
        </Link>

        <form
          className="flex-1 max-w-2xl relative"
          onSubmit={(e) => { e.preventDefault(); router.push(`/?search=${encodeURIComponent(q)}`); }}
        >
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full border border-gray-200 bg-gray-50 rounded-full pl-11 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white"
          />
          <button
            type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            title={t.searchByImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand-dark disabled:opacity-50"
          >
            {uploading ? "…" : "📷"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onCameraPick(f); }} />
        </form>

        <nav className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              <Link href="/messages" className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full hover:bg-gray-100" title={t.messages}>💬</Link>
              <Link href="/favorites" className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full hover:bg-gray-100" title={t.favorites}>♡</Link>
              <Link href={`/u/${user.username}`} className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100">
                <div className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold">
                  {user.username[0]?.toUpperCase()}
                </div>
                <span>@{user.username}</span>
              </Link>
              <button onClick={logout} className="text-gray-500 hover:text-red-600 text-xs px-2 hidden md:inline">{t.logout}</button>
              <Link href="/sell" className="bg-brand text-white px-5 py-2.5 rounded-full font-bold hover:bg-brand-dark shadow-sm">{t.sellNow}</Link>
            </>
          ) : (
            <>
              <Link href="/login" className="px-3 py-2 hover:text-brand font-semibold">{t.login}</Link>
              <Link href="/register" className="hidden sm:inline border border-brand text-brand px-4 py-2 rounded-full font-semibold hover:bg-brand-light">{t.signup}</Link>
              <Link href="/sell" className="bg-brand text-white px-5 py-2.5 rounded-full font-bold hover:bg-brand-dark shadow-sm">{t.sellNow}</Link>
            </>
          )}
        </nav>
      </div>

      <div className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {PRIMARY.map((c) => (
            <Link key={c.slug} href={`/c/${c.slug}`}
              className="shrink-0 px-3 py-3 text-sm font-semibold text-gray-700 hover:text-brand border-b-2 border-transparent hover:border-brand whitespace-nowrap flex items-center gap-1.5">
              <span>{c.emoji}</span> {(t.cat as any)[c.slug]}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
