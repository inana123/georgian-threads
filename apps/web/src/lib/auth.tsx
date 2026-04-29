"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "./api";

type User = { id: string; username: string; email: string; displayName?: string; avatarUrl?: string };
type AuthCtx = {
  user: User | null;
  token: string | null;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const Ctx = createContext<AuthCtx>(null as any);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("gt_token");
    if (!t) { setLoading(false); return; }
    setToken(t);
    api<User>("/api/auth/me", { token: t }).then(setUser).catch(() => {
      localStorage.removeItem("gt_token");
    }).finally(() => setLoading(false));
  }, []);

  const finish = (data: { token: string; user: User }) => {
    localStorage.setItem("gt_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  return (
    <Ctx.Provider value={{
      user, token, loading,
      login: async (emailOrUsername, password) => {
        const data = await api<{ token: string; user: User }>("/api/auth/login", {
          method: "POST", body: JSON.stringify({ emailOrUsername, password }),
        });
        finish(data);
      },
      register: async (email, username, password) => {
        const data = await api<{ token: string; user: User }>("/api/auth/register", {
          method: "POST", body: JSON.stringify({ email, username, password }),
        });
        finish(data);
      },
      logout: () => {
        localStorage.removeItem("gt_token");
        setUser(null); setToken(null);
      },
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
