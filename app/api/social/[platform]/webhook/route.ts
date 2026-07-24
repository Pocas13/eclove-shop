export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (token && token === process.env.SOCIAL_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge || "ok");
  }

  return NextResponse.json({ erro: "Token inválido" }, { status: 403 });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;
  const payload = await req.json();
  console.info("Webhook social", platform, payload);
  return NextResponse.json({ recebido: true });
}
