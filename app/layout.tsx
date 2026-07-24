import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Providers from "./providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NavSessao from "@/components/NavSessao";
import BrandMark from "@/components/BrandMark";
import MenuLateral from "@/components/MenuLateral";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3002"), title:{default:"Eclove | Showroom profissional",template:"%s | Eclove"}, description:"Showroom digital de mobiliário para revenda e projetos profissionais." };
export default async function RootLayout({children}:{children:React.ReactNode}){const session=await getServerSession(authOptions);return <html lang="pt"><body><Providers>
<header className="eclove-header"><div className="container-site eclove-header-inner"><MenuLateral/><Link href="/" className="eclove-logo"><BrandMark/></Link><div className="eclove-actions"><Link href="/produtos">Pesquisa</Link><Link href="/catalogos">Catálogos</Link><NavSessao session={session}/><Link href="/carrinho" className="bag-link">Carrinho</Link></div></div></header>
<main>{children}</main>
<section className="professional-band"><div className="container-site"><div><span>ACESSO RESERVADO</span><h2>Uma plataforma comercial, não apenas uma loja.</h2></div><p>Preços de revenda, disponibilidade, prazos, catálogos, listas de projeto e histórico de encomendas após validação.</p><Link href="/registo">Pedir acesso →</Link></div></section>
<footer className="eclove-footer"><div className="container-site footer-grid"><div><BrandMark inverse/><p>Showroom digital de mobiliário para revenda, projetos e profissionais.</p></div><div><b>Explorar</b><Link href="/produtos">Coleção</Link><Link href="/divisoes">Ambientes</Link><Link href="/novidades">Novidades</Link></div><div><b>Área reservada</b><Link href="/conta">Conta</Link><Link href="/catalogos">Catálogos</Link><Link href="/conta/listas">Listas de projeto</Link></div><div><b>Apoio</b><Link href="/entregas">Entregas</Link><Link href="/trocas-e-devolucoes">Devoluções</Link><span>geral@eclove.pt</span></div></div><div className="container-site footer-bottom">© {new Date().getFullYear()} Eclove <span>Portugal · EUR · PT</span><span><Link href="/privacidade">Privacidade</Link> · <Link href="/termos-e-condicoes">Termos</Link></span></div></footer>
</Providers></body></html>}
