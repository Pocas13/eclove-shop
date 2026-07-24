import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emailDecisaoProfissional } from "@/lib/email";
import { z } from "zod";

// GET — lista pedidos de conta profissional pendentes
export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ erro: "Sem permissões." }, { status: 403 });
  }

  const pendentes = await prisma.user.findMany({
    where: { role: "PROFISSIONAL", profissionalEstado: "PENDENTE" },
    select: { id: true, nome: true, email: true, empresaNome: true, nif: true, createdAt: true },
  });

  return NextResponse.json(pendentes);
}

const decisaoSchema = z.object({
  userId: z.string(),
  decisao: z.enum(["APROVADO", "REJEITADO"]),
});

// PATCH — aprova ou rejeita um pedido de conta profissional
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ erro: "Sem permissões." }, { status: 403 });
  }

  const { userId, decisao } = decisaoSchema.parse(await req.json());

  const user = await prisma.user.update({
    where: { id: userId },
    data: { profissionalEstado: decisao },
  });

  await prisma.clienteHistorico.create({ data: { userId: user.id, tipo: "CONTA", titulo: decisao === "APROVADO" ? "Conta aprovada" : "Conta rejeitada", detalhe: "Decisão registada no backoffice.", autor: session?.user?.email || "Admin" } });
  await Promise.allSettled([
    emailDecisaoProfissional(user.email, decisao === "APROVADO"),
  ]);

  return NextResponse.json({ ok: true, user });
}
