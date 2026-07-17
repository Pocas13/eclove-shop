import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { emailNovoRegistoProfissional } from "@/lib/email";
import { z } from "zod";

const registoSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  empresaNome: z.string().min(2),
  nif: z.string().min(9).max(9),
  moradaFiscal: z.string().min(5),
  telefone: z.string().optional(),
});

// POST /api/registo-profissional — cria conta com estado PENDENTE, à espera de aprovação no backoffice
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
      role: "PROFISSIONAL",
      profissionalEstado: "PENDENTE",
      empresaNome: dados.empresaNome,
      nif: dados.nif,
      moradaFiscal: dados.moradaFiscal,
      telefone: dados.telefone,
    },
  });

  const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
  await Promise.all(admins.map((admin) => emailNovoRegistoProfissional(admin.email, dados.empresaNome)));

  return NextResponse.json(
    { ok: true, mensagem: "Pedido enviado. A tua conta fica ativa assim que for aprovada." , id: user.id },
    { status: 201 }
  );
}
