import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET /api/produtos/:id — detalhe de um produto (usado pelo formulário de edição no backoffice)
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const produto = await prisma.produto.findUnique({ where: { id: params.id } });
  if (!produto) return NextResponse.json({ erro: "Produto não encontrado." }, { status: 404 });
  return NextResponse.json(produto);
}

const produtoUpdateSchema = z.object({
  nome: z.string().min(2),
  slug: z.string().min(2),
  descricao: z.string().min(5),
  sku: z.string().min(2),
  categoriaId: z.string(),
  precoRetalho: z.number().positive(),
  precoProfissional: z.number().positive(),
  quantidadeMinimaB2B: z.number().int().positive(),
  stock: z.number().int().min(0),
  material: z.string().optional(),
  largura_cm: z.number().int().positive().optional(),
  altura_cm: z.number().int().positive().optional(),
  profundidade_cm: z.number().int().positive().optional(),
  imagens: z.array(z.string()),
  ativo: z.boolean(),
});

// PATCH /api/produtos/:id — atualiza um produto (só admin)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ erro: "Sem permissões." }, { status: 403 });
  }

  const dados = produtoUpdateSchema.parse(await req.json());

  const produto = await prisma.produto.update({
    where: { id: params.id },
    data: dados,
  });

  return NextResponse.json(produto);
}

// DELETE /api/produtos/:id — desativa o produto (não apaga, para preservar o histórico de encomendas)
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ erro: "Sem permissões." }, { status: 403 });
  }

  const produto = await prisma.produto.update({
    where: { id: params.id },
    data: { ativo: false },
  });

  return NextResponse.json(produto);
}
