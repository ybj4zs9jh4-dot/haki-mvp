import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const tokenHash = hashToken(params.token);
    const lien = await prisma.lienManager.findUnique({
      where: { tokenPriveHash: tokenHash },
      include: { session: { include: { organisation: true } } },
    });

    if (!lien) return NextResponse.json({ error: "Lien invalide ou expiré." }, { status: 404 });
    if (lien.expireAt < new Date() && !lien.complete) return NextResponse.json({ error: "Ce lien a expiré." }, { status: 410 });

    return NextResponse.json({
      valid: true,
      organisationNom: lien.session.organisation.nom,
      complete: lien.complete,
      messageConfidentialite: [
        "Vos réponses et votre score sont strictement personnels.",
        "Ils ne seront jamais transmis à votre organisation ni à Haki.",
        "Seul vous pouvez accéder à vos résultats via ce lien.",
      ],
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
