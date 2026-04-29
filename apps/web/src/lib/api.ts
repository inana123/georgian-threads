export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function api<T = any>(
  path: string,
  opts: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...rest } = opts;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error((await res.text()) || res.statusText);
  return res.json();
}

export function imgUrl(u: string) {
  if (!u) return "";
  if (u.startsWith("http")) return u;
  return `${API_URL}${u}`;
}

export function priceFormat(tetri: number) {
  return `${(tetri / 100).toFixed(2)} ₾`;
}
