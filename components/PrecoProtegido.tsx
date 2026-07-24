import { formatarEuros } from "@/lib/precos";

export default function PrecoProtegido({ valor, visivel, compacto = false }: { valor: number | string; visivel: boolean; compacto?: boolean }) {
  if (visivel) return <span className={compacto ? "font-bold" : "text-lg font-bold"}>{formatarEuros(valor)}</span>;
  return <span className="price-lock" aria-label="Preço disponível após autenticação">🔒 Entrar para ver preço</span>;
}
