export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";import { prisma } from "@/lib/prisma";import { z } from "zod";export async function POST(req:Request){try{const{email}=z.object({email:z.string().email()}).parse(await req.json());await prisma.subscritor.upsert({where:{email},create:{email},update:{ativo:true}});return NextResponse.json({ok:true});}catch{return NextResponse.json({erro:"Indique um email válido."},{status:400})}}
