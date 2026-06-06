import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const botStatus = await prisma.botStatus.upsert({
      where: { id: 1 },
      update: { command: "start", message: "⏳ Commande envoyée au daemon..." },
      create: { id: 1, command: "start", status: "stopped", message: "⏳ Commande envoyée au daemon..." },
    });
    return NextResponse.json(botStatus);
  } catch (error) {
    return NextResponse.json({ error: "Erreur DB" }, { status: 500 });
  }
}
