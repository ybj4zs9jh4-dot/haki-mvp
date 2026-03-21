import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { envoyerLienManager } from "@/lib/email";
import { z } from "zod";

export const maxDuration = 30;

const Schema = z.object({
  dateClotureMgr: z.string().optional(),
});

// GET — stats complètes managers
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const user = await prisma.utilisateur.findUnique({ where: { email: session.user.email! } });
    const sessionDiag = await prisma.sessionDiagnostic.findUnique({
      where: { id: params.id },
      include: { parametres: true },
    });
    if (!sessionDiag || (user?.role !== "admin_haki" && user?.organisationId !== sessionDiag.organisationId)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const liens = await prisma.lienManager.findMany({
      where: { sessionId: params.id },
      include: {
        manager: { select: { email: true } },
        scoreManager: { select: { scoreTotal: true, calculatedAt: true } },
      },
    });

    const stats = {
      total: liens.length,
      completes: liens.filter(l => l.complete).length,
      enAttente: liens.filter(l => !l.complete && l.expireAt > new Date()).length,
      expires: liens.filter(l => l.expireAt <= new Date() && !l.complete).length,
      tauxCompletion: liens.length > 0 ? Math.round((liens.filter(l => l.complete).length / liens.length) * 100) : 0,
      dateClotureMgr: sessionDiag.parametres?.dateClotureMgr ?? null,
      managersEnAttente: liens.filter(l => !l.complete && l.expireAt > new Date()).map(l => ({
        id: l.id,
        email: l.manager.email,
        expireAt: l.expireAt,
      })),
    };

    return NextResponse.json({ stats });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH — mettre à jour la date de clôture
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const user = await prisma.utilisateur.findUnique({ where: { email: session.user.email! } });
    if (!user || !["drh","admin_haki"].includes(user.role)) {
      return NextResponse.json({ error: "Réservé au DRH" }, { status: 403 });
    }

    const { dateClotureMgr } = Schema.parse(await req.json());

    await prisma.parametreSession.upsert({
      where: { sessionId: params.id },
      create: { sessionId: params.id, dateClotureMgr: dateClotureMgr ? new Date(dateClotureMgr) : null },
      update: { dateClotureMgr: dateClotureMgr ? new Date(dateClotureMgr) : null },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST — envoyer rappel aux managers non complétés
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const user = await prisma.utilisateur.findUnique({ where: { email: session.user.email! } });
    if (!user || !["drh","admin_haki"].includes(user.role)) {
      return NextResponse.json({ error: "Réservé au DRH" }, { status: 403 });
    }

    const sessionDiag = await prisma.sessionDiagnostic.findUnique({
      where: { id: params.id },
      include: { organisation: true },
    });
    if (!sessionDiag) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://haki-mvp.vercel.app";

    // Trouver les managers non complétés avec token valide
    const liens = await prisma.lienManager.findMany({
      where: { sessionId: params.id, complete: false, expireAt: { gt: new Date() } },
      include: { manager: { select: { email: true } } },
    });

    if (liens.length === 0) {
      return NextResponse.json({ message: "Tous les managers ont complété leur diagnostic.", envoyes: 0 });
    }

    // Récupérer les tokens en clair depuis la base — impossible car hashés
    // On crée de nouveaux liens pour le rappel
    const { createHash, randomUUID } = await import("crypto");
    let envoyes = 0;
    let erreurs = 0;

    for (const lien of liens) {
      const newToken = randomUUID();
      const newHash = createHash("sha256").update(newToken).digest("hex");
      const expireAt = new Date();
      expireAt.setDate(expireAt.getDate() + 14); // 14 jours pour le rappel

      // Invalider l'ancien lien et créer un nouveau
      await prisma.lienManager.update({ where: { id: lien.id }, data: { expireAt: new Date() } });
      await prisma.lienManager.create({
        data: { sessionId: params.id, managerUserId: lien.managerUserId, tokenPriveHash: newHash, expireAt },
      });

      const url = `${appUrl}/managers/${newToken}`;
      const ok = await envoyerLienManager(lien.manager.email, url, sessionDiag.organisation.nom);
      if (ok) envoyes++; else erreurs++;
    }

    return NextResponse.json({ envoyes, erreurs, total: liens.length });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
