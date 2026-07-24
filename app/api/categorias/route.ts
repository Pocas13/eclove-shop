export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/categorias — devolve as categorias de topo, cada uma com as suas subcategorias
export async function GET() {
  const categorias = await prisma.categoria.findMany({
    where: { parentId: null },
    include: { subcategorias: { orderBy: { nome: "asc" } } },
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(categorias);
}
