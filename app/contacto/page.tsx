// Formulário de contacto — associar a um endpoint /api/contacto (ex: enviar email ou gravar em BD)
// para a equipa comercial responder com o orçamento.

export default function ContactoPage() {
  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl mb-2">Pedir Orçamento</h1>
      <p className="text-tinta-500 mb-8">
        Os nossos preços para clientes finais estão sob consulta. Diz-nos o que procuras e
        respondemos com uma proposta.
      </p>

      <form className="space-y-4" method="post" action="/api/contacto">
        <input name="nome" placeholder="Nome" className="w-full border border-linho-300 rounded-md p-3" required />
        <input name="email" type="email" placeholder="Email" className="w-full border border-linho-300 rounded-md p-3" required />
        <input name="telefone" placeholder="Telefone (opcional)" className="w-full border border-linho-300 rounded-md p-3" />
        <textarea
          name="mensagem"
          placeholder="Que produtos te interessam?"
          rows={4}
          className="w-full border border-linho-300 rounded-md p-3"
          required
        />
        <button type="submit" className="w-full bg-garrafa-700 text-white py-3 rounded-md">
          Enviar pedido
        </button>
      </form>
    </div>
  );
}
