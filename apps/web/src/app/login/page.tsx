"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [emailOrUsername, setE] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");

  return (
    <div className="max-w-sm mx-auto bg-white p-6 rounded-2xl border">
      <h1 className="text-xl font-bold mb-4">{t.loginTitle}</h1>
      <form onSubmit={async (e) => {
        e.preventDefault(); setErr("");
        try { await login(emailOrUsername, password); router.push("/"); }
        catch { setErr(t.invalidCreds); }
      }} className="space-y-3">
        <input value={emailOrUsername} onChange={(e) => setE(e.target.value)} placeholder={t.emailOrUsername} className="w-full border p-2.5 rounded-lg" />
        <input value={password} onChange={(e) => setP(e.target.value)} type="password" placeholder={t.password} className="w-full border p-2.5 rounded-lg" />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="w-full bg-brand text-white py-2.5 rounded-full font-semibold">{t.login}</button>
      </form>
      <p className="text-sm text-gray-500 mt-4">{t.noAccount} <Link href="/register" className="text-brand">{t.signup}</Link></p>
      <p className="text-xs text-gray-400 mt-2">Demo: demo@georgianthreads.ge / password123</p>
    </div>
  );
}
