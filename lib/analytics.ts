export const analyticsConfig = { gaId: process.env.NEXT_PUBLIC_GA_ID, metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID };
export function eventoAnalytics(nome: string, parametros: Record<string, unknown> = {}) { if (typeof window !== "undefined") { const w = window as any; w.gtag?.("event", nome, parametros); w.fbq?.("trackCustom", nome, parametros); } }
