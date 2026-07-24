export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { emailNovoRegistoProfissional, emailPedidoRegistoRecebido } from "@/lib/email";
import { complementoMorada, formatarMorada } from "@/lib/morada";
import { z } from "zod";

const campoOpcional = (maximo: number) => z.preprocess(
  (valor) => typeof valor === "string" && valor.trim() === "" ? undefined : valor,
  z.string().trim().max(maximo).optional(),
);

const schema = z.object({
  nome: z.string().trim().min(2),
  empresaNome: z.string().trim().min(2).max(160),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
  telefone: z.string().trim().min(6).max(30),
  nif: z.string().regex(/^\d{9}$/),
  codigoPostal: z.string().regex(/^\d{4}-\d{3}$/),
  rua: z.string().trim().min(2).max(180),
  numeroPorta: z.string().trim().min(1).max(20),
  andar: campoOpcional(30),
  ladoPorta: campoOpcional(40),
  cidade: z.string().trim().min(2).max(100),
});

export async function POST(req: Request) {
  try {
    const d = schema.parse(await req.json());

    if (await prisma.user.findUnique({ where: { email: d.email } })) {
      return NextResponse.json(
        { erro: "Já existe uma conta com este email." },
        { status: 409 },
      );
    }

    const moradaFiscal = formatarMorada(d);
    const linha2 = complementoMorada(d.andar, d.ladoPorta);

    const user = await prisma.user.create({
      data: {
        nome: d.nome,
        empresaNome: d.empresaNome,
        email: d.email,
        passwordHash: await bcrypt.hash(d.password, 10),
        role: "PROFISSIONAL",
        profissionalEstado: "PENDENTE",
        telefone: d.telefone,
        nif: d.nif,
        moradaFiscal,
        enderecos: {
          create: {
            linha1: d.rua,
            linha2,
            numeroPorta: d.numeroPorta,
            andar: d.andar,
            ladoPorta: d.ladoPorta,
            cidade: d.cidade,
            codigoPostal: d.codigoPostal,
            pais: "Portugal",
            principal: true,
          },
        },
      },
    });

    await Promise.allSettled([
      emailNovoRegistoProfissional({
        nome: d.nome,
        empresa: d.empresaNome,
        email: d.email,
        telefone: d.telefone,
        nif: d.nif,
        morada: moradaFiscal,
      }),
      emailPedidoRegistoRecebido(d.email, d.nome),
    ]);

    return NextResponse.json({ ok: true, id: user.id }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { erro: e.issues[0]?.message || "Dados inválidos." },
        { status: 400 },
      );
    }

    console.error("Erro ao criar conta profissional", e);
    return NextResponse.json(
      { erro: "Não foi possível criar a conta." },
      { status: 500 },
    );
  }
}
