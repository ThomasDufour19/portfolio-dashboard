import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const botStatus = await prisma.botStatus.upsert({
      where: { id: 1 },
      update: { command: "stop", message: "🛑 Arrêt demandé..." },
      create: { id: 1, command: "stop", status: "stopped", message: "🛑 Arrêt demandé..." },
    });
    return NextResponse.json(botStatus);
  } catch (error) {
    return NextResponse.json({ error: "Erreur DB" }, { status: 500 });
  }
}
