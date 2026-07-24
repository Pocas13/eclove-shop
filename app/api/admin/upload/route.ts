export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { cloudinaryConfigured, uploadProductImage } from "@/lib/cloudinary";

const TIPOS = new Set(["image/jpeg", "image/png", "image/webp"]);
const LIMITE_BYTES = 8 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ erro: "Sem permissões." }, { status: 403 });
  const formData = await req.formData();
  const ficheiro = formData.get("ficheiro");
  if (!(ficheiro instanceof File)) return NextResponse.json({ erro: "Nenhum ficheiro enviado." }, { status: 400 });
  if (!TIPOS.has(ficheiro.type)) return NextResponse.json({ erro: "Formato não permitido. Utilize JPG, PNG ou WebP." }, { status: 415 });
  if (ficheiro.size > LIMITE_BYTES) return NextResponse.json({ erro: "A imagem não pode ultrapassar 8 MB." }, { status: 413 });

  try {
    if (cloudinaryConfigured()) {
      const uploaded = await uploadProductImage(ficheiro);
      return NextResponse.json({ ...uploaded, provider: "cloudinary" }, { status: 201 });
    }
    if (process.env.NODE_ENV === "production") return NextResponse.json({ erro: "O armazenamento de imagens não está configurado. Adicione as variáveis CLOUDINARY_* na Vercel." }, { status: 503 });
    const extensao = ficheiro.type === "image/png" ? "png" : ficheiro.type === "image/webp" ? "webp" : "jpg";
    const base = ficheiro.name.replace(/\.[^.]+$/, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-").slice(0, 70) || "produto";
    const nomeSeguro = `${Date.now()}-${base}.${extensao}`;
    const pasta = path.join(process.cwd(), "public", "uploads");
    await mkdir(pasta, { recursive: true });
    await writeFile(path.join(pasta, nomeSeguro), Buffer.from(await ficheiro.arrayBuffer()));
    return NextResponse.json({ url: `/uploads/${nomeSeguro}`, provider: "local" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ erro: error instanceof Error ? error.message : "Não foi possível guardar a imagem." }, { status: 502 });
  }
}
