import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { contaAprovada } from "@/lib/acesso";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import PrecoProtegido from "@/components/PrecoProtegido";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Produtos", description: "Catálogo de produtos Eclove." };
const POR_PAGINA = 24;

export default async function ProdutosPage({ searchParams }: { searchParams: Promise<{ categoria?: string; pagina?: string }> }) {
  const session = await getServerSession(authOptions);
  const precosVisiveis = contaAprovada(session);
  const query = await searchParams;
  const pagina = Math.max(1, Number.parseInt(query.pagina || "1", 10) || 1);
  const categoria = query.categoria?.trim();
  const where: Prisma.ProdutoWhereInput = { ativo: true, ...(categoria ? { OR: [{ categoria: { slug: categoria } }, { categoria: { parent: { slug: categoria } } }] } : {}) };
  const [produtos, total, categoriaAtual] = await Promise.all([
    prisma.produto.findMany({ where, include: { categoria: true }, orderBy: { nome: "asc" }, skip: (pagina - 1) * POR_PAGINA, take: POR_PAGINA }),
    prisma.produto.count({ where }),
    categoria ? prisma.categoria.findUnique({ where: { slug: categoria } }) : Promise.resolve(null),
  ]);
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  return <div className="container-site py-14 sm:py-20"><p className="eyebrow">Catálogo</p><div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="font-display text-5xl font-bold tracking-[-.05em] sm:text-6xl">{categoriaAtual?.nome || "Todos os produtos"}</h1><p className="mt-4 text-grafite-500">{total} resultados</p></div>{categoria && <Link href="/produtos" className="text-sm font-semibold underline">Limpar categoria</Link>}</div>
    <div className="mt-12 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">{produtos.map((produto) => <Link key={produto.id} href={`/produtos/${produto.slug}`} className="product-card group"><div className="product-image">{produto.imagens[0] ? <img src={produto.imagens[0]} alt={produto.nome} loading="lazy" /> : <div className="grid h-full place-items-center text-sm text-grafite-500">Imagem em preparação</div>}</div><div className="pt-4"><p className="text-xs font-bold uppercase tracking-wider text-barro-600">{produto.categoria.nome}</p><h2 className="mt-1 font-display text-xl font-bold">{produto.nome}</h2><p className="mt-3 text-lg font-bold"><PrecoProtegido valor={Number(produto.preco)} visivel={precosVisiveis} /></p></div></Link>)}</div>
    {paginas > 1 && <nav className="mt-14 flex flex-wrap justify-center gap-2">{Array.from({ length: paginas }, (_, i) => i + 1).map((n) => <Link key={n} href={`/produtos?${categoria ? `categoria=${categoria}&` : ""}pagina=${n}`} className={`grid h-11 w-11 place-items-center rounded-full border text-sm font-bold ${n === pagina ? "border-grafite-900 bg-grafite-900 text-white" : "border-calcario-300 bg-white"}`}>{n}</Link>)}</nav>}
  </div>;
}
