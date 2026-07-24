import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { decryptSecret, encryptSecret } from "./crypto";
import type { SageToken } from "./types";

const AUTH_URL = "https://www.sageone.com/oauth2/auth/central";
const TOKEN_URL = "https://oauth.accounting.sage.com/token";

function credentials() {
  const clientId = process.env.SAGE_CLIENT_ID;
  const clientSecret = process.env.SAGE_CLIENT_SECRET;
  const redirectUri = process.env.SAGE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) throw new Error("Sage OAuth incompleto: defina SAGE_CLIENT_ID, SAGE_CLIENT_SECRET e SAGE_REDIRECT_URI.");
  return { clientId, clientSecret, redirectUri };
}

export function createOAuthState() {
  const nonce = crypto.randomBytes(24).toString("base64url");
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET em falta.");
  const signature = crypto.createHmac("sha256", secret).update(nonce).digest("base64url");
  return `${nonce}.${signature}`;
}

export function validateOAuthState(state: string) {
  const [nonce, signature] = state.split(".");
  const secret = process.env.NEXTAUTH_SECRET;
  if (!nonce || !signature || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(nonce).digest("base64url");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function authorizationUrl(state: string) {
  const { clientId, redirectUri } = credentials();
  const url = new URL(AUTH_URL);
  url.searchParams.set("filter", "apiv3.1");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "full_access");
  url.searchParams.set("state", state);
  return url.toString();
}

async function tokenRequest(params: URLSearchParams): Promise<SageToken> {
  const { clientId, clientSecret } = credentials();
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: params,
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Sage OAuth ${response.status}: ${payload.error_description ?? payload.error ?? "falhou"}`);
  return payload as SageToken;
}

export async function exchangeCode(code: string) {
  const { redirectUri } = credentials();
  return tokenRequest(new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri }));
}

export async function refreshToken(refreshTokenValue: string) {
  return tokenRequest(new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshTokenValue }));
}

export async function saveTokens(tokens: SageToken, businessId?: string, businessName?: string) {
  const expiresAt = new Date(Date.now() + Math.max(60, tokens.expires_in - 30) * 1000);
  return prisma.sageConnection.upsert({
    where: { id: "principal" },
    create: {
      id: "principal",
      accessToken: encryptSecret(tokens.access_token),
      refreshToken: encryptSecret(tokens.refresh_token),
      expiresAt,
      scope: tokens.scope,
      businessId,
      businessName,
    },
    update: {
      accessToken: encryptSecret(tokens.access_token),
      refreshToken: encryptSecret(tokens.refresh_token),
      expiresAt,
      scope: tokens.scope,
      ...(businessId ? { businessId } : {}),
      ...(businessName ? { businessName } : {}),
      lastError: null,
    },
  });
}

export async function getValidAccessToken() {
  const connection = await prisma.sageConnection.findUnique({ where: { id: "principal" } });
  if (!connection) throw new Error("Sage ainda não está ligado. Use Administração → Sage → Ligar Sage.");
  if (connection.expiresAt.getTime() > Date.now() + 30_000) return { token: decryptSecret(connection.accessToken), connection };
  try {
    const refreshed = await refreshToken(decryptSecret(connection.refreshToken));
    const saved = await saveTokens(refreshed, connection.businessId ?? undefined, connection.businessName ?? undefined);
    return { token: refreshed.access_token, connection: saved };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.sageConnection.update({ where: { id: "principal" }, data: { lastError: message } });
    throw error;
  }
}
