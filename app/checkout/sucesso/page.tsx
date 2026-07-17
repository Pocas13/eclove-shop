import Link from "next/link";

export default function CheckoutSucessoPage({ searchParams }: { searchParams: { encomenda?: string } }) {
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <h1 className="font-display text-3xl mb-4">Encomenda confirmada!</h1>
      <p className="text-tinta-500 mb-2">
        Obrigado pela tua compra. O pagamento foi aceite e a tua encomenda já está a ser preparada.
      </p>
      {searchParams.encomenda && (
        <p className="text-sm text-tinta-500 mb-8">
          Número de encomenda: <strong>{searchParams.encomenda}</strong>
        </p>
      )}
      <Link href="/conta" className="underline">
        Ver as minhas encomendas
      </Link>
    </div>
  );
}
