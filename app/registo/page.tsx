import FormularioRegisto from "@/components/FormularioRegisto";

export default function RegistoPage() {
  return <div className="mx-auto max-w-3xl rounded-[2rem] border border-calcario-200 bg-white p-6 shadow-soft sm:p-9">
    <p className="eyebrow">Conta profissional</p>
    <h1 className="mt-3 font-display text-4xl font-bold">Pedir acesso à Eclove</h1>
    <p className="mb-8 mt-3 text-sm text-black/55">Todos os campos são obrigatórios. A conta só fica ativa depois da validação pela nossa equipa.</p>
    <FormularioRegisto />
  </div>;
}
