"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BotaoAdicionarCarrinho({ produtoId }: { produtoId: string }) {
  const router = useRouter();
  const [aEnviar, setAEnviar] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function adicionar() {
    setAEnviar(true);
    setMensagem(null);

    const resposta = await fetch("/api/carrinho", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produtoId, quantidade: 1 }),
    });

    setAEnviar(false);

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => ({}));
      setMensagem(corpo.erro ?? "Não foi possível adicionar ao carrinho.");
      return;
    }

    router.refresh();
    setMensagem("Adicionado ao carrinho.");
  }

  return (
    <div>
      <button
        onClick={adicionar}
        disabled={aEnviar}
        className="bg-mare-700 text-white px-6 py-3 rounded-md hover:bg-mare-600 transition-colors disabled:opacity-50"
      >
        {aEnviar ? "A adicionar..." : "Adicionar ao carrinho"}
      </button>
      {mensagem && <p className="mt-2 text-sm text-tinta-500">{mensagem}</p>}
    </div>
  );
}
