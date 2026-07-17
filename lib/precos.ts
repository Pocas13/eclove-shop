import type { Produto } from "@prisma/client";

type Role = "CLIENTE" | "PROFISSIONAL" | "ADMIN" | undefined | null;

export type VisibilidadePreco =
  | { tipo: "profissional"; valor: number }
  | { tipo: "sob_consulta" };

/**
 * Decide o que mostrar a um utilizador:
 * - PROFISSIONAL (aprovado) e ADMIN veem o preço real (precoProfissional)
 * - CLIENTE / visitante (B2C) veem "preço sob consulta" — sem valor exposto
 *
 * Nota: isto é só para a APRESENTAÇÃO. O preço de retalho (precoRetalho)
 * continua a existir na BD e pode ser usado internamente (ex: cálculo de
 * margens, PDFs, ou reativado no futuro se decidirem mostrar preço indicativo).
 */
export function visibilidadePreco(
  produto: Pick<Produto, "precoProfissional">,
  role: Role
): VisibilidadePreco {
  if (role === "PROFISSIONAL" || role === "ADMIN") {
    return { tipo: "profissional", valor: Number(produto.precoProfissional) };
  }
  return { tipo: "sob_consulta" };
}

export function formatarEuros(valor: number | string) {
  const numero = typeof valor === "string" ? parseFloat(valor) : valor;
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(numero);
}
