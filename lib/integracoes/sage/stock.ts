import { prisma } from "@/lib/prisma";
import { SageClient, sageItems } from "./client";
import type { SageProduct } from "./types";

export async function sincronizarProdutosSage() {
  const inicio = new Date();
  const log = await prisma.integracaoLog.create({ data: { tipo: "SAGE_PRODUTOS", estado: "EM_CURSO", pedido: { inicio: inicio.toISOString() } } });
  try {
    const dados = await new SageClient().request<any>("/products", { query: { items_per_page: "200" } });
    const items = sageItems<SageProduct>(dados);
    let atualizados = 0;
    for (const item of items) {
      const sku = item.item_code ?? item.product_code;
      if (!sku) continue;
      const data: { sageProductId: string; preco?: number } = { sageProductId: String(item.id) };
      const price = Number(item.sales_price);
      if (Number.isFinite(price) && price >= 0) data.preco = price;
      const result = await prisma.produto.updateMany({ where: { sku }, data });
      atualizados += result.count;
    }
    const totalSage = Number(dados?.$totalResults ?? items.length);
    await prisma.integracaoLog.update({ where: { id: log.id }, data: { estado: "SUCESSO", resposta: { atualizados, totalSage } } });
    return { atualizados, totalSage };
  } catch (error) {
    await prisma.integracaoLog.update({ where: { id: log.id }, data: { estado: "ERRO", erro: error instanceof Error ? error.message : String(error) } });
    throw error;
  }
}
