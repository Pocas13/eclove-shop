import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { emailConfirmacaoEncomenda } from "@/lib/email";
import Stripe from "stripe";

// Stripe precisa do corpo em bruto (raw) para validar a assinatura — Next.js não deve fazer parse do JSON aqui
export const runtime = "nodejs";

export async function POST(req: Request) {
  const corpo = await req.text();
  const assinatura = req.headers.get("stripe-signature");

  let evento: Stripe.Event;
  try {
    evento = stripe.webhooks.constructEvent(corpo, assinatura!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Assinatura do webhook inválida:", err);
    return NextResponse.json({ erro: "Assinatura inválida." }, { status: 400 });
  }

  if (evento.type === "checkout.session.completed") {
    const sessionStripe = evento.data.object as Stripe.Checkout.Session;
    const encomendaId = sessionStripe.metadata?.encomendaId;

    if (encomendaId) {
      const encomenda = await prisma.encomenda.update({
        where: { id: encomendaId },
        data: {
          estado: "PAGA",
          stripePaymentId: sessionStripe.payment_intent as string,
        },
        include: { user: true },
      });
      await emailConfirmacaoEncomenda(encomenda.user.email, encomenda.numero);
    }
  }

  return NextResponse.json({ recebido: true });
}
