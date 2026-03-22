import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { genererRequetesVeille } from "@/lib/entreprises-ci";

export const maxDuration = 60;

// ─── SOURCE 1 : Google Custom Search ─────────────────────────
async function rechercherGoogle(requete: string): Promise<any[]> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;
  if (!apiKey || !cx) return [];

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(requete)}&num=5&lr=lang_fr`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? []).map((item: any) => ({
      titre: item.title,
      url: item.link,
      extrait: item.snippet,
      source: "google",
    }));
  } catch { return []; }
}

// ─── SOURCE 2 : Claude — Analyse et extraction structurée ────
async function analyserAvecClaude(
  requete: string,
  resultsGoogle: any[]
): Promise<any[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return [];

  const contexteGoogle = resultsGoogle.length > 0
    ? `\n\nRésultats Google déjà trouvés pour cette requête :\n${resultsGoogle.map((r, i) => `${i+1}. ${r.titre}\n   URL: ${r.url}\n   Extrait: ${r.extrait}`).join("\n\n")}`
    : "";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{
          role: "user",
          content: `Recherche et analyse des signaux DEI pour : "${requete}"${contexteGoogle}

Trouve des entreprises basées en Côte d'Ivoire qui communiquent publiquement sur :
- Égalité femmes/hommes, autonomisation de la femme, genre, parité, leadership féminin
- VIH/Sida non-discrimination emploi (Art. 4 CT CI)
- Handicap PSH inclusion emploi quota
- Anti-tribalisme, diversité ethnique, cohésion sociale CI
- Formation professionnelle AGEFOP, emploi des jeunes, FDFP
- RSE, développement durable, rapport GRI, ODD

${resultsGoogle.length > 0 ? "Analyse les résultats Google ci-dessus ET fais des recherches complémentaires." : "Fais des recherches approfondies."}

Réponds UNIQUEMENT en JSON valide :
{
  "resultats": [
    {
      "entreprise": "Nom exact entreprise CI",
      "secteur": "banque/telecoms/energie/agroalimentaire/btp/distribution/sante/mining/ong/autre",
      "sourceUrl": "URL exacte vérifiable",
      "sourceTitre": "Titre exact source",
      "signalDei": "Action DEI concrète détectée (max 200 car.)",
      "dimension": "DIM1 ou DIM2 ou DIM3 ou DIM4 ou null",
      "scoreConfiance": 80,
      "sourceType": "google ou claude"
    }
  ]
}

Score confiance : 85-100 source officielle · 60-84 presse sérieuse CI · 40-59 secondaire · 0-39 non vérifiable.
JSON uniquement, sans texte avant ou après.`,
        }],
      }),
    });

    if (!response.ok) return [];
    const data = await response.json();
    const text = data.content?.find((c: any) => c.type === "text")?.text ?? "";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean).resultats ?? [];
  } catch { return []; }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const user = await prisma.utilisateur.findUnique({ where: { email: session.user.email! } });
    if (!user || !["drh","dg","admin_haki"].includes(user.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const debutMois = new Date();
    debutMois.setDate(1); debutMois.setHours(0,0,0,0);
    const veilleRecente = await prisma.veilleWebCI.findFirst({ where: { dateVeille: { gte: debutMois } } });
    if (veilleRecente) {
      const next = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
      return NextResponse.json({ message: `Veille déjà effectuée ce mois-ci. Prochaine : ${next.toLocaleDateString("fr-FR")}.` });
    }

    const toutesRequetes = genererRequetesVeille();
    const requetes = toutesRequetes.sort(() => Math.random() - 0.5).slice(0, 5);

    let totalInseres = 0;
    let totalGoogle = 0;
    let totalClaude = 0;

    for (const requete of requetes) {
      // Étape 1 — Google cherche les sources
      const resultsGoogle = await rechercherGoogle(requete);
      totalGoogle += resultsGoogle.length;

      // Étape 2 — Claude analyse + enrichit avec ses propres recherches
      const resultats = await analyserAvecClaude(requete, resultsGoogle);

      for (const r of resultats) {
        if (!r.entreprise || !r.sourceUrl) continue;
        try {
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
          if (r.sourceType === "google") totalGoogle++;
          else totalClaude++;
        } catch {}
      }
    }

    return NextResponse.json({
      success: true,
      signauxTrouves: totalInseres,
      requetesExecutees: requetes.length,
      requetesTotal: toutesRequetes.length,
      sources: { google: totalGoogle, claude: totalClaude },
      message: `Veille Google + Claude terminée — ${totalInseres} signaux DEI CI sur ${requetes.length} recherches`,
    });

  } catch (e: any) {
    return NextResponse.json({ error: "Erreur veille", details: e.message }, { status: 500 });
  }
}

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

    const totalSignaux = await prisma.veilleWebCI.count();
    const signauxFiables = await prisma.veilleWebCI.count({ where: { scoreConfiance: { gte: 75 } } });

    return NextResponse.json({
      veilles, statsSecteurs, derniereVeille,
      stats: { total: totalSignaux, fiables: signauxFiables },
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
