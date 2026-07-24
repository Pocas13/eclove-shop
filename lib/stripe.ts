import Stripe from "stripe";

let stripeClient: Stripe | null = null;

/**
 * Obtém o cliente Stripe apenas quando existe uma chave configurada.
 * Isto evita que o `next build` falhe ao importar as rotas num ambiente
 * onde o Stripe ainda não foi configurado.
 */
export function getStripe(): Stripe | null {
  const apiKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!apiKey) return null;

  if (!stripeClient) {
    stripeClient = new Stripe(apiKey, {
      apiVersion: "2026-06-24.dahlia",
    });
  }

  return stripeClient;
}

/**
 * Variante para fluxos que já validaram a configuração do Stripe.
 */
export function requireStripe(): Stripe {
  const client = getStripe();

  if (!client) {
    throw new Error("O pagamento Stripe ainda não está configurado.");
  }

  return client;
}
