import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { visibilidadePreco, formatarEuros } from "@/lib/precos";
import { notFound } from "next/navigation";
import Link from "next/link";
import BotaoAdicionarCarrinho from "@/components/BotaoAdicionarCarrinho";

export default async function ProdutoPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  const produto = await prisma.produto.findUnique({
    where: { slug: params.id },
    include: { categoria: true },
  });

  if (!produto || !produto.ativo) notFound();

  const preco = visibilidadePreco(produto, role);
  const ehProfissional = role === "PROFISSIONAL" || role === "ADMIN";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="aspect-square bg-linho-100 rounded-lg overflow-hidden flex items-center justify-center text-linho-300">
        {produto.imagens[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={produto.imagens[0]} alt={produto.nome} className="w-full h-full object-cover" />
        ) : (
          <span>Sem imagem</span>
        )}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-tinta-500">{produto.categoria.nome}</p>
        <h1 className="font-display text-3xl mb-4">{produto.nome}</h1>
        {preco.tipo === "profissional" ? (
          <p className="text-2xl font-semibold mb-4">{formatarEuros(preco.valor)}</p>
        ) : (
          <p className="text-lg font-semibold mb-1 text-tinta-500">Preço sob consulta</p>
        )}
        <p className="text-tinta-700 mb-6 whitespace-pre-line">{produto.descricao}</p>

        <dl className="grid grid-cols-2 gap-y-1 text-sm text-tinta-500 mb-8">
          {produto.material && (
            <>
              <dt>Material</dt>
              <dd>{produto.material}</dd>
            </>
          )}
          {produto.largura_cm && (
            <>
              <dt>Dimensões (L×A×P)</dt>
              <dd>
                {produto.largura_cm}×{produto.altura_cm}×{produto.profundidade_cm} cm
              </dd>
            </>
          )}
          <dt>Stock disponível</dt>
          <dd>{produto.stock} unidades</dd>
        </dl>

        {ehProfissional ? (
          <BotaoAdicionarCarrinho produtoId={produto.id} />
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/registo-profissional"
              className="bg-garrafa-700 text-white px-6 py-3 rounded-md text-center hover:bg-garrafa-600 transition-colors"
            >
              Pedir conta profissional
            </Link>
            <Link
              href="/contacto"
              className="border border-garrafa-700 text-tinta-900 px-6 py-3 rounded-md text-center hover:bg-linho-100 transition-colors"
            >
              Pedir orçamento
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
