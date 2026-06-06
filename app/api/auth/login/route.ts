import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password } = await request.json();

  const correctPassword = process.env.DASHBOARD_PASSWORD;
  const sessionSecret   = process.env.SESSION_SECRET;

  if (!correctPassword || !sessionSecret) {
    return NextResponse.json(
      { error: "Variables d'environnement manquantes" },
      { status: 500 }
    );
  }

  if (password !== correctPassword) {
    // Délai anti-brute-force
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("dashboard_session", sessionSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 jours
    sameSite: "strict",
    path: "/",
  });

  return response;
}
