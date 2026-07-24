"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ESTADOS = ["PENDENTE", "PAGA", "EM_PREPARACAO", "ENVIADA", "ENTREGUE", "CANCELADA"];

export default function SeletorEstadoEncomenda({ id, estadoAtual }: { id: string; estadoAtual: string }) {
  const router = useRouter();
  const [aGuardar, setAGuardar] = useState(false);

  async function mudarEstado(estado: string) {
    setAGuardar(true);
    await fetch(`/api/admin/encomendas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    setAGuardar(false);
    router.refresh();
  }

  return (
    <select
      defaultValue={estadoAtual}
      disabled={aGuardar}
      onChange={(e) => mudarEstado(e.target.value)}
      className="border border-areia-300 rounded-md p-2 text-sm"
    >
      {ESTADOS.map((estado) => (
        <option key={estado} value={estado}>
          {estado.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
