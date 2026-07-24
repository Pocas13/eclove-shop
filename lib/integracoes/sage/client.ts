import { withRetry } from "../retry";
import { getValidAccessToken } from "./oauth";

const baseUrl = "https://api.accounting.sage.com/v3.1";

export class SageClient {
  async request<T>(path: string, init: { method?: string; query?: Record<string, string>; body?: unknown; businessId?: string } = {}) {
    if (process.env.SAGE_MODE !== "live") throw new Error("A integração Sage está desativada. Defina SAGE_MODE=live após configurar o OAuth.");
    const { token, connection } = await getValidAccessToken();
    const businessId = init.businessId ?? connection.businessId ?? undefined;
    const method = (init.method ?? "GET").toUpperCase();
    const url = new URL(`${baseUrl}${path.startsWith("/") ? path : `/${path}`}`);
    Object.entries(init.query ?? {}).forEach(([key, value]) => url.searchParams.set(key, value));
    return withRetry(async () => {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(businessId ? { "X-Business": businessId } : {}),
          "User-Agent": "Eclove-Shop/1.0",
        },
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
        cache: "no-store",
      });
      const text = await response.text();
      const payload = text ? JSON.parse(text) : null;
      if (!response.ok) throw new Error(`Sage ${response.status}: ${payload?.$message ?? payload?.message ?? text ?? "pedido rejeitado"}`);
      return payload as T;
    });
  }
}

export function sageItems<T>(payload: { $items?: T[]; $resources?: T[] } | T[]) {
  return Array.isArray(payload) ? payload : payload.$items ?? payload.$resources ?? [];
}
