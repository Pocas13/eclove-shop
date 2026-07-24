"use client";

import { useMemo, useState } from "react";
import CamposMorada from "@/components/CamposMorada";

type DadosCliente = {
  nome: string;
  email: string;
  telefone: string;
  nif: string;
  rua: string;
  numeroPorta: string;
  andar: string;
  ladoPorta: string;
  codigoPostal: string;
  cidade: string;
};

export default function FormularioCheckout({ cliente }: { cliente: DadosCliente }) {
  const [aEnviar, setAEnviar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [metodoEntrega, setMetodoEntrega] = useState("TRANSPORTADORA");
  const precisaMorada = metodoEntrega !== "LEVANTAMENTO";
  const legendaEntrega = useMemo(() => ({
    LEVANTAMENTO: "Levantamento no nosso ponto de recolha. Custo a confirmar: 0 €.",
    ENTREGA_LOJA: "Entrega pela nossa equipa, sujeita a zona e disponibilidade.",
    TRANSPORTADORA: "Envio por transportadora, calculado pelo destino e volume.",
  }[metodoEntrega]), [metodoEntrega]);

  async function submeter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setAEnviar(true);
    const f = new FormData(e.currentTarget);
    const resposta = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clienteNome: f.get("clienteNome"),
        clienteEmail: f.get("clienteEmail"),
        clienteTelefone: f.get("clienteTelefone"),
        nifFatura: f.get("nifFatura") || undefined,
        metodoEntrega: f.get("metodoEntrega"),
        rua: precisaMorada ? f.get("rua") : "Levantamento no ponto de recolha Eclove",
        numeroPorta: precisaMorada ? f.get("numeroPorta") : "—",
        andar: precisaMorada ? (f.get("andar") || undefined) : undefined,
        ladoPorta: precisaMorada ? (f.get("ladoPorta") || undefined) : undefined,
        codigoPostal: precisaMorada ? f.get("codigoPostal") : "0000-000",
        cidade: precisaMorada ? f.get("cidade") : "Levantamento",
        metodoPagamento: f.get("metodoPagamento"),
        aceitouTermos: f.get("aceitouTermos") === "on",
      }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      setErro(dados.erro ?? "Não foi possível iniciar o pagamento.");
      setAEnviar(false);
      return;
    }
    window.location.href = dados.url;
  }

  const input = "w-full rounded-2xl border border-calcario-300 bg-white px-4 py-3.5 outline-none transition focus:border-barro-500 focus:ring-2 focus:ring-barro-500/15";

  return <form onSubmit={submeter} className="space-y-8">
    {erro && <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{erro}</p>}

    <section className="checkout-card">
      <div className="step-number">1</div>
      <div className="flex-1"><h2 className="checkout-title">Dados do cliente</h2><p className="checkout-help">Confirmamos os dados da conta antes de avançar.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2 text-sm font-semibold">Nome completo<input name="clienteNome" defaultValue={cliente.nome} required minLength={2} className={`${input} mt-2`} /></label>
          <label className="text-sm font-semibold">Email<input name="clienteEmail" type="email" defaultValue={cliente.email} required className={`${input} mt-2`} /></label>
          <label className="text-sm font-semibold">Telefone<input name="clienteTelefone" defaultValue={cliente.telefone} required className={`${input} mt-2`} /></label>
          <label className="sm:col-span-2 text-sm font-semibold">NIF para faturação <span className="font-normal text-grafite-500">(opcional)</span><input name="nifFatura" defaultValue={cliente.nif} inputMode="numeric" className={`${input} mt-2`} /></label>
        </div>
      </div>
    </section>

    <section className="checkout-card">
      <div className="step-number">2</div>
      <div className="flex-1"><h2 className="checkout-title">Como pretende receber?</h2><p className="checkout-help">Os valores definitivos serão configurados posteriormente.</p>
        <div className="mt-5 grid gap-3">
          {[
            ["LEVANTAMENTO", "Levantamento", "Recolha no ponto Eclove após aviso de disponibilidade."],
            ["ENTREGA_LOJA", "Entrega pela nossa equipa", "Opção para zonas abrangidas pela entrega própria."],
            ["TRANSPORTADORA", "Envio para a morada", "Transporte especializado calculado por peso, volume e destino."],
          ].map(([valor, titulo, texto]) => <label key={valor} className="delivery-option">
            <input type="radio" name="metodoEntrega" value={valor} checked={metodoEntrega === valor} onChange={() => setMetodoEntrega(valor)} />
            <span><b>{titulo}</b><small>{texto}</small></span>
          </label>)}
        </div>
        <p className="mt-4 rounded-xl bg-calcario-100 px-4 py-3 text-sm text-grafite-700">{legendaEntrega}</p>
        {precisaMorada && <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <CamposMorada classNameInput={input} valores={{ codigoPostal: cliente.codigoPostal, rua: cliente.rua, numeroPorta: cliente.numeroPorta, andar: cliente.andar, ladoPorta: cliente.ladoPorta, cidade: cliente.cidade }} />
        </div>}
      </div>
    </section>

    <section className="checkout-card">
      <div className="step-number">3</div>
      <div className="flex-1"><h2 className="checkout-title">Pagamento seguro</h2><p className="checkout-help">A fatura final é emitida apenas depois da confirmação da cobrança.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">{[["CARTAO","Cartão"],["MBWAY","MB WAY"],["MULTIBANCO","Multibanco"]].map(([v,l])=><label key={v} className="payment-option"><input type="radio" name="metodoPagamento" value={v} defaultChecked={v === "CARTAO"}/><span>{l}</span></label>)}</div>
      </div>
    </section>

    <label className="flex items-start gap-3 rounded-2xl border border-calcario-300 bg-white p-4 text-sm leading-6"><input type="checkbox" name="aceitouTermos" required className="mt-1"/><span>Li e aceito os <a className="font-semibold underline" href="/termos-e-condicoes" target="_blank">Termos e Condições</a> e a <a className="font-semibold underline" href="/privacidade" target="_blank">Política de Privacidade</a>.</span></label>
    <button type="submit" disabled={aEnviar} className="btn-primary w-full py-4 text-base disabled:opacity-50">{aEnviar ? "A preparar pagamento..." : "Continuar para pagamento seguro"}</button>
  </form>;
}
