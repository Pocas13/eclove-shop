import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatarEuros } from "@/lib/precos";
import FormularioCheckout from "@/components/FormularioCheckout";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/entrar");

  const itens = await prisma.carrinhoItem.findMany({
    where: { userId: (session.user as any).id },
    include: { produto: true },
  });

  if (itens.length === 0) redirect("/carrinho");

  const total = itens.reduce((soma, item) => soma + Number(item.produto.precoProfissional) * item.quantidade, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        <h1 className="font-display text-3xl mb-6">Finalizar Compra</h1>
        <FormularioCheckout />
      </div>
      <div className="border border-linho-300 rounded-lg p-5 bg-white h-fit">
        <h2 className="font-display text-xl mb-4">Resumo</h2>
        {itens.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-1">
            <span>
              {item.quantidade}× {item.produto.nome}
            </span>
            <span>{formatarEuros(Number(item.produto.precoProfissional) * item.quantidade)}</span>
          </div>
        ))}
        <div className="flex justify-between font-semibold mt-4 pt-4 border-t border-linho-100">
          <span>Total</span>
          <span>{formatarEuros(total)}</span>
        </div>
      </div>
    </div>
  );
}
