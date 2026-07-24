export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { emailConfirmacaoEncomenda, emailNovaEncomenda } from "@/lib/email";
import { eventos } from "@/lib/events";

function obterPaymentIntent(session: Stripe.Checkout.Session) {
  if (typeof session.payment_intent === "string") {
    return session.payment_intent;
  }

  return session.payment_intent?.id ?? session.id;
}

async function abaterCarrinho(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  userId: string,
  itens: Array<{ produtoId: string; quantidade: number }>,
) {
  for (const item of itens) {
    const carrinho = await tx.carrinhoItem.findUnique({
      where: {
        userId_produtoId: {
          userId,
          produtoId: item.produtoId,
        },
      },
    });

    if (!carrinho) continue;

    if (carrinho.quantidade <= item.quantidade) {
      await tx.carrinhoItem.delete({ where: { id: carrinho.id } });
    } else {
      await tx.carrinhoItem.update({
        where: { id: carrinho.id },
        data: { quantidade: { decrement: item.quantidade } },
      });
    }
  }
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const stripe = getStripe();
  const assinatura = req.headers.get("stripe-signature");

  if (!stripe || !webhookSecret || !assinatura) {
    return NextResponse.json(
      { erro: "Webhook Stripe não configurado." },
      { status: 503 },
    );
  }

  const corpo = await req.text();
  let evento: Stripe.Event;

  try {
    evento = stripe.webhooks.constructEvent(
      corpo,
      assinatura,
      webhookSecret,
    );
  } catch {
    return NextResponse.json(
      { erro: "Assinatura inválida." },
      { status: 400 },
    );
  }

  if (
    evento.type === "checkout.session.completed" ||
    evento.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = evento.data.object as Stripe.Checkout.Session;
    const encomendaId = session.metadata?.encomendaId;
    const pagamentoConfirmado =
      evento.type === "checkout.session.async_payment_succeeded" ||
      session.payment_status === "paid";

    // Multibanco pode concluir o Checkout antes de o dinheiro estar recebido.
    if (encomendaId && pagamentoConfirmado) {
      const encomenda = await prisma.$transaction(async (tx) => {
        const atual = await tx.encomenda.findUnique({
          where: { id: encomendaId },
          include: { user: true, itens: true },
        });

        if (!atual || atual.pagaEm || atual.estado === "CANCELADA") {
          return null;
        }

        const atualizada = await tx.encomenda.update({
          where: { id: encomendaId },
          data: {
            estado: "PAGA",
            stripePaymentId: obterPaymentIntent(session),
            pagaEm: new Date(),
          },
          include: { user: true, itens: true },
        });

        await abaterCarrinho(tx, atualizada.userId, atualizada.itens);
        return atualizada;
      });

      if (encomenda) {
        await Promise.allSettled([
          emailConfirmacaoEncomenda(
            encomenda.user.email,
            encomenda.numero,
          ),
          emailNovaEncomenda({
            numero: encomenda.numero,
            clienteNome: encomenda.clienteNome || encomenda.user.nome,
            clienteEmail: encomenda.clienteEmail || encomenda.user.email,
            total: encomenda.total.toString(),
          }),
          eventos.pagamentoConfirmado(encomenda.id),
        ]);
      }
    }
  }

  if (
    evento.type === "checkout.session.async_payment_failed" ||
    evento.type === "checkout.session.expired"
  ) {
    const session = evento.data.object as Stripe.Checkout.Session;
    const encomendaId = session.metadata?.encomendaId;

    if (encomendaId) {
      await prisma.encomenda.updateMany({
        where: {
          id: encomendaId,
          estado: "PENDENTE",
          pagaEm: null,
        },
        data: { estado: "CANCELADA" },
      });
    }
  }

  return NextResponse.json({ recebido: true });
}
