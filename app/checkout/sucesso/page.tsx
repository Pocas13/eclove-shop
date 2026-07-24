import Link from "next/link";

export default async function CheckoutSucessoPage({
  searchParams,
}: {
  searchParams: Promise<{ encomenda?: string }>;
}) {
  const { encomenda } = await searchParams;

  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <h1 className="font-display text-3xl mb-4">Encomenda registada!</h1>
      <p className="text-tinta-500 mb-2">
        Obrigado pela tua compra. Receberás a confirmação assim que o pagamento for validado.
      </p>
      {encomenda && (
        <p className="text-sm text-tinta-500 mb-8">
          Número de encomenda: <strong>{encomenda}</strong>
        </p>
      )}
      <Link href="/conta" className="underline">
        Ver as minhas encomendas
      </Link>
    </div>
  );
}
