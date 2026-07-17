"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegistoPage() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [aEnviar, setAEnviar] = useState(false);

  async function submeter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setAEnviar(true);

    const form = new FormData(e.currentTarget);
    const dados = {
      nome: form.get("nome"),
      email: form.get("email"),
      password: form.get("password"),
      telefone: form.get("telefone") || undefined,
    };

    const resposta = await fetch("/api/registo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => ({}));
      setErro(corpo.erro ?? "Não foi possível criar a conta.");
      setAEnviar(false);
      return;
    }

    // Cria a conta e já faz login automaticamente
    await signIn("credentials", {
      email: dados.email,
      password: dados.password,
      redirect: false,
    });

    setAEnviar(false);
    router.push("/conta");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="font-display text-3xl mb-6">Criar Conta</h1>

      {erro && <p className="mb-4 text-sm text-red-600">{erro}</p>}

      <form onSubmit={submeter} className="space-y-4">
        <input name="nome" placeholder="Nome" required className="w-full border border-linho-300 rounded-md p-3" />
        <input name="email" type="email" placeholder="Email" required className="w-full border border-linho-300 rounded-md p-3" />
        <input name="telefone" placeholder="Telefone (opcional)" className="w-full border border-linho-300 rounded-md p-3" />
        <input name="password" type="password" placeholder="Password (mín. 8 caracteres)" required minLength={8} className="w-full border border-linho-300 rounded-md p-3" />
        <button
          type="submit"
          disabled={aEnviar}
          className="w-full bg-garrafa-700 text-white py-3 rounded-md disabled:opacity-50"
        >
          {aEnviar ? "A criar..." : "Criar conta"}
        </button>
      </form>
    </div>
  );
}
