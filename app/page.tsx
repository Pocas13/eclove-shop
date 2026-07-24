import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { contaAprovada } from "@/lib/acesso";
import { prisma } from "@/lib/prisma";
import PrecoProtegido from "@/components/PrecoProtegido";
import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import { divisoesCatalogo } from "@/lib/divisoes";

export const dynamic = "force-dynamic";

const divisoes = divisoesCatalogo.slice(0, 8);

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const precosVisiveis = contaAprovada(session);
  const produtos = await prisma.produto.findMany({ where: { ativo: true }, include: { categoria: true }, orderBy: { createdAt: "desc" }, take: 8 });
  return <>
    <section className="container-site pt-5 sm:pt-8"><div className="hero-modern">
      <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=88" alt="Ambiente contemporâneo Eclove" className="absolute inset-0 h-full w-full object-cover"/>
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/35 to-transparent"/>
      <div className="relative z-10 flex min-h-[640px] max-w-2xl flex-col justify-center px-7 py-16 sm:px-14 lg:px-20">
        <span className="inline-flex w-fit rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.2em] text-white backdrop-blur">Eclove · showroom profissional</span>
        <h1 className="mt-6 font-display text-5xl font-bold leading-[.96] tracking-[-.06em] text-white sm:text-7xl">Coleções pensadas para vender, especificar e criar.</h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-white/80">Um showroom digital reservado a clientes validados, com preço de revenda, stock, prazos e ferramentas para cada projeto.</p>
        <div className="mt-9 flex flex-wrap gap-3"><Link href="/novidades" className="rounded-full bg-barro-500 px-7 py-4 text-sm font-bold text-white hover:bg-barro-400">Ver novidades</Link><Link href="/divisoes" className="rounded-full border border-white/40 bg-white/5 px-7 py-4 text-sm font-bold text-white backdrop-blur hover:bg-white hover:text-grafite-900">Comprar por divisão</Link></div>
      </div>
    </div></section>

    <section className="container-site -mt-5 relative z-20"><div className="trust-strip">
      {["Entrega acompanhada|Escolha levantamento, entrega própria ou transportadora", "Compra protegida|Cartão, MB WAY e Multibanco", "Apoio especializado|Ajuda em medidas, materiais e montagem", "Faturação integrada|Documentos e sincronização preparados para Sage"].map(item=>{const [t,d]=item.split("|");return <div key={t} className="trust-item"><span className="trust-check">✓</span><div><b>{t}</b><p>{d}</p></div></div>})}
    </div></section>

    <section id="divisoes" className="container-site py-20"><div className="section-heading"><div><p className="eyebrow">Comece pela divisão</p><h2>Encontre o ambiente certo</h2></div><p>Uma forma mais intuitiva de descobrir móveis que combinam entre si.</p></div>
      <div className="rooms-mosaic mt-10">{divisoes.map(d=><Link key={d.nome} href={`/divisoes/${d.slug}`} className="room-card group"><img src={d.imagem} alt={d.nome} loading="lazy"/><div className="room-overlay"/><div className="room-copy"><p>{d.frase}</p><h3>{d.nome}</h3><span>Explorar →</span></div></Link>)}</div><div className="mt-8 text-center"><Link href="/divisoes" className="btn-secondary">Ver todas as divisões</Link></div>
    </section>

    <section className="container-site"><div className="grid overflow-hidden rounded-[2rem] bg-folha-700 text-white lg:grid-cols-[.9fr_1.1fr]"><div className="p-8 sm:p-14"><p className="text-xs font-bold uppercase tracking-[.22em] text-white/60">Escolher sem dúvidas</p><h2 className="mt-4 font-display text-4xl font-bold tracking-[-.04em] sm:text-5xl">Meça, compare e decida com confiança.</h2><p className="mt-5 max-w-lg leading-7 text-white/75">Em cada produto encontra medidas, materiais, disponibilidade e opções de entrega. A nossa equipa ajuda antes e depois da compra.</p><Link href="/produtos" className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-grafite-900">Descobrir produtos</Link></div><img src="/ambientes/medidas.svg" alt="Detalhe de mobiliário e medidas" className="min-h-80 h-full w-full object-cover"/></div></section>

    <section id="novidades" className="container-site py-20"><div className="section-heading"><div><p className="eyebrow">Coleção Eclove</p><h2>Novidades para viver melhor</h2></div><p>Peças com qualidade, presença e condições próprias para cada tipo de cliente.</p></div>
      {produtos.length===0?<div className="mt-10 rounded-3xl bg-calcario-100 p-10 text-center text-grafite-500">Ainda não há produtos publicados.</div>:<div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">{produtos.map(produto=><Link key={produto.id} href={`/produtos/${produto.slug}`} className="product-card group"><div className="product-image">{produto.imagens[0]?<img src={produto.imagens[0]} alt={produto.nome} loading="lazy"/>:<div className="grid h-full place-items-center text-sm text-grafite-500">Imagem em preparação</div>}<span className="product-badge">Novo</span><span className="product-favorite">♡</span></div><div className="pt-4"><p className="text-xs font-bold uppercase tracking-wider text-barro-600">{produto.categoria.nome}</p><h3 className="mt-1 font-display text-xl font-bold">{produto.nome}</h3><p className="mt-2 text-sm text-grafite-500">{produto.stock>0?"Disponível":"Sob encomenda"}</p><div className="mt-4 flex items-center justify-between"><p className="text-lg font-bold"><PrecoProtegido valor={Number(produto.preco)} visivel={precosVisiveis} /></p><span className="product-arrow">→</span></div></div></Link>)}</div>}
    <div className="mt-10 text-center"><Link href="/novidades" className="btn-secondary">Ver todas as novidades</Link></div></section>

    <section className="container-site pb-8"><div className="grid gap-5 md:grid-cols-3"><article className="editorial-card"><span>01</span><h3>Como medir o espaço</h3><p>Portas, corredores e zonas de passagem: o essencial antes de encomendar.</p></article><article className="editorial-card"><span>02</span><h3>Materiais e manutenção</h3><p>Escolha acabamentos adequados ao uso diário e prolongue a vida do móvel.</p></article><article className="editorial-card"><span>03</span><h3>Entrega e montagem</h3><p>Conheça as opções disponíveis e prepare a casa para receber a encomenda.</p></article></div></section>

    <section id="inspiracao" className="container-site py-16"><div className="grid overflow-hidden rounded-[2rem] bg-barro-500 text-white lg:grid-cols-2"><div className="p-8 sm:p-14"><p className="text-xs font-bold uppercase tracking-[.22em] text-white/65">Novidades e vantagens</p><h2 className="mt-4 max-w-lg font-display text-4xl font-bold tracking-[-.04em] sm:text-5xl">Inspiração que chega à sua caixa de entrada.</h2><p className="mt-5 max-w-lg text-white/75">Receba novas coleções, ideias para cada divisão e campanhas selecionadas.</p><NewsletterForm/></div><img src="/ambientes/newsletter.svg" alt="Ambiente decorado" className="h-full min-h-80 w-full object-cover"/></div></section>
  </>;
}
