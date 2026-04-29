"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  return (
    <div className="max-w-sm mx-auto bg-white p-6 rounded-2xl border">
      <h1 className="text-xl font-bold mb-4">{t.registerTitle}</h1>
      <form onSubmit={async (e) => {
        e.preventDefault(); setErr("");
        try { await register(email, username, password); router.push("/"); }
        catch { setErr(t.taken); }
      }} className="space-y-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.email} className="w-full border p-2.5 rounded-lg" />
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t.username} className="w-full border p-2.5 rounded-lg" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder={t.passwordHint} className="w-full border p-2.5 rounded-lg" />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="w-full bg-brand text-white py-2.5 rounded-full font-semibold">{t.signup}</button>
      </form>
      <p className="text-sm text-gray-500 mt-4">{t.haveAccount} <Link href="/login" className="text-brand">{t.login}</Link></p>
    </div>
  );
}
