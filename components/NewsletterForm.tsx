"use client";
import { useState } from "react";
export default function NewsletterForm() {
  const [estado, setEstado] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setEstado("A guardar...");
    const form = new FormData(e.currentTarget);
    const r = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ email: form.get("email") }) });
    const d = await r.json(); setEstado(r.ok ? "Subscrição confirmada." : d.erro ?? "Não foi possível subscrever.");
  }
  return <form onSubmit={submit} className="mt-6"><div className="flex max-w-xl flex-col gap-3 sm:flex-row"><input name="email" type="email" required placeholder="O teu melhor email" className="min-w-0 flex-1 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-white placeholder:text-white/60 outline-none focus:border-white"/><button className="rounded-full bg-white px-6 py-3 text-sm font-bold text-grafite-900">Quero receber novidades</button></div>{estado && <p className="mt-3 text-sm text-white/75">{estado}</p>}</form>;
}
