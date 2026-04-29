import { api } from "@/lib/api";
import { ItemCard } from "@/components/ItemCard";

export default async function UserPage({ params }: { params: { username: string } }) {
  const user = await api<any>(`/api/users/${params.username}`).catch(() => null);
  if (!user) return <p>User not found.</p>;
  return (
    <div>
      <div className="bg-white p-6 rounded-lg border flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200" />
        <div>
          <h1 className="text-xl font-bold">@{user.username}</h1>
          {user.displayName && <p className="text-gray-600">{user.displayName}</p>}
          {user.city && <p className="text-sm text-gray-500">{user.city}</p>}
          {user.bio && <p className="text-sm mt-2">{user.bio}</p>}
        </div>
      </div>
      <h2 className="font-bold mt-6 mb-3">Items for sale ({user.items.length})</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {user.items.map((it: any) => <ItemCard key={it.id} item={it} />)}
      </div>
    </div>
  );
}
