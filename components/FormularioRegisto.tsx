"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CamposMorada from "@/components/CamposMorada";

export default function FormularioRegisto() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [aEnviar, setAEnviar] = useState(false);

  async function submeter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErro(null); setAEnviar(true);
    const dados = Object.fromEntries(new FormData(e.currentTarget).entries());
    const resposta = await fetch("/api/registo", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(dados) });
    if (!resposta.ok) { const corpo=await resposta.json().catch(()=>({})); setErro(corpo.erro ?? "Não foi possível criar a conta."); setAEnviar(false); return; }
    router.push("/registo/recebido"); router.refresh();
  }

  const input = "w-full rounded-md border border-areia-300 bg-white p-3";
  return <form onSubmit={submeter} className="space-y-4">
    {erro && <p className="text-sm text-red-600">{erro}</p>}
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-semibold">Nome completo<input name="nome" required className={`${input} mt-2`} /></label>
      <label className="text-sm font-semibold">Empresa<input name="empresaNome" required className={`${input} mt-2`} /></label>
      <label className="text-sm font-semibold">Email<input name="email" type="email" required className={`${input} mt-2`} /></label>
      <label className="text-sm font-semibold">Telefone<input name="telefone" required className={`${input} mt-2`} /></label>
      <label className="text-sm font-semibold">NIF<input name="nif" inputMode="numeric" pattern="[0-9]{9}" required className={`${input} mt-2`} /></label>
      <div className="hidden sm:block" />
      <CamposMorada classNameInput={input} />
      <label className="text-sm font-semibold sm:col-span-2">Password<input name="password" type="password" minLength={8} required className={`${input} mt-2`} /></label>
    </div>
    <button disabled={aEnviar} className="btn-primary w-full disabled:opacity-50">{aEnviar ? "A enviar…" : "Enviar pedido de acesso"}</button>
  </form>;
}
