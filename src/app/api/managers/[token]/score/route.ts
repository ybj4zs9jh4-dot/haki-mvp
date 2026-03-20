// src/app/api/managers/[token]/score/route.ts
// GET  — Lire son propre score (accessible UNIQUEMENT via le token privé)
// POST — Soumettre les réponses et calculer le score
//
// RÈGLE DE CONFIDENTIALITÉ ABSOLUE :
// Ce score n'est JAMAIS accessible à l'organisation ni à Haki
// Seul le manager lui-même peut y accéder via son token privé

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ─── Schema ───────────────────────────────────────────────────
const ReponsesManagerSchema = z.object({
  // Module 1 — Biais inconscients (9 questions × 4 pts = 36)
  SC01: z.number().min(1).max(4),
  SC02: z.number().min(1).max(4),
  SC03: z.number().min(1).max(4),
  SC04: z.number().min(1).max(4),
  SC05: z.number().min(1).max(4),
  SC06: z.number().min(1).max(4),
  SC07: z.number().min(1).max(4),
  SC08: z.number().min(1).max(4),
  SC09: z.number().min(1).max(4),
  // Module 2 — Recrutement inclusif (9 questions × 4 pts = 36)
  RC01: z.number().min(1).max(4),
  RC02: z.number().min(1).max(4),
  RC03: z.number().min(1).max(4),
  RC04: z.number().min(1).max(4),
  RC05: z.number().min(1).max(4),
  RC06: z.number().min(1).max(4),
  RC07: z.number().min(1).max(4),
  RC08: z.number().min(1).max(4),
  RC09: z.number().min(1).max(4),
  // Module 3 — Management inclusif (10 questions × 4 pts = 40)
  MG01: z.number().min(1).max(4),
  MG02: z.number().min(1).max(4),
  MG03: z.number().min(1).max(4),
  MG04: z.number().min(1).max(4),
  MG05: z.number().min(1).max(4),
  MG06: z.number().min(1).max(4),
  MG07: z.number().min(1).max(4),
  MG08: z.number().min(1).max(4),
  MG09: z.number().min(1).max(4),
  MG10: z.number().min(1).max(4),
  // Plan d'action personnel (optionnel)
  planAction: z.array(z.object({
    action: z.string().max(500),
    delai: z.string().max(50),
    indicateur: z.string().max(200).optional(),
  })).max(3).optional(),
});

// ─── Hash du token pour lookup sécurisé ──────────────────────
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// ─── GET — Lire son score ─────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const tokenHash = hashToken(params.token);

    const lienManager = await prisma.lienManager.findUnique({
      where: { tokenPriveHash: tokenHash },
      include: { scoreManager: true },
    });

    if (!lienManager) {
      return NextResponse.json({ error: "Token invalide" }, { status: 404 });
    }

    if (lienManager.expireAt < new Date() && !lienManager.complete) {
      return NextResponse.json({ error: "Ce lien a expiré" }, { status: 410 });
    }

    if (!lienManager.scoreManager) {
      return NextResponse.json(
        { error: "Score non encore calculé. Soumettez d'abord vos réponses." },
        { status: 404 }
      );
    }

    const score = lienManager.scoreManager;

    // Générer les axes forts et axes de progression
    const axesForts = genererAxes(score, "fort");
    const axesProgression = genererAxes(score, "progression");

    return NextResponse.json({
      // AUCUN identifiant de l'organisation ou du manager dans la réponse
      scoreTotal: score.scoreTotal,
      scoreModule1: score.scoreModule1,
      scoreModule2: score.scoreModule2,
      scoreModule3: score.scoreModule3,
      niveauLabel: getNiveauLabel(score.scoreTotal),
      axesForts,
      axesProgression,
      planAction: score.planAction,
      calculatedAt: score.calculatedAt,
      // Message de confidentialité
      noteConfidentialite: "Ce score est strictement personnel et confidentiel. Il ne sera jamais transmis à votre organisation.",
    });

  } catch (error) {
    console.error("[GET /managers/score]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ─── POST — Soumettre et calculer ─────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const tokenHash = hashToken(params.token);

    const lienManager = await prisma.lienManager.findUnique({
      where: { tokenPriveHash: tokenHash },
    });

    if (!lienManager) {
      return NextResponse.json({ error: "Token invalide" }, { status: 404 });
    }

    if (lienManager.complete) {
      return NextResponse.json(
        { error: "Vous avez déjà soumis votre auto-diagnostic." },
        { status: 409 }
      );
    }

    if (lienManager.expireAt < new Date()) {
      return NextResponse.json({ error: "Ce lien a expiré" }, { status: 410 });
    }

    const body = await req.json();
    const validation = ReponsesManagerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Réponses invalides", details: validation.error.issues },
        { status: 422 }
      );
    }

    const reponses = validation.data;

    // ─── CALCUL DES SCORES PAR MODULE ─────────────────────────
    const module1Keys = ["SC01","SC02","SC03","SC04","SC05","SC06","SC07","SC08","SC09"];
    const module2Keys = ["RC01","RC02","RC03","RC04","RC05","RC06","RC07","RC08","RC09"];
    const module3Keys = ["MG01","MG02","MG03","MG04","MG05","MG06","MG07","MG08","MG09","MG10"];

    const scoreModule1 = module1Keys.reduce(
      (sum, key) => sum + (reponses[key as keyof typeof reponses] as number ?? 0), 0
    );
    const scoreModule2 = module2Keys.reduce(
      (sum, key) => sum + (reponses[key as keyof typeof reponses] as number ?? 0), 0
    );
    const scoreModule3 = module3Keys.reduce(
      (sum, key) => sum + (reponses[key as keyof typeof reponses] as number ?? 0), 0
    );
    const scoreTotal = scoreModule1 + scoreModule2 + scoreModule3;

    // Générer le plan d'action si non fourni
    const planAction = reponses.planAction ?? genererPlanActionAuto(reponses);

    // ─── STOCKAGE — TRANSACTION ATOMIQUE ─────────────────────
    await prisma.$transaction([
      prisma.lienManager.update({
        where: { id: lienManager.id },
        data: { complete: true },
      }),
      prisma.scoreManager.create({
        data: {
          lienManagerId: lienManager.id,
          scoreModule1,
          scoreModule2,
          scoreModule3,
          scoreTotal,
          planAction: planAction as any,
        },
      }),
    ]);

    const axesForts = genererAxesDepuisScores(scoreModule1, scoreModule2, scoreModule3, "fort");
    const axesProgression = genererAxesDepuisScores(scoreModule1, scoreModule2, scoreModule3, "progression");

    return NextResponse.json({
      success: true,
      scoreTotal,
      scoreModule1,
      scoreModule2,
      scoreModule3,
      niveauLabel: getNiveauLabel(scoreTotal),
      axesForts,
      axesProgression,
      planAction,
      noteConfidentialite: "Ce score est strictement personnel et confidentiel. Il ne sera jamais transmis à votre organisation ni à Haki.",
    }, { status: 201 });

  } catch (error) {
    console.error("[POST /managers/score]", error);
    return NextResponse.json({ error: "Erreur lors de la soumission" }, { status: 500 });
  }
}

