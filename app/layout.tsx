import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Providers from "./providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NavSessao from "@/components/NavSessao";

export const metadata: Metadata = {
  title: "Eclove — Sofás e Mobiliário de Alta Qualidade",
  description:
    "Eclove: mais de 30 anos a inovar na qualidade e requinte de sofás e mobiliário. Loja para clientes finais e revenda a profissionais.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="pt">
      <body>
        <Providers>
          <header className="bg-linho-50">
            <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-5">
              <Link href="/" className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/marca/logotipo.png" alt="Eclove" className="h-8 w-auto" />
              </Link>
              <div className="flex items-center gap-7 text-sm text-tinta-700">
                <Link href="/" className="hover:text-garrafa-700 transition-colors">Catálogo</Link>
                <Link href="/registo-profissional" className="hover:text-garrafa-700 transition-colors">Sou Profissional</Link>
                <Link href="/carrinho" className="hover:text-garrafa-700 transition-colors">Carrinho</Link>
                <NavSessao session={session} />
              </div>
            </nav>
            <div className="h-px bg-gradient-to-r from-transparent via-latao-500 to-transparent" />
          </header>
          <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
          <footer className="mt-24 border-t border-linho-300 py-10">
            <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between gap-6 text-sm text-tinta-500">
              <div>
                <p className="font-display italic text-xl text-tinta-900 mb-1">Eclove</p>
                <p>Inovamos há mais de 30 anos na qualidade e requinte.</p>
              </div>
              <div>
                <p>Rua da Estrada Nova, 1270, Letra B, R/C</p>
                <p>3885-456 Esmoriz</p>
              </div>
              <div>
                <p>256 754 289</p>
                <p>eclovemoveis@eclove.pt</p>
              </div>
            </div>
            <p className="text-center text-xs text-tinta-500 mt-8">© {new Date().getFullYear()} Eclove</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
