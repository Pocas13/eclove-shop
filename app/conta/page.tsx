import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatarEuros } from "@/lib/precos";
import { redirect } from "next/navigation";
import BotaoReencomendar from "@/components/BotaoReencomendar";

export const dynamic = "force-dynamic";

const ESTADO_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  PAGA: "Paga",
  EM_PREPARACAO: "Em preparação",
  ENVIADA: "Enviada",
  ENTREGUE: "Entregue",
  CANCELADA: "Cancelada",
};

export default async function ContaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/entrar");

  const userId = (session.user as any).id;

  const [user, encomendas] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.encomenda.findMany({
      where: { userId },
      include: { itens: { include: { produto: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalGasto = encomendas
    .filter((e) => e.estado !== "CANCELADA")
    .reduce((soma, e) => soma + Number(e.total), 0);

  return (
    <div>
      <h1 className="font-display text-3xl text-tinta-900 mb-2">A Minha Conta</h1>
      <p className="text-tinta-500 mb-8">
        {user?.nome} · {user?.email}
      </p>

      {encomendas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="border border-areia-300 rounded-lg bg-white p-5">
            <p className="text-2xl font-display text-tinta-900">{encomendas.length}</p>
            <p className="text-sm text-tinta-500">Encomendas totais</p>
          </div>
          <div className="border border-areia-300 rounded-lg bg-white p-5">
            <p className="text-2xl font-display text-tinta-900">{formatarEuros(totalGasto)}</p>
            <p className="text-sm text-tinta-500">Total investido</p>
          </div>
        </div>
      )}

      <h2 className="font-display text-xl text-tinta-900 mb-4">As minhas encomendas</h2>

      {encomendas.length === 0 ? (
        <p className="text-tinta-500">Ainda não tens encomendas.</p>
      ) : (
        <div className="space-y-4">
          {encomendas.map((enc) => (
            <div key={enc.id} className="border border-areia-300 rounded-lg bg-white p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium text-tinta-900">{enc.numero}</p>
                <span className="text-xs uppercase bg-areia-100 px-2 py-1 rounded">
                  {ESTADO_LABEL[enc.estado] ?? enc.estado}
                </span>
              </div>
              <p className="text-sm text-tinta-500 mb-2">
                {enc.createdAt.toLocaleDateString("pt-PT")} · {formatarEuros(Number(enc.total))}
              </p>
              <ul className="text-sm text-tinta-700 mb-3">
                {enc.itens.map((item) => (
                  <li key={item.id}>
                    {item.quantidade}× {item.produto.nome}
                  </li>
                ))}
              </ul>
              <BotaoReencomendar encomendaId={enc.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
