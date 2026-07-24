export function formatarEuros(valor: number | string) {
  const numero = typeof valor === "string" ? parseFloat(valor) : valor;
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(numero);
}
