import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatarEuros } from "@/lib/precos";
import FormularioCheckout from "@/components/FormularioCheckout";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/entrar?callbackUrl=/checkout");
  const userId = (session.user as { id: string }).id;
  const [itens, cliente] = await Promise.all([
    prisma.carrinhoItem.findMany({ where: { userId }, include: { produto: true } }),
    prisma.user.findUnique({ where: { id: userId }, include: { enderecos: { orderBy: { principal: "desc" }, take: 1 } } }),
  ]);
  if (itens.length === 0) redirect("/carrinho");
  if (!cliente) redirect("/entrar");
  const subtotal = itens.reduce((soma, item) => soma + Number(item.produto.preco) * item.quantidade, 0);
  const endereco = cliente.enderecos[0];
  return <div className="container-site py-10 sm:py-16">
    <div className="mb-10"><p className="eyebrow">Checkout seguro</p><h1 className="mt-3 font-display text-4xl font-bold tracking-[-.04em] sm:text-5xl">Finalizar compra</h1><p className="mt-3 text-grafite-500">Confirme os seus dados, escolha a entrega e avance para o pagamento.</p></div>
    <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
      <FormularioCheckout cliente={{ nome: cliente.nome, email: cliente.email, telefone: cliente.telefone ?? "", nif: cliente.nif ?? "", rua: endereco?.linha1 ?? "", numeroPorta: endereco?.numeroPorta ?? "", andar: endereco?.andar ?? "", ladoPorta: endereco?.ladoPorta ?? "", codigoPostal: endereco?.codigoPostal ?? "", cidade: endereco?.cidade ?? "" }} />
      <aside className="sticky top-28 rounded-[2rem] border border-calcario-200 bg-white p-6 shadow-soft">
        <h2 className="font-display text-2xl font-bold">Resumo da encomenda</h2>
        <div className="mt-5 divide-y divide-calcario-200">{itens.map(item=><div key={item.id} className="flex gap-4 py-4"><div className="h-20 w-16 overflow-hidden rounded-xl bg-calcario-100">{item.produto.imagens[0]&&<img src={item.produto.imagens[0]} alt="" className="h-full w-full object-cover"/>}</div><div className="min-w-0 flex-1"><p className="font-semibold">{item.produto.nome}</p><p className="mt-1 text-sm text-grafite-500">Quantidade: {item.quantidade}</p></div><p className="font-semibold">{formatarEuros(Number(item.produto.preco)*item.quantidade)}</p></div>)}</div>
        <div className="mt-5 space-y-3 border-t border-calcario-200 pt-5 text-sm"><div className="flex justify-between"><span>Subtotal</span><b>{formatarEuros(subtotal)}</b></div><div className="flex justify-between text-grafite-500"><span>Entrega</span><span>Calculada conforme opção</span></div><div className="flex justify-between border-t border-calcario-200 pt-4 text-lg"><b>Total</b><b>A partir de {formatarEuros(subtotal)}</b></div></div>
        <div className="mt-6 grid gap-2 rounded-2xl bg-calcario-100 p-4 text-xs text-grafite-700"><p>🔒 Pagamento processado em ambiente seguro</p><p>✓ Fatura emitida após cobrança</p><p>✓ Apoio durante toda a encomenda</p></div>
      </aside>
    </div>
  </div>;
}
