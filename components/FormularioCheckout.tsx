"use client";

import { useState } from "react";

export default function FormularioCheckout() {
  const [aEnviar, setAEnviar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function submeter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setAEnviar(true);

    const form = new FormData(e.currentTarget);
    const resposta = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        moradaEntrega: form.get("moradaEntrega"),
        nifFatura: form.get("nifFatura") || undefined,
      }),
    });

    const corpo = await resposta.json();

    if (!resposta.ok) {
      setErro(corpo.erro ?? "Não foi possível iniciar o pagamento.");
      setAEnviar(false);
      return;
    }

    window.location.href = corpo.url;
  }

  return (
    <form onSubmit={submeter} className="space-y-4 max-w-md">
      {erro && <p className="text-sm text-red-600">{erro}</p>}
      <textarea
        name="moradaEntrega"
        placeholder="Morada de entrega completa"
        required
        rows={3}
        className="w-full border border-linho-300 rounded-md p-3"
      />
      <input name="nifFatura" placeholder="NIF para faturação (opcional)" className="w-full border border-linho-300 rounded-md p-3" />
      <button type="submit" disabled={aEnviar} className="w-full bg-garrafa-700 text-white py-3 rounded-md disabled:opacity-50">
        {aEnviar ? "A redirecionar para pagamento..." : "Pagar com cartão"}
      </button>
    </form>
  );
}
