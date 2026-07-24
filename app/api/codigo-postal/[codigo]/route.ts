import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PostalEntry = {
  localidade?: string;
  designacaoPostal?: string;
  ruas?: string[];
};

type PostalShard = Record<string, PostalEntry>;

export async function GET(_request: Request, context: { params: Promise<{ codigo: string }> }) {
  const { codigo: rawCode } = await context.params;
  const digits = decodeURIComponent(rawCode).replace(/\D/g, "").slice(0, 7);
  const codigo = digits.length === 7 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : "";

  if (!codigo) {
    return NextResponse.json({ valido: false, erro: "Código postal incompleto." }, { status: 400 });
  }

  try {
    const prefix = digits.slice(0, 3);
    const filePath = path.join(process.cwd(), "public", "dados", "codigos-postais", `${prefix}.json`);
    const shard = JSON.parse(await readFile(filePath, "utf8")) as PostalShard;
    const entry = shard[codigo];

    if (!entry) {
      return NextResponse.json({ valido: false, erro: "Código postal não encontrado." }, { status: 404 });
    }

    const ruas = Array.isArray(entry.ruas)
      ? [...new Set(entry.ruas.map((street) => street.trim()).filter(Boolean))]
      : [];
    const cidade = (entry.localidade || entry.designacaoPostal || "").trim();

    return NextResponse.json({
      valido: true,
      codigoPostal: codigo,
      cidade,
      localidade: cidade,
      rua: ruas[0] ?? "",
      ruas,
      fonte: "base-local",
    }, {
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    });
  } catch {
    return NextResponse.json({
      valido: false,
      erro: "A base local de códigos postais não está disponível.",
    }, { status: 500 });
  }
}
