"use client";
import { useEffect, useState } from "react";
import { api, imgUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";

export default function ConversationPage({ params }: { params: { id: string } }) {
  const { token, user } = useAuth();
  const [conv, setConv] = useState<any>(null);
  const [body, setBody] = useState("");

  const load = () => token && api<any>(`/api/conversations/${params.id}`, { token }).then(setConv);
  useEffect(() => { load(); const t = setInterval(load, 3000); return () => clearInterval(t); }, [token, params.id]);

  if (!conv) return <div>Loading…</div>;
  const other = conv.buyerId === user?.id ? conv.seller : conv.buyer;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !token) return;
    await api(`/api/conversations/${conv.id}/messages`, {
      method: "POST", token, body: JSON.stringify({ body }),
    });
    setBody("");
    load();
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border rounded-lg flex flex-col h-[70vh]">
      <div className="p-3 border-b flex items-center gap-3">
        {conv.item.images?.[0] && <img src={imgUrl(conv.item.images[0].url)} className="w-10 h-10 rounded object-cover" />}
        <div>
          <div className="font-semibold">@{other.username}</div>
          <div className="text-xs text-gray-500">{conv.item.title}</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {conv.messages.map((m: any) => (
          <div key={m.id} className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${m.senderId === user?.id ? "bg-brand text-white ml-auto" : "bg-gray-100"}`}>
            {m.body}
          </div>
        ))}
      </div>
      <form onSubmit={send} className="p-3 border-t flex gap-2">
        <input value={body} onChange={(e) => setBody(e.target.value)} placeholder={t.typeMessage} className="flex-1 border rounded-full px-4 py-2" />
        <button className="bg-brand text-white px-4 py-2 rounded-full font-semibold">{t.send}</button>
      </form>
    </div>
  );
}
