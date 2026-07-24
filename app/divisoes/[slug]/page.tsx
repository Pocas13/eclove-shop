import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { contaAprovada } from "@/lib/acesso";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PrecoProtegido from "@/components/PrecoProtegido";
import { divisoesCatalogo, obterDivisao } from "@/lib/divisoes";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return divisoesCatalogo.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const divisao = obterDivisao(slug);
  return divisao ? { title: divisao.nome, description: divisao.descricao } : {};
}

export default async function DivisaoPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  const precosVisiveis = contaAprovada(session);
  const { slug } = await params;
  const divisao = obterDivisao(slug);
  if (!divisao) notFound();

  const slugs = [...new Set([...divisao.categorias, ...divisao.subdivisoes.map((s) => s.slug)])];
  const produtos = await prisma.produto.findMany({
    where: { ativo: true, OR: [{ categoria: { slug: { in: slugs } } }, { categoria: { parent: { slug: { in: slugs } } } }] },
    include: { categoria: true },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  return (
    <div>
      <section className="container-site pt-6 sm:pt-10">
        <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] bg-grafite-900">
          <img src={divisao.imagem} alt={`Ambiente de ${divisao.nome}`} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-grafite-900/90 via-grafite-900/50 to-transparent" />
          <div className="relative z-10 flex min-h-[430px] max-w-2xl flex-col justify-end p-8 text-white sm:p-14">
            <Link href="/divisoes" className="text-sm text-white/70 hover:text-white">← Todas as divisões</Link>
            <h1 className="mt-5 font-display text-5xl font-bold tracking-[-.05em] sm:text-6xl">{divisao.nome}</h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-white/75">{divisao.descricao}</p>
          </div>
        </div>
      </section>

      <section className="container-site py-14">
        <p className="eyebrow">Categorias</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {divisao.subdivisoes.map((sub) => <Link key={sub.slug} href={`/produtos?categoria=${sub.slug}`} className="rounded-full border border-calcario-300 bg-white px-5 py-3 text-sm font-semibold hover:border-grafite-900">{sub.nome}</Link>)}
        </div>
      </section>

      <section className="container-site pb-20">
        <div className="section-heading"><div><p className="eyebrow">Catálogo</p><h2>Produtos para {divisao.nome.toLowerCase()}</h2></div><p>São apresentados até 24 produtos. Use as categorias para afinar a seleção.</p></div>
        {produtos.length === 0 ? <div className="mt-10 rounded-3xl bg-calcario-100 p-10 text-center text-grafite-500">Ainda não existem produtos publicados nesta divisão.</div> : <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">{produtos.map((produto) => <Link key={produto.id} href={`/produtos/${produto.slug}`} className="product-card group"><div className="product-image">{produto.imagens[0] ? <img src={produto.imagens[0]} alt={produto.nome} loading="lazy" /> : <div className="grid h-full place-items-center text-sm text-grafite-500">Imagem em preparação</div>}</div><div className="pt-4"><p className="text-xs font-bold uppercase tracking-wider text-barro-600">{produto.categoria.nome}</p><h3 className="mt-1 font-display text-xl font-bold">{produto.nome}</h3><p className="mt-3 text-lg font-bold"><PrecoProtegido valor={Number(produto.preco)} visivel={precosVisiveis} /></p></div></Link>)}</div>}
      </section>
    </div>
  );
}
