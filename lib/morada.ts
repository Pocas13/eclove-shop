export type PartesMorada = {
  rua: string;
  numeroPorta: string;
  andar?: string | null;
  ladoPorta?: string | null;
  codigoPostal: string;
  cidade: string;
};

function limpar(valor?: string | null): string {
  return valor?.trim() ?? "";
}

export function complementoMorada(andar?: string | null, ladoPorta?: string | null): string | undefined {
  const partes = [limpar(andar), limpar(ladoPorta)].filter(Boolean);
  return partes.length ? partes.join(" ") : undefined;
}

export function formatarMorada({
  rua,
  numeroPorta,
  andar,
  ladoPorta,
  codigoPostal,
  cidade,
}: PartesMorada): string {
  const linhaPrincipal = `${limpar(rua)}, n.º ${limpar(numeroPorta)}`;
  const complemento = complementoMorada(andar, ladoPorta);
  const localidade = `${limpar(codigoPostal)} ${limpar(cidade)}`.trim();

  return [linhaPrincipal, complemento, localidade].filter(Boolean).join(", ");
}
