import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  await prisma.sageConnection.deleteMany({ where: { id: "principal" } });
  return NextResponse.json({ desligado: true });
}
