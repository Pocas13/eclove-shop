import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";

// POST /api/admin/upload — recebe um ficheiro (multipart/form-data, campo "ficheiro") e devolve o URL público
// Nota: guarda localmente em /public/uploads, o que funciona em dev. Em produção (ex: Vercel),
// o sistema de ficheiros não é persistente — troca para Cloudinary, S3 ou UploadThing.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ erro: "Sem permissões." }, { status: 403 });
  }

  const formData = await req.formData();
  const ficheiro = formData.get("ficheiro") as File | null;
  if (!ficheiro) return NextResponse.json({ erro: "Nenhum ficheiro enviado." }, { status: 400 });

  const bytes = await ficheiro.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const nomeSeguro = `${Date.now()}-${ficheiro.name.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;
  const caminho = path.join(process.cwd(), "public", "uploads", nomeSeguro);

  await writeFile(caminho, buffer);

  return NextResponse.json({ url: `/uploads/${nomeSeguro}` }, { status: 201 });
}
