// Formulário simples — a lógica de submissão (fetch para /api/registo-profissional)
// deve ser adicionada num Client Component, ex: components/FormularioProfissional.tsx

export default function RegistoProfissionalPage() {
  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl mb-2">Conta Profissional</h1>
      <p className="text-tinta-500 mb-8">
        Cria uma conta de revendedor/profissional para aceder a preços de grossista. O teu pedido é revisto
        manualmente pela nossa equipa antes de seres aprovado.
      </p>

      <form className="space-y-4" method="post" action="/api/registo-profissional">
        <input name="nome" placeholder="Nome" className="w-full border border-linho-300 rounded-md p-3" required />
        <input name="email" type="email" placeholder="Email" className="w-full border border-linho-300 rounded-md p-3" required />
        <input name="password" type="password" placeholder="Password" className="w-full border border-linho-300 rounded-md p-3" required />
        <input name="empresaNome" placeholder="Nome da empresa" className="w-full border border-linho-300 rounded-md p-3" required />
        <input name="nif" placeholder="NIF (9 dígitos)" className="w-full border border-linho-300 rounded-md p-3" required />
        <input name="moradaFiscal" placeholder="Morada fiscal" className="w-full border border-linho-300 rounded-md p-3" required />
        <button type="submit" className="w-full bg-garrafa-700 text-white py-3 rounded-md">
          Pedir aprovação
        </button>
      </form>
    </div>
  );
}
