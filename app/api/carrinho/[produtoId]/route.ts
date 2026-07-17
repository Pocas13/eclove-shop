import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// PATCH /api/carrinho/:produtoId — muda a quantidade de um item
export async function PATCH(req: Request, { params }: { params: { produtoId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { quantidade } = z.object({ quantidade: z.number().int().positive() }).parse(await req.json());

  const item = await prisma.carrinhoItem.update({
    where: { userId_produtoId: { userId: (session.user as any).id, produtoId: params.produtoId } },
    data: { quantidade },
  });

  return NextResponse.json(item);
}

// DELETE /api/carrinho/:produtoId — remove um item do carrinho
export async function DELETE(_req: Request, { params }: { params: { produtoId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  await prisma.carrinhoItem.delete({
    where: { userId_produtoId: { userId: (session.user as any).id, produtoId: params.produtoId } },
  });

  return NextResponse.json({ ok: true });
}
