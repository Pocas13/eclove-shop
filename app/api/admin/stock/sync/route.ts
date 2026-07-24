export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";import { getServerSession } from "next-auth";import { authOptions } from "@/lib/auth";import { sincronizarProdutosSage } from "@/lib/integracoes/sage/stock";export async function POST(){const s=await getServerSession(authOptions);if((s?.user as any)?.role!=="ADMIN")return NextResponse.json({erro:"Sem autorização"},{status:403});try{return NextResponse.json(await sincronizarProdutosSage())}catch(e){return NextResponse.json({erro:e instanceof Error?e.message:"Erro Sage"},{status:500})}}
