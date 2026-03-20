// src/app/api/sessions/[id]/score/route.ts
// POST — Déclenche le calcul du score MMI-CI
// GET  — Lit le score calculé
// Rôles autorisés : drh, dg, admin_haki

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculerScoreComplet, type ReponseInput } from "@/lib/scoring/bareme";
import { z } from "zod";

// ─── GET — Lire le score ──────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const sessionDiag = await prisma.sessionDiagnostic.findUnique({
      where: { id: params.id },
      include: { scoreMmiCi: true, socleDiagnostic: true },
    });

    if (!sessionDiag) {
      return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    }

    // Vérifier que l'utilisateur appartient à cette organisation
    const user = await prisma.utilisateur.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const isAdminHaki = user.role === "admin_haki";
    if (!isAdminHaki && user.organisationId !== sessionDiag.organisationId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    if (!sessionDiag.scoreMmiCi) {
      return NextResponse.json(
        { error: "Score non encore calculé. Appelez POST /api/sessions/:id/score d'abord." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      score: {
        id: sessionDiag.scoreMmiCi.id,
        scoreGlobal: sessionDiag.scoreMmiCi.scoreGlobal,
        niveauMmi: sessionDiag.scoreMmiCi.niveauMmi,
        scoreDim1Genre: sessionDiag.scoreMmiCi.scoreDim1Genre,
        scoreDim2Handicap: sessionDiag.scoreMmiCi.scoreDim2Handicap,
        scoreDim3Multicult: sessionDiag.scoreMmiCi.scoreDim3Multicult,
        scoreDim4Intergen: sessionDiag.scoreMmiCi.scoreDim4Intergen,
        scoresComposantes: sessionDiag.scoreMmiCi.scoresComposantes,
        calculatedAt: sessionDiag.scoreMmiCi.calculatedAt,
      },
      socle: sessionDiag.socleDiagnostic ? {
        badge: sessionDiag.socleDiagnostic.badgeGlobal,
        alertes: sessionDiag.socleDiagnostic.alertes,
      } : null,
    });

  } catch (error) {
    console.error("[GET /score]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ─── POST — Calculer le score ─────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.utilisateur.findUnique({
      where: { email: session.user.email! },
    });

    if (!user || !["drh", "dg", "admin_haki"].includes(user.role)) {
      return NextResponse.json({ error: "Rôle insuffisant" }, { status: 403 });
    }

    const sessionDiag = await prisma.sessionDiagnostic.findUnique({
      where: { id: params.id },
      include: { reponsesOrg: true },
    });

    if (!sessionDiag) {
      return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    }

    if (!["admin_haki"].includes(user.role) &&
        user.organisationId !== sessionDiag.organisationId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    if (sessionDiag.reponsesOrg.length === 0) {
      return NextResponse.json(
        { error: "Aucune réponse à scorer. Soumettez d'abord les réponses ORGANISATION." },
        { status: 400 }
      );
    }

    // Préparer les réponses pour le moteur de scoring
    const reponsesInput: ReponseInput[] = sessionDiag.reponsesOrg.map(r => ({
      itemCode: r.itemCode,
      valeur: r.valeurBrute,
      nbActions: r.valeurBrute.includes(",")
        ? r.valeurBrute.split(",").filter(Boolean).length
        : undefined,
    }));

    // Calculer le score
    const resultat = calculerScoreComplet(reponsesInput);

    // Upsert dans la base
    const scoreSauve = await prisma.scoreMmiCi.upsert({
      where: { sessionId: params.id },
      create: {
        sessionId: params.id,
        scoreGlobal: resultat.scoreGlobal,
        niveauMmi: resultat.niveauMmi,
        scoreDim1Genre: resultat.scoreDim1Genre,
        scoreDim2Handicap: resultat.scoreDim2Handicap,
        scoreDim3Multicult: resultat.scoreDim3Multicult,
        scoreDim4Intergen: resultat.scoreDim4Intergen,
        scoresComposantes: resultat.scoresComposantes as any,
      },
      update: {
        scoreGlobal: resultat.scoreGlobal,
        niveauMmi: resultat.niveauMmi,
        scoreDim1Genre: resultat.scoreDim1Genre,
        scoreDim2Handicap: resultat.scoreDim2Handicap,
        scoreDim3Multicult: resultat.scoreDim3Multicult,
        scoreDim4Intergen: resultat.scoreDim4Intergen,
        scoresComposantes: resultat.scoresComposantes as any,
        calculatedAt: new Date(),
      },
    });

    // Mettre à jour les scores par item dans reponse_organisation
    await Promise.all(
      Object.entries(resultat.scoresItems).map(([code, { obtenu, max }]) =>
        prisma.reponseOrganisation.updateMany({
          where: { sessionId: params.id, itemCode: code },
          data: { scoreObtenu: obtenu, scoreMax: max },
        })
      )
    );

    return NextResponse.json({
      success: true,
      score: {
        id: scoreSauve.id,
        scoreGlobal: resultat.scoreGlobal,
        niveauMmi: resultat.niveauMmi,
        scoreDim1Genre: resultat.scoreDim1Genre,
        scoreDim2Handicap: resultat.scoreDim2Handicap,
        scoreDim3Multicult: resultat.scoreDim3Multicult,
        scoreDim4Intergen: resultat.scoreDim4Intergen,
        scoresComposantes: resultat.scoresComposantes,
        planActions: resultat.planActions,
      },
    }, { status: 201 });

  } catch (error) {
    console.error("[POST /score]", error);
    return NextResponse.json({ error: "Erreur lors du calcul du score" }, { status: 500 });
  }
}
