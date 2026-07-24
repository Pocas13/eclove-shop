import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  const connection = await prisma.sageConnection.findUnique({ where: { id: "principal" }, select: { businessId: true, businessName: true, expiresAt: true, lastError: true, updatedAt: true } });
  return NextResponse.json({
    configurado: Boolean(process.env.SAGE_CLIENT_ID && process.env.SAGE_CLIENT_SECRET && process.env.SAGE_REDIRECT_URI && process.env.SAGE_TOKEN_ENCRYPTION_KEY),
    ligado: Boolean(connection),
    modo: process.env.SAGE_MODE || "desativado",
    empresa: connection?.businessName ?? null,
    businessId: connection?.businessId ?? null,
    tokenExpiraEm: connection?.expiresAt ?? null,
    atualizadoEm: connection?.updatedAt ?? null,
    ultimoErro: connection?.lastError ?? null,
    faturacaoConfigurada: Boolean(process.env.SAGE_SALES_LEDGER_ACCOUNT_ID && process.env.SAGE_TAX_RATE_ID),
  });
}
