import { NextResponse } from "next/server";
import { exchangeCode, saveTokens, validateOAuthState } from "@/lib/integracoes/sage/oauth";
import { SageClient, sageItems } from "@/lib/integracoes/sage/client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") || "";
  const cookieState = request.headers.get("cookie")?.match(/(?:^|; )sage_oauth_state=([^;]+)/)?.[1];
  const base = process.env.NEXTAUTH_URL || url.origin;
  if (!code || !cookieState || decodeURIComponent(cookieState) !== state || !validateOAuthState(state)) return NextResponse.redirect(new URL("/admin/integracoes/sage?erro=oauth_state", base));
  try {
    const tokens = await exchangeCode(code);
    await saveTokens(tokens);
    const businessesPayload = await new SageClient().request<any>("/businesses");
    const businesses = sageItems<any>(businessesPayload);
    const preferredId = process.env.SAGE_BUSINESS_ID;
    const business = businesses.find((item) => String(item.id) === preferredId) ?? businesses[0];
    if (!business?.id) throw new Error("Não foi encontrada nenhuma empresa Sage acessível por esta conta.");
    await saveTokens(tokens, String(business.id), String(business.name ?? business.displayed_as ?? "Empresa Sage"));
    const response = NextResponse.redirect(new URL("/admin/integracoes/sage?ligado=1", base));
    response.cookies.delete("sage_oauth_state");
    return response;
  } catch (error) {
    console.error("Sage OAuth callback", error);
    return NextResponse.redirect(new URL(`/admin/integracoes/sage?erro=${encodeURIComponent(error instanceof Error ? error.message : "oauth")}`, base));
  }
}
