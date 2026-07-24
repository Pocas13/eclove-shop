"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LinhaCarrinho({
  produtoId,
  quantidadeInicial,
}: {
  produtoId: string;
  quantidadeInicial: number;
}) {
  const router = useRouter();
  const [quantidade, setQuantidade] = useState(quantidadeInicial);
  const [aGuardar, setAGuardar] = useState(false);

  async function atualizar(nova: number) {
    if (nova < 1) return;
    setQuantidade(nova);
    setAGuardar(true);
    await fetch(`/api/carrinho/${produtoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantidade: nova }),
    });
    setAGuardar(false);
    router.refresh();
  }

  async function remover() {
    setAGuardar(true);
    await fetch(`/api/carrinho/${produtoId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={() => atualizar(quantidade - 1)} className="w-8 h-8 border border-areia-300 rounded-md" disabled={aGuardar}>
        −
      </button>
      <span className="w-6 text-center">{quantidade}</span>
      <button onClick={() => atualizar(quantidade + 1)} className="w-8 h-8 border border-areia-300 rounded-md" disabled={aGuardar}>
        +
      </button>
      <button onClick={remover} className="text-sm text-red-600 ml-2" disabled={aGuardar}>
        Remover
      </button>
    </div>
  );
}
