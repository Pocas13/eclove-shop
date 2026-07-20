import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const checkoutSchema = z.object({
  moradaEntrega: z.string().min(5),
  nifFatura: z.string().optional(),
});

// POST /api/checkout — cria a Encomenda (PENDENTE) a partir do carrinho e devolve o url de pagamento Stripe
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "PROFISSIONAL" && role !== "ADMIN") {
    return NextResponse.json({ erro: "Só contas de revenda aprovadas podem finalizar compra online." }, { status: 403 });
  }

  const { moradaEntrega, nifFatura } = checkoutSchema.parse(await req.json());
  const userId = (session.user as any).id;

  const itensCarrinho = await prisma.carrinhoItem.findMany({
    where: { userId },
    include: { produto: true },
  });

  if (itensCarrinho.length === 0) {
    return NextResponse.json({ erro: "O carrinho está vazio." }, { status: 400 });
  }

  const total = itensCarrinho.reduce(
    (soma, item) => soma + Number(item.produto.precoProfissional) * item.quantidade,
    0
  );

  const numero = `ENC-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000 + 100000)}`;

  // Cria a encomenda como PENDENTE — só passa a PAGA quando o webhook do Stripe confirmar o pagamento
  const encomenda = await prisma.encomenda.create({
    data: {
      numero,
      userId,
      tipoCliente: "B2B",
      estado: "PENDENTE",
      total,
      moradaEntrega,
      nifFatura,
      itens: {
        create: itensCarrinho.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitario: item.produto.precoProfissional,
        })),
      },
    },
  });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: itensCarrinho.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: { name: item.produto.nome },
        unit_amount: Math.round(Number(item.produto.precoProfissional) * 100),
      },
      quantity: item.quantidade,
    })),
    metadata: { encomendaId: encomenda.id },
    success_url: `${process.env.NEXTAUTH_URL}/checkout/sucesso?encomenda=${encomenda.numero}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/checkout`,
  });

  // Esvazia o carrinho depois de criar a encomenda
  await prisma.carrinhoItem.deleteMany({ where: { userId } });

  return NextResponse.json({ url: checkoutSession.url });
}
