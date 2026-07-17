import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { visibilidadePreco, formatarEuros } from "@/lib/precos";
import Link from "next/link";

export default async function CatalogoPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const ehProfissional = role === "PROFISSIONAL";

  const produtos = await prisma.produto.findMany({
    where: { ativo: true },
    include: { categoria: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      {/* HERO — imagem genérica de exemplo; troca por foto real em public/marca/hero-1.jpg quando a tiveres */}
      <section
        className="relative rounded-lg overflow-hidden bg-linho-200 mb-16 bg-cover bg-center"
        style={{ backgroundImage: "url('/placeholders/hero.svg')" }}
      >
        <div className="relative px-8 py-20 sm:py-28 max-w-2xl bg-linho-50/70 backdrop-blur-[2px]">
          <p className="uppercase tracking-[0.2em] text-xs text-latao-600 mb-4">Desde há mais de 30 anos</p>
          <h1 className="font-display italic text-4xl sm:text-5xl text-tinta-900 leading-tight mb-5">
            Alta qualidade em<br />sofás e mobiliário
          </h1>
          <p className="text-tinta-700 mb-8 max-w-md">
            A Eclove inova há mais de três décadas na qualidade e no requinte — para a tua casa e,
            em condições exclusivas, para o teu negócio.
          </p>
          <div className="flex gap-4">
            <a href="#catalogo" className="bg-garrafa-700 text-white px-6 py-3 rounded-md hover:bg-garrafa-600 transition-colors">
              Ver catálogo
            </a>
            {!ehProfissional && (
              <Link href="/registo-profissional" className="border border-garrafa-700 text-garrafa-700 px-6 py-3 rounded-md hover:bg-linho-100 transition-colors">
                Sou profissional
              </Link>
            )}
          </div>
        </div>
      </section>

      <div id="catalogo" className="mb-10">
        <p className="uppercase tracking-[0.2em] text-xs text-latao-600 mb-2">Catálogo</p>
        <h2 className="font-display text-3xl text-tinta-900 mb-2">As nossas peças</h2>
        <p className="text-tinta-500">
          {ehProfissional ? (
            "Preços profissionais aplicados à tua conta."
          ) : (
            <>
              Preços disponíveis para contas profissionais aprovadas. Para clientes finais, os preços
              ficam sob consulta —{" "}
              <Link href="/registo-profissional" className="underline">
                pede uma conta profissional
              </Link>{" "}
              ou{" "}
              <Link href="/contacto" className="underline">
                pede um orçamento
              </Link>
              .
            </>
          )}
        </p>
      </div>

      {produtos.length === 0 ? (
        <p className="text-tinta-500">Ainda não há produtos no catálogo.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {produtos.map((produto) => (
            <Link
              key={produto.id}
              href={`/produtos/${produto.slug}`}
              className="group border border-linho-300 rounded-sm overflow-hidden bg-white hover:border-latao-500 transition-colors"
            >
              <div className="aspect-square bg-linho-100 flex items-center justify-center text-linho-300 overflow-hidden">
                {produto.imagens[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={produto.imagens[0]}
                    alt={produto.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-xs">Sem imagem</span>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs uppercase tracking-wide text-tinta-500">{produto.categoria.nome}</p>
                <h2 className="font-display text-lg text-tinta-900">{produto.nome}</h2>
                {(() => {
                  const preco = visibilidadePreco(produto, role);
                  return preco.tipo === "profissional" ? (
                    <p className="mt-2 font-semibold">{formatarEuros(preco.valor)}</p>
                  ) : (
                    <p className="mt-2 font-semibold text-tinta-500">Preço sob consulta</p>
                  );
                })()}
                {ehProfissional && produto.quantidadeMinimaB2B > 1 && (
                  <p className="text-xs text-tinta-500">Qtd. mínima: {produto.quantidadeMinimaB2B}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
