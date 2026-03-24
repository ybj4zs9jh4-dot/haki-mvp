import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error:"Non authentifié" }, { status:401 });

  const user = session.user as any;
  const { kit, journeeLabel, orgNom } = await req.json();

  const nom = orgNom ?? user?.organisationNom ?? "votre organisation";

  const prompt = kit === "journees"
    ? `Tu es expert en communication GIS pour les entreprises de Côte d'Ivoire.
Génère des contenus de communication pour ${nom} à l'occasion de : ${journeeLabel}.
Contexte : plateforme Haki GIS CI, ancrée dans le Code du Travail CI 2025.

Réponds UNIQUEMENT avec ce JSON valide, sans markdown, sans backticks, sans commentaires :
{"linkedin":"Post LinkedIn professionnel 150-200 mots ton engagé et institutionnel avec hashtags GIS CI pertinents","facebook":"Post Facebook 100-150 mots ton accessible et communautaire avec 2-3 emojis et hashtags","twitter":"Tweet 240 caractères maximum percutant avec 2 hashtags max","email":"Objet : [objet]\\n\\nCorps du message 150 mots ton RH bienveillant signé Direction des Ressources Humaines de ${nom}","whatsapp":"Message WhatsApp RH 80 mots maximum ton chaleureux avec quelques emojis"}`
    : `Tu es expert en communication GIS pour les entreprises de Côte d'Ivoire.
Génère des contenus de communication pour ${nom} pour présenter son Plan d'Action GIS.
Contexte : l'organisation vient de réaliser son diagnostic GIS sur la plateforme Haki CI et s'engage dans une démarche structurée.

Réponds UNIQUEMENT avec ce JSON valide, sans markdown, sans backticks, sans commentaires :
{"linkedin":"Post LinkedIn 150-200 mots annonçant l'engagement GIS de l'organisation ton institutionnel et fier avec hashtags GIS CI","facebook":"Post Facebook 100-150 mots ton accessible présentation engagement GIS avec emojis et hashtags","twitter":"Tweet 240 caractères max sur l'engagement GIS percutant avec 2 hashtags","email":"Objet : [objet]\\n\\nEmail interne 150 mots présentant le Plan d'Action GIS aux collaborateurs signé DRH de ${nom}","whatsapp":"Message WhatsApp RH 80 mots max informant les collaborateurs de l'engagement GIS"}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{ role:"user", content: prompt }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text ?? "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("Erreur API communication:", e);
    return NextResponse.json({ error:"Erreur génération" }, { status:500 });
  }
}
