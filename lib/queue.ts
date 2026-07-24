import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const MAX_TENTATIVAS = 3;

export async function criarJob(
  tipo: string,
  payload: Prisma.InputJsonObject,
  chaveUnica?: string,
) {
  if (chaveUnica) {
    const existente = await prisma.integrationJob.findUnique({
      where: { chaveUnica },
    });

    if (existente) return existente;
  }

  return prisma.integrationJob.create({
    data: {
      tipo,
      payload,
      chaveUnica,
      estado: "PENDENTE",
    },
  });
}

export async function processarJob(
  id: string,
  handler: (payload: Prisma.JsonValue) => Promise<unknown>,
) {
  // A atualização condicional impede que dois cron jobs processem o mesmo trabalho.
  const reclamado = await prisma.integrationJob.updateMany({
    where: {
      id,
      estado: "PENDENTE",
      executarApos: { lte: new Date() },
    },
    data: {
      estado: "EM_CURSO",
      tentativas: { increment: 1 },
      ultimoErro: null,
    },
  });

  if (reclamado.count === 0) {
    throw new Error("Job já reclamado, concluído ou ainda não disponível.");
  }

  const job = await prisma.integrationJob.findUniqueOrThrow({ where: { id } });

  try {
    const resultado = await handler(job.payload);

    return prisma.integrationJob.update({
      where: { id },
      data: {
        estado: "CONCLUIDO",
        resultado:
          resultado === undefined
            ? Prisma.JsonNull
            : (resultado as Prisma.InputJsonValue),
        processadoEm: new Date(),
        ultimoErro: null,
      },
    });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro);
    const falhouDefinitivamente = job.tentativas >= MAX_TENTATIVAS;
    const atrasoMinutos = Math.min(60, 2 ** job.tentativas);

    await prisma.integrationJob.update({
      where: { id },
      data: {
        estado: falhouDefinitivamente ? "FALHOU" : "PENDENTE",
        ultimoErro: mensagem,
        executarApos: falhouDefinitivamente
          ? job.executarApos
          : new Date(Date.now() + atrasoMinutos * 60_000),
      },
    });

    throw erro;
  }
}
