import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registoSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  telefone: z.string().optional(),
});

// POST /api/registo — cria uma conta de cliente final (CLIENTE), fica logo ativa
export async function POST(req: Request) {
  const dados = registoSchema.parse(await req.json());

  const existe = await prisma.user.findUnique({ where: { email: dados.email } });
  if (existe) {
    return NextResponse.json({ erro: "Já existe uma conta com este email." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(dados.password, 10);

  const user = await prisma.user.create({
    data: {
      nome: dados.nome,
      email: dados.email,
      passwordHash,
      role: "CLIENTE",
      telefone: dados.telefone,
    },
  });

  return NextResponse.json({ ok: true, id: user.id }, { status: 201 });
}
