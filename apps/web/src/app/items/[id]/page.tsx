"use client";
import { useEffect, useState } from "react";
import { api, imgUrl, priceFormat } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import Link from "next/link";

export default function ItemPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<any>(null);
  const [active, setActive] = useState(0);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [faved, setFaved] = useState(false);
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => { api(`/api/items/${params.id}`).then(setItem).catch(console.error); }, [params.id]);

  if (!item) return <div className="text-gray-500">…</div>;
  const isOwn = user?.id === item.seller.id;
  const images = item.images.length ? item.images : [{ id: "ph", url: "" }];

  const sendMessage = async () => {
    if (!token) { router.push("/login"); return; }
    if (!msg.trim()) return;
    setSending(true);
    try {
      const conv = await api<any>("/api/conversations/start", {
        method: "POST", token,
        body: JSON.stringify({ itemId: item.id, message: msg }),
      });
      router.push(`/messages/${conv.id}`);
    } catch (e) { alert(String(e)); }
    finally { setSending(false); }
  };
  const toggleFav = async () => {
    if (!token) { router.push("/login"); return; }
    if (faved) { await api(`/api/favorites/${item.id}`, { method: "DELETE", token }); setFaved(false); }
    else { await api(`/api/favorites/${item.id}`, { method: "POST", token }); setFaved(true); }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-8">
      <div>
        <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square">
          {images[active]?.url ? (
            <img src={imgUrl(images[active].url)} alt={item.title} className="w-full h-full object-contain" />
          ) : <div className="w-full h-full flex items-center justify-center text-gray-300 text-7xl">👕</div>}
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-6 gap-2 mt-3">
            {images.map((im: any, i: number) => (
              <button key={im.id} onClick={() => setActive(i)}
                className={`aspect-square rounded-lg overflow-hidden border-2 ${i === active ? "border-brand" : "border-transparent"}`}>
                <img src={imgUrl(im.url)} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">{item.category.nameKa}</div>
          <h1 className="text-2xl font-bold">{item.title}</h1>
          <div className="text-brand text-3xl font-extrabold mt-2">{priceFormat(item.priceGel)}</div>
        </div>

        <div className="bg-white border rounded-xl p-4 grid grid-cols-2 gap-y-2 text-sm">
          <div><div className="text-xs text-gray-500">{t.brand_}</div><div className="font-semibold">{item.brand ?? "—"}</div></div>
          <div><div className="text-xs text-gray-500">{t.size}</div><div className="font-semibold">{item.size ?? "—"}</div></div>
          <div><div className="text-xs text-gray-500">{t.condition}</div><div className="font-semibold">{(t.cond as any)[item.condition]}</div></div>
          <div><div className="text-xs text-gray-500">{t.color}</div><div className="font-semibold">{item.color ?? "—"}</div></div>
        </div>

        <div className="bg-white border rounded-xl p-4 text-sm">
          <p className="whitespace-pre-wrap">{item.description}</p>
        </div>

        <Link href={`/u/${item.seller.username}`} className="block bg-white border rounded-xl p-4 hover:border-brand">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-bold text-lg">
              {item.seller.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-semibold">@{item.seller.username}</div>
              {item.seller.city && <div className="text-xs text-gray-500">📍 {item.seller.city}</div>}
            </div>
            <span className="text-gray-400">›</span>
          </div>
        </Link>

        {!isOwn && (
          <div className="space-y-2">
            <button className="w-full bg-brand text-white py-3 rounded-full font-bold hover:bg-brand-dark">
              {t.buyNow} · {priceFormat(item.priceGel)}
            </button>
            <button onClick={toggleFav} className={`w-full border py-3 rounded-full font-semibold hover:border-brand ${faved ? "bg-red-50 border-red-300 text-red-600" : ""}`}>
              {faved ? t.saved : t.addFavorite}
            </button>
            <div className="bg-white border rounded-xl p-3">
              <textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={t.messagePlaceholder}
                className="w-full p-2 text-sm focus:outline-none min-h-16" />
              <button onClick={sendMessage} disabled={sending}
                className="w-full mt-2 bg-gray-900 text-white py-2 rounded-full font-semibold hover:bg-black disabled:opacity-50">
                {sending ? t.sending : t.messageSeller}
              </button>
            </div>
          </div>
        )}
        {isOwn && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">{t.yourListing}</div>
        )}
      </div>
    </div>
  );
}
