import type { Metadata } from "next";
import Link from "next/link";
import { divisoesCatalogo } from "@/lib/divisoes";

export const metadata: Metadata = {
  title: "Divisões",
  description: "Descubra mobiliário por divisão: sala, quarto, escritório, jardim, cozinha e muito mais.",
};

export default function DivisoesPage() {
  return (
    <div className="container-site py-14 sm:py-20">
      <div className="max-w-3xl">
        <p className="eyebrow">Comprar por ambiente</p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-[-.05em] sm:text-6xl">Todas as divisões da casa</h1>
        <p className="mt-5 text-lg leading-8 text-grafite-500">Escolha uma divisão para ver as respetivas categorias e produtos. Esta estrutura cresce sem tornar a página inicial pesada.</p>
      </div>
      <div className="division-index mt-12">
        {divisoesCatalogo.map((divisao) => (
          <Link key={divisao.slug} href={`/divisoes/${divisao.slug}`} className="room-card group">
            <img src={divisao.imagem} alt={`Ambiente de ${divisao.nome}`} loading="lazy" />
            <div className="room-overlay" />
            <div className="room-copy">
              <p>{divisao.frase}</p>
              <h2>{divisao.nome}</h2>
              <span>{divisao.subdivisoes.length} categorias · Explorar →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
