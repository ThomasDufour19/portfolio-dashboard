/**
 * GET /api/gmail/status
 * Retourne si Gmail est connecté et l'adresse email connectée.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("dashboard_session");
  if (session?.value !== process.env.SESSION_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const token = await prisma.gmailToken.findUnique({ where: { id: 1 } });
  if (!token) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: true,
    email: token.email,
    updatedAt: token.updatedAt,
  });
}
