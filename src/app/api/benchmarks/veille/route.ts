
import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

const REQUETES_VEILLE = [

  // ── Requêtes générales DEI CI ──────────────────────────────

  "politique, diversité, inclusion, entreprises, Côte d'Ivoire, 2024, 2025, 2026",

  "égalité, femmes, autonomisation, hommes, entreprises, Abidjan, CI, RSE, rapport annuel",

  "charte, genre, Côte d'Ivoire, entreprises signataires, CGECI",

  "rapport RSE, entreprises, Côte d'Ivoire, DEI, genre, inclusion, 2024, 2025, 2026",

  // ── Requêtes spécifiques dimensions Haki ───────────────────

  "VIH Sida, emploi, non-discrimination, entreprises, Côte d'Ivoire, Art 4 Code Travail",

  "handicap, emploi, PSH ,quota, 5%, entreprises ivoiriennes, inclusion",

  "AGEFOP, AEJ, apprentissage, jeunes, entreprises, Côte d'Ivoire, formation professionnelle",

  "recrutement, diversité, ethnique, entreprises, Abidjan, CI",

  "congé, maternité, paternité, politique, parentalité, entreprises, Côte d'Ivoire",

  "médecine travail, CNPS, sécurité, santé, entreprises ivoiriennes",

  // ── Entreprises CI connues ─────────────────────────────────

  "MTN, Côte d'Ivoire, diversité, inclusion, genre, RSE, rapport",

  "Orange CI, Côte d'Ivoire, politique, genre, égalité, femmes, emploi",

  "SIB, BICICI, Société Général CI, Ecobank CI, BNI, UBA, AFG Bank, Orabank CI, Coris Bank, Djamo, Wave, Bridge Bank, Advans, Baobab,  banque, microfinance, fintech, Côte d'Ivoire, genre, diversité, inclusion, social, RSE, rapport annuel",

  "Total Energies CI, Shell CI, Petro Ivoire, Côte d'Ivoire, RSE, genre, inclusion, handicap",

  "Nestlé, Unilever, Prosuma, Côte d'Ivoire, diversité, inclusion, genre, rapport",

  "SIFCA, SUCRIVOIRE,, Côte d'Ivoire, RSE, genre, inclusion, travailleurs",

  "CIE, SODECI, Côte d'Ivoire, responsabilité sociale, genre, inclusion",

  "Air Côte d'Ivoire, diversité, inclusion, genre, politique, RH",

  // ── Requêtes en anglais — bailleurs et organisations ───────

  "AFD Côte d'Ivoire, gender, equality, private sector, report, 2024, 2025, 2026",

  "IFC, Worldbank, gender, diversity, Côte d'Ivoire, private sector, inclusion",

  "ILO, OIT, Côte d'Ivoire, workplace, inclusion, diversity, gender, report",

  "ONU Femmes, UN Women, Cote d Ivoire, entreprises, engagement, genre, rapport",

  "World Bank, Côte d'Ivoire, gender, private sector, employment, 2024",

  "USAID Côte d'Ivoire women economic empowerment private sector",

  "gender equality diversity Abidjan companies CSR annual report 2024",

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

      max_tokens: 1500,

      tools: [{ type: "web_search_20250305", name: "web_search" }],

      messages: [{

        role: "user",

        content: `Recherche des informations sur : "${requete}".

Trouve des entreprises basées en Côte d'Ivoire qui communiquent publiquement sur leurs pratiques DEI (Diversité, Équité, Inclusion), égalité de genre, handicap, anti-tribalisme, VIH/Sida au travail, formation professionnelle AGEFOP, ou inclusion sociale.

Pour chaque résultat pertinent trouvé, réponds UNIQUEMENT en JSON valide :

{

  "resultats": [

    {

      "entreprise": "Nom exact de l'entreprise CI",

      "secteur": "un parmi : banque/industrie/ong/telecoms/sante/distribution/btp/agriculture/energie/agroalimentaire/autre",

      "sourceUrl": "URL exacte de la source",

      "sourceTitre": "Titre exact de l'article ou du document",

      "signalDei": "Description précise du signal DEI détecté — quelle action concrète, quelle politique, quel engagement (max 200 caractères)",

      "dimension": "DIM1 (genre/VIH) ou DIM2 (handicap) ou DIM3 (multiculturalité) ou DIM4 (intergénérationnel/formation) ou null",

      "scoreConfiance": 75

    }

  ]

}

Score de confiance :

- 85-100 : Source officielle vérifiable (site entreprise, rapport RSE signé, communiqué officiel)

- 60-84 : Source journalistique fiable (Fraternité Matin, Businesstimes CI, Reuters Africa)

- 40-59 : Source secondaire ou blog non officiel

- 0-39 : Source non vérifiable ou douteuse

Si aucun résultat CI pertinent trouvé, retourne {"resultats": []}.

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

      const prochainVeille = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);

      return NextResponse.json({

        message: `Veille déjà effectuée ce mois-ci. Prochaine veille disponible le ${prochainVeille.toLocaleDateString("fr-FR")}.`,

        prochainVeille: prochainVeille.toISOString(),

      }, { status: 200 });

    }

    // Sélectionner 5 requêtes aléatoirement parmi toutes les requêtes

    const requetesAleatoires = REQUETES_VEILLE

      .sort(() => Math.random() - 0.5)

      .slice(0, 5);

    let totalInseres = 0;

    const signauxParRequete: Record<string, number> = {};

    for (const requete of requetesAleatoires) {

      const resultats = await rechercherSignauxDEI(requete);

      signauxParRequete[requete.slice(0, 40)] = resultats.length;

      for (const r of resultats) {

        if (!r.entreprise || !r.sourceUrl) continue;

        try {

          // Éviter les doublons (même entreprise + même URL)

          const existant = await prisma.veilleWebCI.findFirst({

            where: { AND: [{ entreprise: r.entreprise }, { sourceUrl: r.sourceUrl }] },

          });

          if (existant) continue;

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

      requetesExecutees: requetesAleatoires.length,

      message: `Veille terminée — ${totalInseres} nouveaux signaux DEI CI détectés sur ${requetesAleatoires.length} recherches`,

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

      take: 100,

    });

    const statsSecteurs = await prisma.veilleWebCI.groupBy({

      by: ["secteur"],

      _count: { id: true },

      orderBy: { _count: { id: "desc" } },

    });

    const derniereVeille = await prisma.veilleWebCI.findFirst({

      orderBy: { dateVeille: "desc" },

      select: { dateVeille: true },

    });

    // Stats globales

    const totalSignaux = await prisma.veilleWebCI.count();

    const signauxFiables = await prisma.veilleWebCI.count({ where: { scoreConfiance: { gte: 75 } } });

    return NextResponse.json({

      veilles,

      statsSecteurs,

      derniereVeille,

      stats: { total: totalSignaux, fiables: signauxFiables },

    });

  } catch {

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });

  }

}

