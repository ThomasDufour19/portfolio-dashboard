/**
 * GET /api/gmail/callback
 * Reçoit le code OAuth de Google, échange contre des tokens, stocke en DB.
 */
import { NextResponse } from "next/server";
import { exchangeCodeForTokens, saveTokens } from "@/lib/gmail";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    const msg = error ?? "Code manquant";
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?gmail_error=${encodeURIComponent(msg)}`
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    await saveTokens(tokens);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?gmail_connected=1`
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?gmail_error=${encodeURIComponent(msg)}`
    );
  }
}
