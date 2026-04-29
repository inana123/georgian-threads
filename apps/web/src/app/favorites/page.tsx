"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ItemCard } from "@/components/ItemCard";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";

export default function FavoritesPage() {
  const { token, user, loading } = useAuth();
  const router = useRouter();
  const [favs, setFavs] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (token) api<any[]>("/api/favorites", { token }).then(setFavs);
  }, [token, user, loading, router]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">{t.favorites}</h1>
      {favs.length === 0 ? <p className="text-gray-500">—</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {favs.map((f) => <ItemCard key={f.id} item={f.item} />)}
        </div>
      )}
    </div>
  );
}
