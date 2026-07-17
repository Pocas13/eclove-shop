import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET /api/carrinho — lista os itens do carrinho do utilizador autenticado
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const itens = await prisma.carrinhoItem.findMany({
    where: { userId: (session.user as any).id },
    include: { produto: true },
  });

  return NextResponse.json(itens);
}

const adicionarSchema = z.object({
  produtoId: z.string(),
  quantidade: z.number().int().positive().default(1),
});

// POST /api/carrinho — adiciona um produto ao carrinho (ou soma quantidade se já existir)
// Só clientes com conta PROFISSIONAL aprovada podem comprar, já que os preços B2C ficam sob consulta
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "PROFISSIONAL" && role !== "ADMIN") {
    return NextResponse.json(
      { erro: "A compra online está disponível apenas para contas profissionais. Pede um orçamento em /contacto." },
      { status: 403 }
    );
  }

  const { produtoId, quantidade } = adicionarSchema.parse(await req.json());

  const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
  if (!produto || !produto.ativo) {
    return NextResponse.json({ erro: "Produto não encontrado." }, { status: 404 });
  }

  const item = await prisma.carrinhoItem.upsert({
    where: { userId_produtoId: { userId: (session.user as any).id, produtoId } },
    update: { quantidade: { increment: quantidade } },
    create: { userId: (session.user as any).id, produtoId, quantidade },
  });

  return NextResponse.json(item, { status: 201 });
}
