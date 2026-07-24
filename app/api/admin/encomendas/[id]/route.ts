export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emailMudancaEstadoEncomenda } from "@/lib/email";
import { z } from "zod";

const estadoSchema = z.object({
  estado: z.enum(["PENDENTE", "PAGA", "EM_PREPARACAO", "ENVIADA", "ENTREGUE", "CANCELADA"]),
});

// PATCH /api/admin/encomendas/:id — muda o estado da encomenda
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ erro: "Sem permissões." }, { status: 403 });
  }

  const { estado } = estadoSchema.parse(await req.json());
  const { id } = await params;

  const encomenda = await prisma.encomenda.update({
    where: { id },
    data: { estado },
    include: { user: true },
  });

  await Promise.allSettled([
    emailMudancaEstadoEncomenda(encomenda.user.email, encomenda.numero, estado),
  ]);

  return NextResponse.json(encomenda);
}
