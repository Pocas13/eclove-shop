import { prisma } from "@/lib/prisma";
import { formatarEuros } from "@/lib/precos";
import Link from "next/link";

export default async function AdminProdutosPage() {
  const produtos = await prisma.produto.findMany({
    include: { categoria: { include: { parent: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-tinta-900">Produtos</h1>
        <Link href="/admin/produtos/novo" className="bg-garrafa-700 text-white px-4 py-2 rounded-md text-sm hover:bg-garrafa-600 transition-colors">
          + Novo produto
        </Link>
      </div>
      <table className="w-full text-sm bg-white border border-linho-300 rounded-lg overflow-hidden">
        <thead className="bg-linho-100 text-left">
          <tr>
            <th className="p-3">Nome</th>
            <th className="p-3">Categoria</th>
            <th className="p-3">Preço retalho</th>
            <th className="p-3">Preço profissional</th>
            <th className="p-3">Stock</th>
            <th className="p-3">Estado</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((p) => (
            <tr key={p.id} className="border-t border-linho-100">
              <td className="p-3 text-tinta-900">{p.nome}</td>
              <td className="p-3 text-tinta-500">
                {p.categoria.parent ? `${p.categoria.parent.nome} > ${p.categoria.nome}` : p.categoria.nome}
              </td>
              <td className="p-3">{formatarEuros(Number(p.precoRetalho))}</td>
              <td className="p-3">{formatarEuros(Number(p.precoProfissional))}</td>
              <td className="p-3">{p.stock}</td>
              <td className="p-3">
                <span className={p.ativo ? "text-garrafa-700" : "text-red-600"}>
                  {p.ativo ? "Ativo" : "Inativo"}
                </span>
              </td>
              <td className="p-3 text-right">
                <Link href={`/admin/produtos/${p.id}/editar`} className="text-garrafa-700 underline">
                  Editar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
