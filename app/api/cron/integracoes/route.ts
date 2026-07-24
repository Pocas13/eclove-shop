import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { processarJob } from "@/lib/queue";
import { emitirFaturaSage } from "@/lib/integracoes/sage/faturacao";
import { sincronizarProdutosSage } from "@/lib/integracoes/sage/stock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const faturaPayloadSchema = z.object({
  encomendaId: z.string().min(1),
});

export async function POST(req: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const jobs = await prisma.integrationJob.findMany({
    where: {
      estado: "PENDENTE",
      executarApos: { lte: new Date() },
    },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  const resultados: Array<{
    id: string;
    estado: string;
    erro?: string;
  }> = [];

  for (const job of jobs) {
    try {
      const processado = await processarJob(job.id, async (payload) => {
        switch (job.tipo) {
          case "EMITIR_FATURA_SAGE": {
            const { encomendaId } = faturaPayloadSchema.parse(payload);
            return emitirFaturaSage(encomendaId);
          }

          case "SINCRONIZAR_STOCK":
            return sincronizarProdutosSage();

          default:
            throw new Error(`Job desconhecido: ${job.tipo}`);
        }
      });

      resultados.push({ id: job.id, estado: processado.estado });
    } catch (erro) {
      resultados.push({
        id: job.id,
        estado: "ERRO",
        erro: erro instanceof Error ? erro.message : String(erro),
      });
    }
  }

  return NextResponse.json({
    processados: resultados.length,
    resultados,
  });
}
