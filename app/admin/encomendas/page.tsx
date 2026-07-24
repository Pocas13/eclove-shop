import { prisma } from "@/lib/prisma";
import { formatarEuros } from "@/lib/precos";
import SeletorEstadoEncomenda from "@/components/SeletorEstadoEncomenda";

export const dynamic = "force-dynamic";

export default async function AdminEncomendasPage() {
  const encomendas = await prisma.encomenda.findMany({
    include: { user: true, itens: { include: { produto: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Encomendas</h1>

      {encomendas.length === 0 ? (
        <p className="text-tinta-500">Ainda não há encomendas.</p>
      ) : (
        <div className="space-y-4">
          {encomendas.map((enc) => (
            <div key={enc.id} className="border border-areia-300 rounded-lg bg-white p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{enc.numero}</p>
                  <p className="text-sm text-tinta-500">
                    {enc.user.nome} · {enc.user.email} · {enc.user.empresaNome ?? "—"}
                  </p>
                  <p className="text-sm text-tinta-500">
                    {enc.createdAt.toLocaleDateString("pt-PT")} · {formatarEuros(Number(enc.total))} · {enc.metodoEntrega === "LEVANTAMENTO" ? "Levantamento" : enc.metodoEntrega === "ENTREGA_LOJA" ? "Entrega própria" : "Transportadora"}
                  </p>
                </div>
                <SeletorEstadoEncomenda id={enc.id} estadoAtual={enc.estado} />
              </div>
              <ul className="text-sm text-tinta-700">
                {enc.itens.map((item) => (
                  <li key={item.id}>
                    {item.quantidade}× {item.produto.nome} — {formatarEuros(Number(item.precoUnitario) * item.quantidade)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
