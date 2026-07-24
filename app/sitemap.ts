import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { divisoesCatalogo } from "@/lib/divisoes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002";
  const produtos = await prisma.produto.findMany({ where: { ativo: true }, select: { slug: true, updatedAt: true } });
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/divisoes`, changeFrequency: "monthly", priority: .8 },
    { url: `${base}/novidades`, changeFrequency: "weekly", priority: .8 },
    { url: `${base}/produtos`, changeFrequency: "weekly", priority: .8 },
    ...divisoesCatalogo.map((d) => ({ url: `${base}/divisoes/${d.slug}`, changeFrequency: "weekly" as const, priority: .7 })),
    { url: `${base}/entregas`, changeFrequency: "monthly", priority: .5 },
    { url: `${base}/trocas-e-devolucoes`, changeFrequency: "monthly", priority: .5 },
    ...produtos.map((p) => ({ url: `${base}/produtos/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: .8 })),
  ];
}
