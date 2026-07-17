import { prisma } from "@/lib/prisma";
import { formatarEuros } from "@/lib/precos";
import Link from "next/link";

const ESTADO_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  PAGA: "Paga",
  EM_PREPARACAO: "Em preparação",
  ENVIADA: "Enviada",
  ENTREGUE: "Entregue",
  CANCELADA: "Cancelada",
};

export default async function AdminDashboard() {
  const [
    totalProdutos,
    totalEncomendas,
    encomendasPendentes,
    profissionaisPendentes,
    vendasAgregadas,
    ultimasEncomendas,
    produtosStockBaixo,
  ] = await Promise.all([
    prisma.produto.count({ where: { ativo: true } }),
    prisma.encomenda.count(),
    prisma.encomenda.count({ where: { estado: { in: ["PENDENTE", "PAGA"] } } }),
    prisma.user.count({ where: { role: "PROFISSIONAL", profissionalEstado: "PENDENTE" } }),
    prisma.encomenda.aggregate({ _sum: { total: true }, where: { estado: { not: "CANCELADA" } } }),
    prisma.encomenda.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    prisma.produto.findMany({
      where: { ativo: true, stock: { lt: 5 } },
      orderBy: { stock: "asc" },
      take: 5,
    }),
  ]);

  const cartoes = [
    { label: "Produtos ativos", valor: totalProdutos, href: "/admin/produtos" },
    { label: "Encomendas totais", valor: totalEncomendas, href: "/admin/encomendas" },
    { label: "Por processar", valor: encomendasPendentes, href: "/admin/encomendas", destaque: encomendasPendentes > 0 },
    { label: "Profissionais a aprovar", valor: profissionaisPendentes, href: "/admin/profissionais", destaque: profissionaisPendentes > 0 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-tinta-900">Painel de Gestão</h1>
        <Link href="/admin/produtos/novo" className="bg-garrafa-700 text-white px-4 py-2 rounded-md text-sm hover:bg-garrafa-600 transition-colors">
          + Novo produto
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {cartoes.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`border rounded-lg p-5 bg-white hover:border-latao-500 transition-colors ${
              c.destaque ? "border-latao-500" : "border-linho-300"
            }`}
          >
            <p className="text-3xl font-display text-tinta-900">{c.valor}</p>
            <p className="text-sm text-tinta-500">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="border border-linho-300 rounded-lg p-5 bg-white inline-block mb-10">
        <p className="text-sm text-tinta-500 mb-1">Faturação total (não cancelada)</p>
        <p className="text-2xl font-display text-tinta-900">{formatarEuros(Number(vendasAgregadas._sum.total ?? 0))}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl text-tinta-900">Últimas encomendas</h2>
            <Link href="/admin/encomendas" className="text-sm text-garrafa-700 underline">Ver todas</Link>
          </div>
          {ultimasEncomendas.length === 0 ? (
            <p className="text-sm text-tinta-500">Ainda não há encomendas.</p>
          ) : (
            <div className="border border-linho-300 rounded-lg bg-white divide-y divide-linho-100">
              {ultimasEncomendas.map((enc) => (
                <div key={enc.id} className="p-4 flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-tinta-900">{enc.numero}</p>
                    <p className="text-tinta-500">{enc.user.nome}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatarEuros(Number(enc.total))}</p>
                    <p className="text-xs uppercase text-tinta-500">{ESTADO_LABEL[enc.estado] ?? enc.estado}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl text-tinta-900">Stock baixo</h2>
            <Link href="/admin/produtos" className="text-sm text-garrafa-700 underline">Ver produtos</Link>
          </div>
          {produtosStockBaixo.length === 0 ? (
            <p className="text-sm text-tinta-500">Sem alertas de stock no momento.</p>
          ) : (
            <div className="border border-linho-300 rounded-lg bg-white divide-y divide-linho-100">
              {produtosStockBaixo.map((p) => (
                <div key={p.id} className="p-4 flex justify-between items-center text-sm">
                  <p className="text-tinta-900">{p.nome}</p>
                  <p className={`font-medium ${p.stock === 0 ? "text-red-600" : "text-latao-600"}`}>
                    {p.stock} un.
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
