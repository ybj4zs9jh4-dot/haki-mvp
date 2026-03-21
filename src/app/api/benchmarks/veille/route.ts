import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

const SECTEURS_CI = ["banque", "industrie", "ong", "telecoms", "sante", "distribution", "btp", "agriculture"];

const REQUETES_VEILLE = [
  "politique diversité inclusion entreprises Côte d'Ivoire 2024 2025",
  "égalité femmes hommes entreprises Abidjan CI RSE",
  "handicap emploi quota entreprises ivoiriennes",
  "anti-tribalisme recrutement entreprises Côte d'Ivoire",
  "CGECI diversité inclusion Abidjan rapport",
  "ONU Femmes Côte d'Ivoire entreprises engagement genre",
  "rapport RSE entreprises Côte d'Ivoire DEI 2024",
  "charte diversité Abidjan entreprises signataires",
];

async function rechercherSignauxDEI(requete: string): Promise<any[]> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      tools: [{
        type: "web_search_20250305",
        name: "web_search",
      }],
      messages: [{
        role: "user",
        content: `Recherche des informations sur : "${requete}". 
        
Trouve des entreprises basées en Côte d'Ivoire qui communiquent publiquement sur leurs pratiques DEI (Diversité, Équité, Inclusion), égalité de genre, handicap, anti-tribalisme ou inclusion sociale.

Pour chaque résultat pertinent, réponds UNIQUEMENT en JSON valide avec ce format exact :
{
  "resultats": [
    {
      "entreprise": "Nom de l'entreprise CI",
      "secteur": "secteur d'activité parmi : banque/industrie/ong/telecoms/sante/distribution/btp/agriculture/autre",
      "sourceUrl": "URL de la source",
      "sourceTitre": "Titre de la source",
      "signalDei": "Description précise du signal DEI détecté (max 200 caractères)",
      "dimension": "DIM1 ou DIM2 ou DIM3 ou DIM4 ou null",
      "scoreConfiance": 75
    }
  ]
}

Si aucun résultat pertinent CI trouvé, retourne {"resultats": []}.
Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`,
      }],
    }),
  });

  if (!response.ok) return [];

  const data = await response.json();
  const textContent = data.content?.find((c: any) => c.type === "text")?.text ?? "";

  try {
    const clean = textContent.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return parsed.resultats ?? [];
  } catch {
    return [];
  }
}

// POST — Déclencher la veille web CI
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const user = await prisma.utilisateur.findUnique({ where: { email: session.user.email! } });
    if (!user || !["drh","dg","admin_haki"].includes(user.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Vérifier si une veille a déjà été faite ce mois-ci
    const debutMois = new Date();
    debutMois.setDate(1);
    debutMois.setHours(0, 0, 0, 0);

    const veilleRecente = await prisma.veilleWebCI.findFirst({
      where: { dateVeille: { gte: debutMois } },
    });

    if (veilleRecente) {
      return NextResponse.json({
        message: "Veille déjà effectuée ce mois-ci.",
        prochainVeille: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
      }, { status: 200 });
    }

    // Lancer 3 requêtes de veille (pour rester dans le budget temps)
    const requetesSelectionnees = REQUETES_VEILLE.slice(0, 3);
    let totalInseres = 0;

    for (const requete of requetesSelectionnees) {
      const resultats = await rechercherSignauxDEI(requete);

      for (const r of resultats) {
        if (!r.entreprise || !r.sourceUrl) continue;
        try {
          await prisma.veilleWebCI.create({
            data: {
              secteur: r.secteur ?? "autre",
              entreprise: r.entreprise,
              sourceUrl: r.sourceUrl,
              sourceTitre: r.sourceTitre ?? "",
              signalDei: r.signalDei ?? "",
              dimension: r.dimension ?? null,
              scoreConfiance: Math.min(100, Math.max(0, r.scoreConfiance ?? 50)),
              statut: "non_verifie",
            },
          });
          totalInseres++;
        } catch { /* doublon ignoré */ }
      }
    }

    return NextResponse.json({
      success: true,
      signauxTrouves: totalInseres,
      message: `Veille terminée — ${totalInseres} signaux DEI CI détectés`,
    });

  } catch (e: any) {
    return NextResponse.json({ error: "Erreur veille", details: e.message }, { status: 500 });
  }
}

// GET — Lire les résultats de veille
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const secteur = searchParams.get("secteur");
    const dimension = searchParams.get("dimension");

    const where: any = {};
    if (secteur) where.secteur = secteur;
    if (dimension) where.dimension = dimension;

    const veilles = await prisma.veilleWebCI.findMany({
      where,
      orderBy: [{ scoreConfiance: "desc" }, { dateVeille: "desc" }],
      take: 50,
    });

    // Stats par secteur
    const statsSecteurs = await prisma.veilleWebCI.groupBy({
      by: ["secteur"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });

    // Dernière veille
    const derniereVeille = await prisma.veilleWebCI.findFirst({
      orderBy: { dateVeille: "desc" },
      select: { dateVeille: true },
    });

    return NextResponse.json({ veilles, statsSecteurs, derniereVeille });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
