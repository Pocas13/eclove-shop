import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { contaAprovada } from "@/lib/acesso";
import { prisma } from "@/lib/prisma";
import PrecoProtegido from "@/components/PrecoProtegido";
import { notFound } from "next/navigation";
import BotaoAdicionarCarrinho from "@/components/BotaoAdicionarCarrinho";
import ProductShare from "@/components/ProductShare";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> { const { id } = await params; const p = await prisma.produto.findUnique({ where: { slug: id } }); return p ? { title: p.nome, description: p.descricao, openGraph: { title: p.nome, description: p.descricao, images: p.imagens[0] ? [p.imagens[0]] : [] } } : {}; }

export default async function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const precosVisiveis = contaAprovada(session);
  const { id } = await params;
  const produto = await prisma.produto.findUnique({ where: { slug: id }, include: { categoria: true, reviews: { where: { aprovado: true }, include: { user: true }, take: 6 } } });
  if (!produto || !produto.ativo) notFound();
  const relacionadas = await prisma.produto.findMany({ where: { ativo: true, categoriaId: produto.categoriaId, NOT: { id: produto.id } }, include: { categoria: true }, take: 4 });
  const imagens = produto.imagens.length ? produto.imagens : [""];
  return <div className="container-site py-8 sm:py-12">
    <nav className="mb-8 text-sm text-grafite-500"><Link href="/">Início</Link> <span className="mx-2">/</span> {produto.categoria.nome}</nav>
    <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-16">
      <div className="grid gap-4 sm:grid-cols-2">{imagens.slice(0,4).map((imagem,i)=><div key={i} className={`overflow-hidden rounded-[2rem] bg-calcario-100 ${i===0?"sm:col-span-2 aspect-[4/3]":"aspect-square"}`}>{imagem?<img src={imagem} alt={`${produto.nome} — imagem ${i+1}`} className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-grafite-500">Imagem em preparação</div>}</div>)}</div>
      <div className="lg:sticky lg:top-28 lg:self-start"><p className="eyebrow">{produto.categoria.nome}</p><h1 className="mt-4 font-display text-4xl font-bold tracking-[-.045em] sm:text-6xl">{produto.nome}</h1><div className="mt-4 flex items-center gap-3 text-sm"><span className="text-amber-500">★★★★★</span><span className="text-grafite-500">{produto.reviews.length ? `${produto.reviews.length} avaliações` : "Novo produto"}</span></div><div className="mt-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-black/45">Preço de revenda</p><p className="mt-2 text-3xl font-bold"><PrecoProtegido valor={Number(produto.precoPromocional ?? produto.precoProfissional ?? produto.preco)} visivel={precosVisiveis} /></p>{precosVisiveis && produto.precoPromocional && <p className="mt-1 text-sm text-black/45 line-through"><PrecoProtegido valor={Number(produto.precoProfissional ?? produto.preco)} visivel /></p>}</div><p className="mt-7 whitespace-pre-line text-lg leading-8 text-grafite-500">{produto.descricao}</p>
        <div className="my-7 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-2xl bg-calcario-100 p-3"><b className="block text-sm text-grafite-900">{precosVisiveis ? `${produto.stock} un.` : "Reservado"}</b>Stock disponível</div><div className="rounded-2xl bg-calcario-100 p-3"><b className="block text-sm text-grafite-900">{precosVisiveis ? (produto.prazoEntrega || (produto.stock>0?"2–5 dias":"Sob consulta")) : "Após validação"}</b>Prazo previsto</div><div className="rounded-2xl bg-calcario-100 p-3"><b className="block text-sm text-grafite-900">Seguro</b>Pagamento</div></div>
        {precosVisiveis ? <BotaoAdicionarCarrinho produtoId={produto.id}/> : <div className="login-gate"><b>Consulte preços e encomende online</b><p>Crie a sua conta gratuita ou entre para consultar o preço e adicionar este artigo ao carrinho.</p><div><Link href="/entrar" className="btn-primary">Entrar</Link><Link href="/registo" className="btn-secondary">Criar conta</Link></div></div>}
        <div className="mt-5 grid gap-3"><details className="product-detail" open><summary>Características e materiais</summary><div>{produto.material&&<p><b>Material:</b> {produto.material}</p>}<p><b>Referência:</b> {produto.sku}</p></div></details><details className="product-detail"><summary>Medidas</summary><div>{produto.largura_cm ? `${produto.largura_cm} cm (L) × ${produto.altura_cm ?? "—"} cm (A) × ${produto.profundidade_cm ?? "—"} cm (P)` : "Medidas a confirmar com a equipa."}</div></details><details className="product-detail"><summary>Entrega e levantamento</summary><div><p>Disponível para levantamento, entrega própria em zonas elegíveis ou envio por transportadora.</p>{precosVisiveis && <p className="mt-2"><b>Prazo previsto:</b> {produto.prazoEntrega || (produto.stock>0?"2 a 5 dias úteis":"A confirmar")}</p>}</div></details><details className="product-detail"><summary>Ficha técnica</summary><div>{precosVisiveis ? (produto.fichaTecnicaUrl ? <a href={produto.fichaTecnicaUrl} target="_blank" rel="noreferrer" className="font-bold underline">Consultar ficha técnica</a> : "Ficha técnica em preparação.") : "Disponível após validação da conta."}</div></details><details className="product-detail"><summary>Cuidados e garantia</summary><div>Conserve a documentação da compra e siga as instruções específicas de limpeza e montagem fornecidas com o produto.</div></details></div>
        <div className="mt-8"><p className="mb-3 text-xs font-bold uppercase tracking-wider text-grafite-500">Partilhar</p><ProductShare titulo={produto.nome}/></div>
      </div>
    </div>
    {relacionadas.length>0&&<section className="py-20"><p className="eyebrow">Complete o ambiente</p><h2 className="mt-3 font-display text-4xl font-bold">Também pode gostar</h2><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{relacionadas.map(p=><Link href={`/produtos/${p.slug}`} key={p.id} className="product-card group"><div className="product-image">{p.imagens[0]?<img src={p.imagens[0]} alt={p.nome}/>:null}</div><h3 className="mt-4 font-display text-lg font-bold">{p.nome}</h3><p className="mt-2 font-bold"><PrecoProtegido valor={Number(p.preco)} visivel={precosVisiveis} compacto /></p></Link>)}</div></section>}
  </div>;
}
