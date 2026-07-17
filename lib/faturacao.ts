/**
 * FATURAÇÃO — ainda por integrar.
 *
 * Em Portugal, faturas legais têm de ser emitidas por software certificado
 * pela Autoridade Tributária. Este projeto guarda o NIF do cliente
 * (Encomenda.nifFatura) mas NÃO emite faturas legais sozinho.
 *
 * Duas opções quando quiseres avançar:
 * 1) Integrar um serviço certificado via API (ex: Vendus, InvoiceXpress, Moloni)
 *    — chamas a API deles aqui, passando os dados da Encomenda, e eles tratam
 *    da emissão/numeração/comunicação com a AT.
 * 2) Exportar as encomendas para o teu sistema de faturação existente.
 *
 * Estrutura sugerida para quando escolheres o fornecedor:
 */
import type { Encomenda, EncomendaItem, Produto } from "@prisma/client";

type EncomendaComItens = Encomenda & { itens: (EncomendaItem & { produto: Produto })[] };

export async function emitirFatura(_encomenda: EncomendaComItens) {
  throw new Error(
    "Emissão de fatura ainda não configurada. Escolhe um fornecedor certificado (Vendus, InvoiceXpress, Moloni) e implementa a chamada à respetiva API aqui."
  );
}
