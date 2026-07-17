import { prisma } from "@/lib/prisma";
import AcoesProfissional from "@/components/AcoesProfissional";

export default async function AdminProfissionaisPage() {
  const pendentes = await prisma.user.findMany({
    where: { role: "PROFISSIONAL", profissionalEstado: "PENDENTE" },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Aprovação de Profissionais</h1>

      {pendentes.length === 0 ? (
        <p className="text-tinta-500">Não há pedidos pendentes.</p>
      ) : (
        <div className="space-y-4">
          {pendentes.map((p) => (
            <div key={p.id} className="border border-linho-300 rounded-lg bg-white p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{p.nome}</p>
                <p className="text-sm text-tinta-500">{p.email}</p>
                <p className="text-sm text-tinta-500">
                  {p.empresaNome} · NIF {p.nif}
                </p>
                <p className="text-xs text-tinta-500">{p.moradaFiscal}</p>
              </div>
              <AcoesProfissional userId={p.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
