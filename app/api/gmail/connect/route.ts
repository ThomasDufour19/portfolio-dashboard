/**
 * GET /api/gmail/connect
 * Redirige Thomas vers le consentement OAuth Google.
 * Protégé par cookie de session dashboard.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildAuthUrl } from "@/lib/gmail";

export async function GET() {
  // Vérification session dashboard
  const cookieStore = await cookies();
  const session = cookieStore.get("dashboard_session");
  if (session?.value !== process.env.SESSION_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const url = buildAuthUrl();
  return NextResponse.redirect(url);
}