// ─── Helpers ──────────────────────────────────────────────────

function getNiveauLabel(scoreTotal: number): string {
  if (scoreTotal >= 84) return "Pratiques inclusives avancées (84–112 pts)";
  if (scoreTotal >= 56) return "Bon niveau de conscience DEI (56–83 pts)";
  if (scoreTotal >= 28) return "En progression — axes à renforcer (28–55 pts)";
  return "À construire — formation recommandée (0–27 pts)";
}

function genererAxes(
  score: { scoreModule1: number; scoreModule2: number; scoreModule3: number },
  type: "fort" | "progression"
): string[] {
  return genererAxesDepuisScores(
    score.scoreModule1, score.scoreModule2, score.scoreModule3, type
  );
}

function genererAxesDepuisScores(
  m1: number, m2: number, m3: number,
  type: "fort" | "progression"
): string[] {
  const modules = [
    { label: "Biais inconscients & Stéréotypes CI", score: m1, max: 36 },
    { label: "Recrutement inclusif CI", score: m2, max: 36 },
    { label: "Management inclusif CI", score: m3, max: 40 },
  ].map(m => ({ ...m, pct: Math.round((m.score / m.max) * 100) }));

  if (type === "fort") {
    return modules
      .filter(m => m.pct >= 70)
      .map(m => `${m.label} — ${m.pct}% (${m.score}/${m.max} pts)`);
  } else {
    return modules
      .filter(m => m.pct < 60)
      .map(m => `${m.label} — ${m.pct}% (${m.score}/${m.max} pts)`);
  }
}

function genererPlanActionAuto(
  reponses: z.infer<typeof ReponsesManagerSchema>
): Array<{ action: string; delai: string; indicateur: string }> {
  const plan = [];

  // Identifier les items les plus faibles pour suggérer des actions
  if ((reponses.SC03 ?? 4) <= 2) {
    plan.push({
      action: "Vérifier systématiquement que l'origine ethnique ou régionale n'influence pas mes évaluations de candidats CI",
      delai: "Dès le prochain recrutement",
      indicateur: "Grille d'évaluation standardisée utilisée à 100%",
    });
  }
  if ((reponses.MG09 ?? 4) <= 2) {
    plan.push({
      action: "Définir et appliquer un protocole de réaction aux comportements discriminatoires dans mon équipe",
      delai: "30 jours",
      indicateur: "Protocole rédigé et partagé avec l'équipe",
    });
  }
  if ((reponses.RC03 ?? 4) <= 2) {
    plan.push({
      action: "Mettre en place une grille d'évaluation standardisée pour tous mes entretiens de recrutement",
      delai: "Avant le prochain recrutement",
      indicateur: "Grille créée et utilisée dès le prochain entretien",
    });
  }

  // Plan par défaut si tout va bien
  if (plan.length === 0) {
    plan.push({
      action: "Partager mes bonnes pratiques DEI lors d'un atelier avec d'autres managers de l'organisation",
      delai: "60 jours",
      indicateur: "1 session partagée organisée",
    });
  }

  return plan.slice(0, 3);
}
