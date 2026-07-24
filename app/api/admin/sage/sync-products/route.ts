import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sincronizarProdutosSage } from "@/lib/integracoes/sage/stock";

export async function POST() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  if (process.env.SAGE_MODE !== "live") return NextResponse.json({ erro: "A sincronização Sage está desativada. Defina SAGE_MODE=live apenas após validar as credenciais." }, { status: 409 });
  try { return NextResponse.json(await sincronizarProdutosSage()); }
  catch (error) { return NextResponse.json({ erro: error instanceof Error ? error.message : "Erro Sage" }, { status: 502 }); }
}
