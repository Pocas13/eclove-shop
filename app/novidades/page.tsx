import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { contaAprovada } from "@/lib/acesso";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PrecoProtegido from "@/components/PrecoProtegido";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Novidades", description: "Conheça os produtos mais recentes da Eclove." };
const POR_PAGINA = 12;

export default async function NovidadesPage({ searchParams }: { searchParams: Promise<{ pagina?: string }> }) {
  const session = await getServerSession(authOptions);
  const precosVisiveis = contaAprovada(session);
  const query = await searchParams;
  const pagina = Math.max(1, Number.parseInt(query.pagina || "1", 10) || 1);
  const [produtos, total] = await Promise.all([
    prisma.produto.findMany({ where: { ativo: true }, include: { categoria: true }, orderBy: { createdAt: "desc" }, skip: (pagina - 1) * POR_PAGINA, take: POR_PAGINA }),
    prisma.produto.count({ where: { ativo: true } }),
  ]);
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return <div className="container-site py-14 sm:py-20"><div className="section-heading"><div><p className="eyebrow">Chegaram agora</p><h1 className="mt-3 font-display text-5xl font-bold tracking-[-.05em] sm:text-6xl">Novidades</h1></div><p>{total} produtos publicados. A paginação mantém a página rápida mesmo quando o catálogo crescer.</p></div>
    <div className="mt-12 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">{produtos.map((produto) => <Link key={produto.id} href={`/produtos/${produto.slug}`} className="product-card group"><div className="product-image">{produto.imagens[0] ? <img src={produto.imagens[0]} alt={produto.nome} loading="lazy" /> : <div className="grid h-full place-items-center text-sm text-grafite-500">Imagem em preparação</div>}<span className="product-badge">Novo</span></div><div className="pt-4"><p className="text-xs font-bold uppercase tracking-wider text-barro-600">{produto.categoria.nome}</p><h2 className="mt-1 font-display text-xl font-bold">{produto.nome}</h2><p className="mt-3 text-lg font-bold"><PrecoProtegido valor={Number(produto.preco)} visivel={precosVisiveis} /></p></div></Link>)}</div>
    {paginas > 1 && <nav className="mt-14 flex flex-wrap justify-center gap-2" aria-label="Paginação">{Array.from({ length: paginas }, (_, i) => i + 1).map((n) => <Link key={n} href={`/novidades?pagina=${n}`} className={`grid h-11 w-11 place-items-center rounded-full border text-sm font-bold ${n === pagina ? "border-grafite-900 bg-grafite-900 text-white" : "border-calcario-300 bg-white"}`}>{n}</Link>)}</nav>}
  </div>;
}
