export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/encomendas — lista todas as encomendas (admin)
export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ erro: "Sem permissões." }, { status: 403 });
  }

  const encomendas = await prisma.encomenda.findMany({
    include: { user: true, itens: { include: { produto: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(encomendas);
}
