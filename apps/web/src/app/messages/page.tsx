"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, imgUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";

export default function MessagesPage() {
  const { token, user, loading } = useAuth();
  const router = useRouter();
  const [convs, setConvs] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (token) api<any[]>("/api/conversations", { token }).then(setConvs);
  }, [token, loading, user, router]);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">{t.conversations}</h1>
      <div className="bg-white border rounded-lg divide-y">
        {convs.length === 0 && <p className="p-4 text-gray-500">{t.noConvs}</p>}
        {convs.map((c) => {
          const other = c.buyerId === user?.id ? c.seller : c.buyer;
          return (
            <Link key={c.id} href={`/messages/${c.id}`} className="flex items-center gap-3 p-3 hover:bg-gray-50">
              {c.item.images?.[0] && <img src={imgUrl(c.item.images[0].url)} className="w-12 h-12 rounded object-cover" />}
              <div className="flex-1">
                <div className="font-semibold text-sm">@{other.username}</div>
                <div className="text-sm text-gray-600 truncate">{c.messages?.[0]?.body ?? "—"}</div>
              </div>
              <div className="text-xs text-gray-400">{c.item.title}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
