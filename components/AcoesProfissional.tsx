"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AcoesProfissional({ userId }: { userId: string }) {
  const router = useRouter();
  const [aEnviar, setAEnviar] = useState(false);

  async function decidir(decisao: "APROVADO" | "REJEITADO") {
    setAEnviar(true);
    await fetch("/api/admin/profissionais", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, decisao }),
    });
    setAEnviar(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => decidir("APROVADO")}
        disabled={aEnviar}
        className="bg-garrafa-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
      >
        Aprovar
      </button>
      <button
        onClick={() => decidir("REJEITADO")}
        disabled={aEnviar}
        className="border border-garrafa-700 text-tinta-900 px-4 py-2 rounded-md text-sm disabled:opacity-50"
      >
        Rejeitar
      </button>
    </div>
  );
}
