import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { authorizationUrl, createOAuthState } from "@/lib/integracoes/sage/oauth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.redirect(new URL("/entrar", process.env.NEXTAUTH_URL));
  const state = createOAuthState();
  const response = NextResponse.redirect(authorizationUrl(state));
  response.cookies.set("sage_oauth_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 600, path: "/" });
  return response;
}
