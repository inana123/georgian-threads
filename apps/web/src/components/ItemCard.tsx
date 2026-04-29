"use client";
import Link from "next/link";
import { useState } from "react";
import { api, imgUrl, priceFormat } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function ItemCard({ item }: { item: any }) {
  const img = item.images?.[0]?.url;
  const { token } = useAuth();
  const router = useRouter();
  const [faved, setFaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggleFav = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!token) { router.push("/login"); return; }
    setBusy(true);
    try {
      if (faved) {
        await api(`/api/favorites/${item.id}`, { method: "DELETE", token });
        setFaved(false);
      } else {
        await api(`/api/favorites/${item.id}`, { method: "POST", token });
        setFaved(true);
      }
    } finally { setBusy(false); }
  };

  return (
    <Link href={`/items/${item.id}`} className="group block bg-white rounded-xl overflow-hidden shadow-card hover:shadow-cardHover transition relative">
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {img ? (
          <img src={imgUrl(img)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
        ) : <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">👕</div>}
        <button
          onClick={toggleFav}
          disabled={busy}
          className={`absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-110 transition ${faved ? "text-red-500" : "text-gray-700"}`}
          title="ფავორიტში დამატება"
        >
          {faved ? "♥" : "♡"}
        </button>
      </div>
      <div className="p-3">
        <div className="font-semibold text-sm truncate">{item.title}</div>
        <div className="text-xs text-gray-500 mt-0.5 truncate">
          {item.brand ?? "—"} · ზომა {item.size ?? "—"}
        </div>
        <div className="text-brand font-bold mt-2">{priceFormat(item.priceGel)}</div>
      </div>
    </Link>
  );
}
