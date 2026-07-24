import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { emailNovoRegistoProfissional, emailPedidoRegistoRecebido } from "@/lib/email";
import { z } from "zod";

const registoSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  empresaNome: z.string().min(2),
  nif: z.string().min(9).max(9),
  moradaFiscal: z.string().min(5),
  telefone: z.string().trim().min(6).max(30),
});

// Compatibilidade com a rota antiga. O formulário atual usa /api/registo.
export async function POST(req: Request) {
  try {
    const dados = registoSchema.parse(await req.json());
    const email = dados.email.trim().toLowerCase();

    const existe = await prisma.user.findUnique({ where: { email } });
    if (existe) {
      return NextResponse.json(
        { erro: "Já existe uma conta com este email." },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        nome: dados.nome,
        email,
        passwordHash: await bcrypt.hash(dados.password, 10),
        role: "PROFISSIONAL",
        profissionalEstado: "PENDENTE",
        empresaNome: dados.empresaNome,
        nif: dados.nif,
        moradaFiscal: dados.moradaFiscal,
        telefone: dados.telefone,
      },
    });

    await Promise.allSettled([
      emailNovoRegistoProfissional({
        nome: dados.nome,
        empresa: dados.empresaNome,
        email,
        telefone: dados.telefone,
        nif: dados.nif,
        morada: dados.moradaFiscal,
      }),
      emailPedidoRegistoRecebido(email, dados.nome),
    ]);

    return NextResponse.json(
      {
        ok: true,
        mensagem: "Pedido enviado. A conta fica ativa assim que for aprovada.",
        id: user.id,
      },
      { status: 201 },
    );
  } catch (erro) {
    if (erro instanceof z.ZodError) {
      return NextResponse.json(
        { erro: erro.issues[0]?.message || "Dados inválidos." },
        { status: 400 },
      );
    }

    console.error("Erro na rota de registo profissional antiga", erro);
    return NextResponse.json(
      { erro: "Não foi possível criar a conta." },
      { status: 500 },
    );
  }
}
