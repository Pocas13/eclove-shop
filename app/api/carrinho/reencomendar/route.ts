export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ encomendaId: z.string() });

// POST /api/carrinho/reencomendar — adiciona ao carrinho atual todos os itens de uma encomenda anterior
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { encomendaId } = schema.parse(await req.json());
  const userId = (session.user as any).id;

  const encomenda = await prisma.encomenda.findFirst({
    where: { id: encomendaId, userId },
    include: { itens: true },
  });
  if (!encomenda) return NextResponse.json({ erro: "Encomenda não encontrada." }, { status: 404 });

  await Promise.all(
    encomenda.itens.map((item) =>
      prisma.carrinhoItem.upsert({
        where: { userId_produtoId: { userId, produtoId: item.produtoId } },
        update: { quantidade: { increment: item.quantidade } },
        create: { userId, produtoId: item.produtoId, quantidade: item.quantidade },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
