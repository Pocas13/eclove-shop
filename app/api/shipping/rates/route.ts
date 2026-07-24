export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"; import { z } from "zod"; import { cotarDHL } from "@/lib/integracoes/dhl/shipping";
const schema=z.object({codigoPostal:z.string().regex(/^\d{4}-\d{3}$/),express:z.boolean().optional(),volumes:z.array(z.object({pesoKg:z.number().positive(),comprimentoCm:z.number().positive(),larguraCm:z.number().positive(),alturaCm:z.number().positive()})).min(1)});
export async function POST(req:Request){try{const d=schema.parse(await req.json());return NextResponse.json({transportadora:"DHL",cotacoes:await cotarDHL(d.codigoPostal,d.volumes,d.express)});}catch(e){return NextResponse.json({erro:e instanceof Error?e.message:"Pedido inválido"},{status:400});}}
