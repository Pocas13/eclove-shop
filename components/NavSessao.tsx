"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

export default function NavSessao({ session }: { session: Session | null }) {
  if (!session?.user) {
    return (
      <>
        <Link href="/entrar">Entrar</Link>
        <Link href="/registo">Criar Conta</Link>
      </>
    );
  }

  const role = (session.user as any).role;

  return (
    <>
      {role === "ADMIN" && (
        <Link href="/admin/dashboard" className="font-medium">
          Gestão
        </Link>
      )}
      <Link href="/conta">A Minha Conta</Link>
      <button onClick={() => signOut({ callbackUrl: "/" })} className="text-tinta-500">
        Sair
      </button>
    </>
  );
}
