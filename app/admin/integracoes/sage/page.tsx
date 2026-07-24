import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SagePage() {
  const oauthConfigurado = Boolean(process.env.SAGE_CLIENT_ID && process.env.SAGE_CLIENT_SECRET && process.env.SAGE_REDIRECT_URI && process.env.SAGE_TOKEN_ENCRYPTION_KEY);
  const [connection, produtosLigados, clientesLigados, faturasLigadas, ultimoLog] = await Promise.all([
    prisma.sageConnection.findUnique({ where: { id: "principal" } }),
    prisma.produto.count({ where: { sageProductId: { not: null } } }),
    prisma.user.count({ where: { sageContactId: { not: null } } }),
    prisma.encomenda.count({ where: { sageInvoiceId: { not: null } } }),
    prisma.integracaoLog.findFirst({ where: { tipo: { startsWith: "SAGE" } }, orderBy: { createdAt: "desc" } }),
  ]);
  const ligado = Boolean(connection);
  const faturacaoConfigurada = Boolean(process.env.SAGE_SALES_LEDGER_ACCOUNT_ID && process.env.SAGE_TAX_RATE_ID);
  return <div>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="eyebrow">Integrações</p><h1 className="mt-2 font-display text-3xl font-bold">Sage Accounting</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-grafite-500">Ligação OAuth 2.0, renovação automática de tokens, sincronização de produtos, contactos e emissão de faturas após pagamento.</p></div><span className={`status-pill ${ligado ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900"}`}>{ligado ? "Ligado" : oauthConfigurado ? "Pronto para ligar" : "Variáveis em falta"}</span></div>
    <div className="mt-6 flex flex-wrap gap-3">{!ligado && oauthConfigurado && <a href="/api/admin/sage/connect" className="btn-primary">Ligar conta Sage</a>}{ligado && <form action="/api/admin/sage/disconnect" method="post"><button className="rounded-full border border-red-600 px-6 py-3 text-sm font-bold text-red-600">Desligar Sage</button></form>}<form action="/api/admin/sage/sync-products" method="post"><button disabled={!ligado || process.env.SAGE_MODE !== "live"} className="rounded-full border border-grafite-900 px-6 py-3 text-sm font-bold disabled:opacity-40">Sincronizar produtos</button></form></div>
    {connection && <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-950"><p><b>Empresa:</b> {connection.businessName || "Empresa Sage"}</p><p className="mt-1"><b>Business ID:</b> {connection.businessId || "por confirmar"}</p><p className="mt-1"><b>Token:</b> renovação automática; validade atual até {connection.expiresAt.toLocaleString("pt-PT")}</p>{connection.lastError && <p className="mt-3 rounded-xl bg-red-50 p-3 text-red-700">{connection.lastError}</p>}</div>}
    <div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="metric"><p className="text-sm text-grafite-500">Produtos associados</p><p className="mt-2 text-3xl font-bold">{produtosLigados}</p></div><div className="metric"><p className="text-sm text-grafite-500">Clientes associados</p><p className="mt-2 text-3xl font-bold">{clientesLigados}</p></div><div className="metric"><p className="text-sm text-grafite-500">Faturas registadas</p><p className="mt-2 text-3xl font-bold">{faturasLigadas}</p></div></div>
    <section className="mt-8 rounded-3xl border border-calcario-200 p-6"><h2 className="font-display text-xl font-bold">Estado da implementação</h2><div className="mt-5 grid gap-3 text-sm"><p>✓ OAuth 2.0 oficial Sage API 3.1</p><p>✓ Tokens cifrados na base de dados e renovação automática</p><p>✓ Seleção da empresa Sage autorizada</p><p>✓ Associação de clientes por email e criação quando necessário</p><p>✓ Sincronização de códigos e preços dos produtos</p><p>✓ Emissão controlada de fatura após cobrança confirmada</p><p>✓ Logs e repetição para falhas temporárias</p><p className={faturacaoConfigurada ? "text-green-800" : "text-amber-800"}>{faturacaoConfigurada ? "✓" : "○"} Mapeamento de conta de vendas e taxa de IVA</p><p className="text-amber-800">○ Teste final obrigatório numa empresa Sage real antes de automatizar</p></div></section>
    <section className="mt-6 rounded-3xl bg-calcario-100 p-6"><h2 className="font-display text-xl font-bold">Última atividade</h2>{ultimoLog ? <div className="mt-3 text-sm"><p><b>{ultimoLog.tipo}</b> · {ultimoLog.estado}</p><p className="mt-1 text-grafite-500">{ultimoLog.createdAt.toLocaleString("pt-PT")}</p>{ultimoLog.erro && <p className="mt-3 rounded-xl bg-red-50 p-3 text-red-700">{ultimoLog.erro}</p>}</div> : <p className="mt-3 text-sm text-grafite-500">Ainda não existem pedidos reais ao Sage.</p>}</section>
    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><b>Importante:</b> não atives a faturação automática até validarmos a conta contabilística, a taxa de IVA, a série documental e uma fatura de teste no teu Sage.</div>
  </div>;
}
