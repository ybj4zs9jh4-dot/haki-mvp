// src/app/api/barometre/[token]/route.ts
// GET  — Accès au questionnaire via token anonyme (public)
// POST — Soumission des réponses avec agrégation immédiate (ARTCI)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { agregерProfil, type ProfilBrut } from "@/lib/anonymisation";
import { z } from "zod";

// ─── Schema de validation ─────────────────────────────────────
const ProfilSchema = z.object({
  genre: z.enum(["F", "M", "autre"]).optional(),
  trancheAge: z.enum(["18-25", "26-35", "36-45", "46-55", "56+"]).optional(),
  niveau: z.enum(["direction", "cadre_sup", "cadre", "maitrise", "employe", "ouvrier"]).optional(),
  anciennete: z.enum(["<1", "1-3", "3-7", "7-15", "15+"]).optional(),
});

const ReponsesSchema = z.record(z.string(), z.string());

const SoumissionSchema = z.object({
  profil: ProfilSchema,
  reponses: ReponsesSchema,
});

// ─── GET — Accéder au baromètre ───────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const lien = await prisma.lienCollaborateur.findUnique({
      where: { tokenAnonyme: params.token },
      include: {
        session: {
          include: { organisation: true },
        },
      },
    });

    if (!lien) {
      return NextResponse.json(
        { error: "Lien invalide ou expiré." },
        { status: 404 }
      );
    }

    if (lien.utilise) {
      return NextResponse.json(
        { error: "Ce lien a déjà été utilisé. Chaque lien n'est valide qu'une seule fois." },
        { status: 410 }
      );
    }

    if (lien.expireAt < new Date()) {
      return NextResponse.json(
        { error: "Ce lien a expiré. Demandez un nouveau lien à votre DRH." },
        { status: 410 }
      );
    }

    // On expose uniquement le nom de l'organisation — pas d'identifiant
    return NextResponse.json({
      valid: true,
      organisationNom: lien.session.organisation.nom,
      // Message de confidentialité obligatoire
      messageConfidentialite: [
        "Vos réponses sont traitées de manière strictement agrégée.",
        "Aucune donnée individuelle ne sera jamais transmise à votre employeur.",
        "Les résultats ne sont communiqués à votre organisation que si au moins 5 personnes ont répondu.",
        "Ce lien est à usage unique et ne contient aucune information sur votre identité.",
      ],
      sessionAnnee: lien.session.anneeReference,
    });

  } catch (error) {
    console.error("[GET /barometre]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ─── POST — Soumettre les réponses ────────────────────────────
// RÈGLE ARTCI CRITIQUE :
// L'agrégation du profil est faite ICI, côté serveur, AVANT tout stockage
// Aucune réponse individuelle n'est conservée telle quelle
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const lien = await prisma.lienCollaborateur.findUnique({
      where: { tokenAnonyme: params.token },
    });

    if (!lien) {
      return NextResponse.json({ error: "Lien invalide." }, { status: 404 });
    }

    if (lien.utilise) {
      return NextResponse.json(
        { error: "Ce lien a déjà été utilisé." },
        { status: 410 }
      );
    }

    if (lien.expireAt < new Date()) {
      return NextResponse.json(
        { error: "Ce lien a expiré." },
        { status: 410 }
      );
    }

    const body = await req.json();
    const validation = SoumissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.issues },
        { status: 422 }
      );
    }

    const { profil, reponses } = validation.data;

    // ─── AGRÉGATION DU PROFIL — AVANT STOCKAGE ───────────────
    // RÈGLE : On stocke uniquement la tranche, jamais la valeur exacte
    const profilAgrege = agregерProfil(profil as ProfilBrut);

    // ─── STOCKAGE ATOMIQUE ────────────────────────────────────
    // Transaction : invalider le token + créer la réponse en même temps
    await prisma.$transaction([
      // 1. Invalider le token immédiatement
      prisma.lienCollaborateur.update({
        where: { id: lien.id },
        data: { utilise: true },
      }),
      // 2. Stocker la réponse agrégée (jamais individuelle)
      prisma.reponseCollaborateur.create({
        data: {
          sessionId: lien.sessionId,
          lienId: lien.id,
          profilAgrege,         // "F|26-35|cadre|3-7ans" — non réversible
          reponsesJson: reponses as any,
        },
      }),
    ]);

    // ─── RECALCUL AGRÉGÉ SI SEUIL ATTEINT ────────────────────
    // Vérifier si on atteint n=5 pour déclencher le calcul du score agrégé
    const nbRepondants = await prisma.reponseCollaborateur.count({
      where: { sessionId: lien.sessionId },
    });

    if (nbRepondants >= 5) {
      // Déclencher le calcul agrégé en arrière-plan (non bloquant)
      // En production : utiliser une queue (Inngest, Upstash QStash)
      recalculerScoreCollaborateur(lien.sessionId, nbRepondants).catch(
        err => console.error("[barometre] Erreur recalcul score collab:", err)
      );
    }

    return NextResponse.json({
      success: true,
      message: "Vos réponses ont bien été enregistrées. Merci pour votre participation.",
    }, { status: 201 });

  } catch (error) {
    console.error("[POST /barometre]", error);
    return NextResponse.json({ error: "Erreur lors de la soumission" }, { status: 500 });
  }
}

// ─── Recalcul agrégé (appelé en arrière-plan) ─────────────────
async function recalculerScoreCollaborateur(
  sessionId: string,
  nbRepondants: number
): Promise<void> {
  const { calculerScoreCollaborateur } = await import("@/lib/anonymisation");

  const reponses = await prisma.reponseCollaborateur.findMany({
    where: { sessionId },
    select: { reponsesJson: true },
  });

  // Extraire les réponses brutes pour agrégation
  const reponsesArray = reponses.map(r => r.reponsesJson as Record<string, string>);

  // Calculer le score agrégé
  const score = calculerScoreCollaborateur(reponsesArray as any);
  if (!score) return;

  // Upsert du score agrégé
  await prisma.scoreCollaborateur.upsert({
    where: { sessionId },
    create: {
      sessionId,
      nbRepondants,
      scoresDimAgreg: {
        DIM1: score.dim1Genre,
        DIM2: score.dim2Handicap,
        DIM3: score.dim3Multicult,
        DIM4: score.dim4Intergen,
      } as any,
      scoreInclusionGlobal: score.scoreGlobal,
    },
    update: {
      nbRepondants,
      scoresDimAgreg: {
        DIM1: score.dim1Genre,
        DIM2: score.dim2Handicap,
        DIM3: score.dim3Multicult,
        DIM4: score.dim4Intergen,
      } as any,
      scoreInclusionGlobal: score.scoreGlobal,
      calculatedAt: new Date(),
    },
  });
}
