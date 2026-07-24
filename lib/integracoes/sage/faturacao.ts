import { prisma } from "@/lib/prisma";
import { SageClient } from "./client";
import { garantirContactoSage } from "./contactos";
import type { SageInvoiceInput } from "./types";

export async function emitirFaturaSage(encomendaId: string) {
  const encomenda = await prisma.encomenda.findUniqueOrThrow({ where: { id: encomendaId }, include: { user: true, itens: { include: { produto: true } } } });
  if (encomenda.estado !== "PAGA") throw new Error("A fatura só pode ser emitida após confirmação da cobrança.");
  if (encomenda.sageInvoiceId) return { jaEmitida: true, id: encomenda.sageInvoiceId };
  const contactId = await garantirContactoSage(encomenda.userId);
  const ledgerAccountId = process.env.SAGE_SALES_LEDGER_ACCOUNT_ID;
  const taxRateId = process.env.SAGE_TAX_RATE_ID;
  if (!ledgerAccountId || !taxRateId) throw new Error("Defina SAGE_SALES_LEDGER_ACCOUNT_ID e SAGE_TAX_RATE_ID antes de emitir faturas.");
  const body: SageInvoiceInput = {
    contact_id: contactId,
    date: new Date().toISOString().slice(0, 10),
    reference: encomenda.numero,
    notes: `Encomenda online ${encomenda.numero}`,
    invoice_lines: encomenda.itens.map((item) => ({
      description: item.produto.nome,
      quantity: item.quantidade,
      unit_price: Number(item.precoUnitario),
      product_id: item.produto.sageProductId || undefined,
      ledger_account_id: ledgerAccountId,
      tax_rate_id: taxRateId,
    })),
  };
  const log = await prisma.integracaoLog.create({ data: { tipo: "SAGE_FATURA", estado: "EM_CURSO", encomendaId, pedido: body as any } });
  try {
    const resposta = await new SageClient().request<any>("/sales_invoices", { method: "POST", body: { sales_invoice: body } });
    const id = String(resposta?.id ?? resposta?.$key ?? resposta?.sales_invoice?.id ?? "");
    if (!id) throw new Error("A Sage não devolveu o ID da fatura.");
    await prisma.encomenda.update({ where: { id: encomendaId }, data: { sageInvoiceId: id, faturadaEm: new Date() } });
    await prisma.integracaoLog.update({ where: { id: log.id }, data: { estado: "SUCESSO", resposta } });
    return { id, resposta };
  } catch (error) {
    await prisma.integracaoLog.update({ where: { id: log.id }, data: { estado: "ERRO", erro: error instanceof Error ? error.message : String(error) } });
    throw error;
  }
}
