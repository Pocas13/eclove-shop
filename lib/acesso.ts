import type { Session } from "next-auth";

export function contaAprovada(session: Session | null | undefined) {
  if (!session?.user) return false;
  const user = session.user as any;
  return user.role === "ADMIN" || user.profissionalEstado === "APROVADO";
}
