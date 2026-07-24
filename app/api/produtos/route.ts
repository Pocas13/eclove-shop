export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { contaAprovada } from "@/lib/acesso";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET /api/produtos?categoria=slug — o preço só é devolvido a utilizadores autenticados
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const podeVerPreco = contaAprovada(session);
  const { searchParams } = new URL(req.url);
  const categoriaSlug = searchParams.get("categoria");

  const produtos = await prisma.produto.findMany({
    where: {
      ativo: true,
      ...(categoriaSlug ? { categoria: { slug: categoriaSlug } } : {}),
    },
    include: { categoria: true },
    orderBy: { createdAt: "desc" },
  });

  const resultado = produtos.map((p) => ({
    id: p.id,
    nome: p.nome,
    slug: p.slug,
    imagens: p.imagens,
    categoria: p.categoria.nome,
    ...(podeVerPreco ? { preco: Number(p.precoPromocional ?? p.precoProfissional ?? p.preco), stock: p.stock, prazoEntrega: p.prazoEntrega } : {}),
  }));

  return NextResponse.json(resultado);
}

const produtoSchema = z.object({
  nome: z.string().min(2),
  slug: z.string().min(2),
  descricao: z.string().min(5),
  sku: z.string().min(2),
  categoriaId: z.string(),
  preco: z.number().positive(),
  stock: z.number().int().min(0).default(0),
  material: z.string().optional(),
  largura_cm: z.number().int().positive().optional(),
  altura_cm: z.number().int().positive().optional(),
  profundidade_cm: z.number().int().positive().optional(),
  imagens: z.array(z.string()).default([]),
});

// POST /api/produtos — só admin pode criar produtos
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ erro: "Sem permissões." }, { status: 403 });
  }

  const body = await req.json();
  const dados = produtoSchema.parse(body);

  const produto = await prisma.produto.create({ data: dados });
  return NextResponse.json(produto, { status: 201 });
}
