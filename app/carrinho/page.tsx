import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatarEuros } from "@/lib/precos";
import LinhaCarrinho from "@/components/LinhaCarrinho";
import Link from "next/link";

export default async function CarrinhoPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <div>
        <h1 className="font-display text-3xl mb-4">Carrinho</h1>
        <p className="text-tinta-500">
          <Link href="/entrar" className="underline">
            Entra na tua conta
          </Link>{" "}
          para veres o teu carrinho.
        </p>
      </div>
    );
  }

  const role = (session.user as any).role;
  if (role !== "PROFISSIONAL" && role !== "ADMIN") {
    return (
      <div>
        <h1 className="font-display text-3xl mb-4">Carrinho</h1>
        <p className="text-tinta-500">
          A compra online está disponível apenas para contas profissionais.{" "}
          <Link href="/contacto" className="underline">
            Pede um orçamento
          </Link>{" "}
          ou{" "}
          <Link href="/registo-profissional" className="underline">
            pede uma conta profissional
          </Link>
          .
        </p>
      </div>
    );
  }

  const itens = await prisma.carrinhoItem.findMany({
    where: { userId: (session.user as any).id },
    include: { produto: true },
  });

  const total = itens.reduce((soma, item) => soma + Number(item.produto.precoProfissional) * item.quantidade, 0);

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Carrinho</h1>

      {itens.length === 0 ? (
        <p className="text-tinta-500">
          O teu carrinho está vazio.{" "}
          <Link href="/" className="underline">
            Ver catálogo
          </Link>
          .
        </p>
      ) : (
        <>
          <div className="divide-y divide-linho-100 border border-linho-300 rounded-lg bg-white">
            {itens.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{item.produto.nome}</p>
                  <p className="text-sm text-tinta-500">
                    {formatarEuros(Number(item.produto.precoProfissional))} / unidade
                    {item.produto.quantidadeMinimaB2B > 1 && ` · qtd. mínima ${item.produto.quantidadeMinimaB2B}`}
                  </p>
                </div>
                <LinhaCarrinho produtoId={item.produtoId} quantidadeInicial={item.quantidade} />
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-xl font-semibold">Total: {formatarEuros(total)}</p>
            <Link href="/checkout" className="bg-garrafa-700 text-white px-6 py-3 rounded-md">
              Finalizar compra
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
