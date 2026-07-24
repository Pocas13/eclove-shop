"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EntrarPage() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [aEnviar, setAEnviar] = useState(false);

  async function submeter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setAEnviar(true);

    const form = new FormData(e.currentTarget);
    const resultado = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    setAEnviar(false);

    if (resultado?.error) {
      setErro(resultado.error === "CredentialsSignin" ? "Email ou password incorretos." : resultado.error);
      return;
    }

    router.push("/conta");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="font-display text-3xl mb-6">Entrar</h1>

      {erro && <p className="mb-4 text-sm text-red-600">{erro}</p>}

      <form onSubmit={submeter} className="space-y-4">
        <input name="email" type="email" placeholder="Email" required className="w-full border border-areia-300 rounded-md p-3" />
        <input name="password" type="password" placeholder="Password" required className="w-full border border-areia-300 rounded-md p-3" />
        <button
          type="submit"
          disabled={aEnviar}
          className="w-full bg-mare-700 text-white py-3 rounded-md disabled:opacity-50"
        >
          {aEnviar ? "A entrar..." : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-sm text-tinta-500">
        Ainda não tens conta?{" "}
        <Link href="/registo" className="underline">
          Cria uma conta
        </Link>
        .
      </p>
    </div>
  );
}
