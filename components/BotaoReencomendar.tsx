"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BotaoReencomendar({ encomendaId }: { encomendaId: string }) {
  const router = useRouter();
  const [aEnviar, setAEnviar] = useState(false);

  async function reencomendar() {
    setAEnviar(true);
    await fetch("/api/carrinho/reencomendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encomendaId }),
    });
    setAEnviar(false);
    router.push("/carrinho");
  }

  return (
    <button onClick={reencomendar} disabled={aEnviar} className="text-sm text-mare-700 underline disabled:opacity-50">
      {aEnviar ? "A adicionar..." : "Encomendar novamente"}
    </button>
  );
}
