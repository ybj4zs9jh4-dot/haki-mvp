import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { genererRequetesVeille } from "@/lib/entreprises-ci";

export const maxDuration = 60;

async function rechercherGoogle(requete: string): Promise<any[]> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;
  if (!apiKey || !cx) return [];
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(requete)}&num=5`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? []).map((item: any) => ({
      titre: item.title,
      url: item.link,
      extrait: item.snippet,
    }));
  } catch { return []; }
}

async function analyserAvecClaude(requete: string, resultsGoogle: any[]): Promise<any[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return [];

  const contexte = resultsGoogle.length > 0
    ? `\nRésultats Google :\n${resultsGoogle.map((r,i) => `${i+1}. ${r.titre}\n   ${r.url}\n   ${r.extrait}`).join("\n\n")}`
    : "";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{
          role: "user",
          content: `Recherche DEI Côte d'Ivoire : "${requete}"${contexte}

Trouve entreprises CI avec actions DEI publiques (genre, autonomisation femme, VIH/Sida Art.4 CT CI, handicap PSH, anti-tribalisme, AGEFOP, RSE).

JSON uniquement :
{"resultats":[{"entreprise":"Nom CI","secteur":"telecoms/banque/energie/agroalimentaire/btp/mining/autre","sourceUrl":"URL","sourceTitre":"Titre","signalDei":"Action DEI concrète max 200 car.","dimension":"DIM1 ou DIM2 ou DIM3 ou DIM4 ou null","scoreConfiance":80}]}`,
        }],
      }),
    });
    if (!response.ok) return [];
    const data = await response.json();
    const text = data.content?.find((c: any) => c.type === "text")?.text ?? "";
    return JSON.parse(text.replace(/```json|```/g, "").trim()).resultats ?? [];
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

    // Sélectionner 3 requêtes seulement pour rester dans le timeout
    const requetes = genererRequetesVeille().sort(() => Math.random() - 0.5).slice(0, 3);

    // Lancer Google en parallèle pour les 3 requêtes
    const resultsGoogle = await Promise.all(requetes.map(r => rechercherGoogle(r)));

    // Lancer Claude en parallèle pour les 3 requêtes
    const resultatsParRequete = await Promise.all(
      requetes.map((r, i) => analyserAvecClaude(r, resultsGoogle[i]))
    );

    // Dédupliquer et insérer
    let totalInseres = 0;
    const vus = new Set<string>();

    for (const resultats of resultatsParRequete) {
      for (const r of resultats) {
        if (!r.entreprise || !r.sourceUrl) continue;
        const cle = `${r.entreprise}||${r.sourceUrl}`;
        if (vus.has(cle)) continue;
        vus.add(cle);

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
        } catch {}
      }
    }

    return NextResponse.json({
      success: true,
      signauxTrouves: totalInseres,
      message: `Veille Google + Claude — ${totalInseres} signaux DEI CI détectés`,
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
    const where: any = {};
    if (searchParams.get("secteur")) where.secteur = searchParams.get("secteur");
    if (searchParams.get("dimension")) where.dimension = searchParams.get("dimension");

    const [veilles, statsSecteurs, derniereVeille, totalSignaux, signauxFiables] = await Promise.all([
      prisma.veilleWebCI.findMany({ where, orderBy: [{ scoreConfiance: "desc" }, { dateVeille: "desc" }], take: 100 }),
      prisma.veilleWebCI.groupBy({ by: ["secteur"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
      prisma.veilleWebCI.findFirst({ orderBy: { dateVeille: "desc" }, select: { dateVeille: true } }),
      prisma.veilleWebCI.count(),
      prisma.veilleWebCI.count({ where: { scoreConfiance: { gte: 75 } } }),
    ]);

    return NextResponse.json({ veilles, statsSecteurs, derniereVeille, stats: { total: totalSignaux, fiables: signauxFiables } });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
