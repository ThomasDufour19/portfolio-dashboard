/**
 * POST /api/gmail/scan
 * Déclenche manuellement le scan Gmail.
 * Protégé par cookie de session dashboard.
 *
 * Compatible Vercel Hobby (max 60s) — pour des centaines de candidatures,
 * envisager de découper en batches ou de passer sur un plan Pro (300s).
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { scanGmailReplies } from "@/lib/gmail";

export const maxDuration = 60; // secondes (plan Hobby Vercel)

export async function POST() {
  const cookieStore = await cookies();
  const session = cookieStore.get("dashboard_session");
  if (session?.value !== process.env.SESSION_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const detected = await scanGmailReplies();
    return NextResponse.json({
      success: true,
      count: detected.length,
      detected,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    if (msg === "NOT_CONNECTED") {
      return NextResponse.json(
        { error: "Gmail non connecté. Veuillez d'abord autoriser l'accès." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
