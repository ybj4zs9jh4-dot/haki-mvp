"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────
type Kit = "journees" | "plan_action";
type Reseau = "linkedin" | "facebook" | "twitter" | "email" | "whatsapp";
type Niveau = "auto" | "sur_mesure";

interface ContenuGenere {
  linkedin: string;
  facebook: string;
  twitter: string;
  email: string;
  whatsapp: string;
}

const JOURNEES_DEI = [
  { id:"8mars",    label:"8 Mars — Journée des Femmes",          emoji:"♀️" },
  { id:"1mai",     label:"1er Mai — Fête du Travail CI",          emoji:"✊" },
  { id:"haki",     label:"Haki DEI Month — Octobre",             emoji:"🏆" },
  { id:"vbg",      label:"16 jours d'activisme — VBG",           emoji:"🟠" },
  { id:"sida",     label:"1er Décembre — Journée Mondiale Sida", emoji:"🔴" },
  { id:"psh",      label:"3 Décembre — Journée Int'l PSH",       emoji:"♿" },
  { id:"droits",   label:"10 Décembre — Droits de l'Homme",      emoji:"🌐" },
  { id:"travail",  label:"28 Avril — Sécurité & Santé au Travail",emoji:"🦺" },
];

const RESEAUX: { id: Reseau; label: string; emoji: string; maxChars?: number }[] = [
  { id:"linkedin",  label:"LinkedIn",  emoji:"💼", maxChars:3000 },
  { id:"facebook",  label:"Facebook",  emoji:"📘", maxChars:2000 },
  { id:"twitter",   label:"Twitter/X", emoji:"🐦", maxChars:280  },
  { id:"email",     label:"Email interne", emoji:"📧" },
  { id:"whatsapp",  label:"WhatsApp RH",   emoji:"💬", maxChars:500 },
];

export default function CommunicationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as any;

  // États
  const [kit, setKit] = useState<Kit>("journees");
  const [journeeId, setJourneeId] = useState("8mars");
  const [niveau, setNiveau] = useState<Niveau>("auto");
  const [reseau, setReseau] = useState<Reseau>("linkedin");
  const [loading, setLoading] = useState(false);
  const [contenu, setContenu] = useState<ContenuGenere | null>(null);
  const [copie, setCopie] = useState<string>("");
  const [erreur, setErreur] = useState<string>("");

  // Formulaire sur mesure
  const [contexte, setContexte] = useState("");
  const [demandeEnvoyee, setDemandeEnvoyee] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion");
  }, [status, router]);

  if (status === "loading") return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh" }}>
      <div style={{ color:"#1A237E", fontSize:15 }}>Chargement...</div>
    </div>
  );

  async function genererContenu() {
    setLoading(true);
    setErreur("");
    setContenu(null);

    const journee = JOURNEES_DEI.find(j => j.id === journeeId);
    const orgNom = user?.organisationNom ?? "votre organisation";

    const prompt = kit === "journees"
      ? `Tu es expert en communication DEI pour les entreprises de Côte d'Ivoire.
Génère des contenus de communication pour ${orgNom} à l'occasion de : ${journee?.label}.
Le contexte : plateforme Haki DEI CI, ancrée dans le Code du Travail CI 2025.

Génère exactement ce JSON (sans markdown, sans backticks) :
{
  "linkedin": "Post LinkedIn professionnel 150-200 mots, ton engagé et institutionnel, hashtags DEI CI pertinents",
  "facebook": "Post Facebook 100-150 mots, ton plus accessible et communautaire, 2-3 emojis, hashtags",
  "twitter": "Tweet 240 caractères maximum, percutant, 2 hashtags max",
  "email": "Email interne objet + corps 150 mots, ton RH bienveillant, signé Direction des Ressources Humaines de ${orgNom}",
  "whatsapp": "Message WhatsApp RH 80 mots maximum, ton chaleureux, quelques emojis"
}`
      : `Tu es expert en communication DEI pour les entreprises de Côte d'Ivoire.
Génère des contenus de communication pour ${orgNom} pour présenter son Plan d'Action DEI.
Le contexte : l'organisation vient de réaliser son diagnostic DEI sur la plateforme Haki CI et s'engage dans une démarche structurée.

Génère exactement ce JSON (sans markdown, sans backticks) :
{
  "linkedin": "Post LinkedIn 150-200 mots annonçant l'engagement DEI de l'organisation, ton institutionnel et fier, hashtags DEI CI",
  "facebook": "Post Facebook 100-150 mots, ton accessible, présentation de l'engagement DEI, emojis, hashtags",
  "twitter": "Tweet 240 caractères max sur l'engagement DEI, percutant, 2 hashtags",
  "email": "Email interne objet + corps 150 mots présentant le Plan d'Action DEI aux collaborateurs, signé DRH de ${orgNom}",
  "whatsapp": "Message WhatsApp RH 80 mots max informant les collaborateurs de l'engagement DEI"
}`;

    try {
      const res = await fetch("/api/communication", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kit,
        journeeLabel: journee?.label ?? "",
        orgNom: user?.organisationNom ?? "",
      }),
    });
    const parsed = await res.json();
    if (parsed.error) throw new Error(parsed.error);
    setContenu(parsed);
    } catch {
      setErreur("Erreur lors de la génération. Réessaie dans quelques secondes.");
    }
    setLoading(false);
  }

  async function envoyerDemandeSurMesure() {
    if (!contexte.trim()) { setErreur("Merci d'ajouter un contexte pour votre demande."); return; }
    setDemandeEnvoyee(true);
  }

  function copierTexte(texte: string, id: string) {
    navigator.clipboard.writeText(texte);
    setCopie(id);
    setTimeout(() => setCopie(""), 2000);
  }

  const css = `
    * { box-sizing: border-box; }
    .comm-grid { display: grid; grid-template-columns: 340px 1fr; gap: 20px; }
    .haki-btn { border: none; border-radius: 8px; font-family: system-ui; cursor: pointer; font-weight: 500; transition: opacity .15s; }
    .haki-btn:hover { opacity: .88; }
    .haki-btn:disabled { opacity: .5; cursor: default; }
    @media (max-width: 900px) {
      .comm-grid { grid-template-columns: 1fr; }
    }
  `;

  const journee = JOURNEES_DEI.find(j => j.id === journeeId);
  const reseauActif = RESEAUX.find(r => r.id === reseau);

  return (
    <div style={{ fontFamily:"system-ui,-apple-system,sans-serif", background:"#F0F2F5", minHeight:"100vh" }}>
      <style>{css}</style>

      {/* ── HEADER ── */}
      <div style={{ background:"#1A237E", padding:"0 28px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:20, fontWeight:700, color:"#FFC107", letterSpacing:3 }}>HAKI</span>
          <div style={{ width:1, height:18, background:"#3949AB" }}/>
          <span style={{ fontSize:12, color:"#9FA8DA" }}>Communication DEI</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => router.push("/dashboard")}
            style={{ background:"#283593", color:"#90CAF9", border:"none", borderRadius:6, padding:"6px 14px", fontSize:11, fontWeight:500, cursor:"pointer" }}>
            ← Tableau de bord
          </button>
          <button onClick={() => router.push("/services")}
            style={{ background:"transparent", color:"#FFC107", border:"1px solid #FFC107", borderRadius:6, padding:"5px 12px", fontSize:11, fontWeight:600, cursor:"pointer" }}>
            Nos services
          </button>
          <button onClick={() => signOut({ callbackUrl:"/connexion" })}
            style={{ background:"transparent", color:"#9FA8DA", border:"1px solid #3949AB", borderRadius:6, padding:"5px 12px", fontSize:11, cursor:"pointer" }}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 20px" }}>

        {/* ── Intro ── */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#9E9E9E", letterSpacing:".12em", textTransform:"uppercase" as const, marginBottom:4 }}>
            Accompagnement Communication Digitale
          </div>
          <h1 style={{ fontSize:22, fontWeight:700, color:"#1A237E", margin:"0 0 6px" }}>
            Vos contenus DEI prêts à publier
          </h1>
          <p style={{ fontSize:13, color:"#757575", margin:0, lineHeight:1.6 }}>
            Générez en quelques secondes vos posts, emails et messages DEI personnalisés pour {user?.organisationNom ?? "votre organisation"}.
          </p>
        </div>

        <div className="comm-grid">

          {/* ══ PANNEAU GAUCHE — Paramètres ══ */}
          <div style={{ display:"flex", flexDirection:"column" as const, gap:14 }}>

            {/* Choix du kit */}
            <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#9E9E9E", letterSpacing:".1em", textTransform:"uppercase" as const, marginBottom:12 }}>
                Kit de communication
              </div>
              <div style={{ display:"flex", flexDirection:"column" as const, gap:8 }}>
                {[
                  { id:"journees",     emoji:"📅", label:"Kit Journées DEI",      desc:"Pour les journées nationales et internationales" },
                  { id:"plan_action",  emoji:"🎯", label:"Kit Plan d'Action DEI", desc:"Pour communiquer vos engagements et avancées" },
                ].map(k => (
                  <button key={k.id} className="haki-btn"
                    onClick={() => { setKit(k.id as Kit); setContenu(null); setErreur(""); }}
                    style={{
                      padding:"12px 14px", textAlign:"left" as const,
                      background: kit===k.id ? "#E8EAF6" : "#F5F5F5",
                      border: `1.5px solid ${kit===k.id ? "#1A237E" : "transparent"}`,
                      color:"#212121",
                    }}>
                    <div style={{ fontSize:14, marginBottom:2 }}>{k.emoji} <strong style={{ color: kit===k.id?"#1A237E":"#212121" }}>{k.label}</strong></div>
                    <div style={{ fontSize:11, color:"#9E9E9E" }}>{k.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Journée (si kit journées) */}
            {kit === "journees" && (
              <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#9E9E9E", letterSpacing:".1em", textTransform:"uppercase" as const, marginBottom:12 }}>
                  Journée DEI
                </div>
                <div style={{ display:"flex", flexDirection:"column" as const, gap:6 }}>
                  {JOURNEES_DEI.map(j => (
                    <button key={j.id} className="haki-btn"
                      onClick={() => { setJourneeId(j.id); setContenu(null); }}
                      style={{
                        padding:"9px 12px", textAlign:"left" as const, fontSize:12,
                        background: journeeId===j.id ? "#E8EAF6" : "#F5F5F5",
                        border: `1px solid ${journeeId===j.id ? "#1A237E40" : "transparent"}`,
                        color: journeeId===j.id ? "#1A237E" : "#424242",
                        fontWeight: journeeId===j.id ? 600 : 400,
                      }}>
                      {j.emoji} {j.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Niveau de service */}
            <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#9E9E9E", letterSpacing:".1em", textTransform:"uppercase" as const, marginBottom:12 }}>
                Niveau de service
              </div>
              <div style={{ display:"flex", flexDirection:"column" as const, gap:8 }}>
                <button className="haki-btn"
                  onClick={() => { setNiveau("auto"); setContenu(null); setDemandeEnvoyee(false); setErreur(""); }}
                  style={{
                    padding:"12px 14px", textAlign:"left" as const,
                    background: niveau==="auto" ? "#E0F2F1" : "#F5F5F5",
                    border: `1.5px solid ${niveau==="auto" ? "#00695C" : "transparent"}`,
                  }}>
                  <div style={{ fontSize:13, fontWeight:600, color: niveau==="auto"?"#00695C":"#212121", marginBottom:2 }}>⚡ Génération automatique</div>
                  <div style={{ fontSize:11, color:"#9E9E9E" }}>Immédiat · Inclus dans l'abonnement · Powered by IA</div>
                </button>
                <button className="haki-btn"
                  onClick={() => { setNiveau("sur_mesure"); setContenu(null); setErreur(""); }}
                  style={{
                    padding:"12px 14px", textAlign:"left" as const,
                    background: niveau==="sur_mesure" ? "#FFF3E0" : "#F5F5F5",
                    border: `1.5px solid ${niveau==="sur_mesure" ? "#E65100" : "transparent"}`,
                  }}>
                  <div style={{ fontSize:13, fontWeight:600, color: niveau==="sur_mesure"?"#E65100":"#212121", marginBottom:2 }}>✍️ Production sur mesure Haki</div>
                  <div style={{ fontSize:11, color:"#9E9E9E" }}>5 jours ouvrés · Relu par expert DEI · Service payant</div>
                </button>
              </div>
            </div>

            {/* Bouton générer */}
            {niveau === "auto" && (
              <button className="haki-btn" onClick={genererContenu} disabled={loading}
                style={{ padding:"14px", background:loading?"#9FA8DA":"#1A237E", color:"#fff", fontSize:14, fontWeight:700 }}>
                {loading ? "⏳ Génération en cours..." : "✨ Générer mes contenus →"}
              </button>
            )}
          </div>

          {/* ══ PANNEAU DROIT — Résultats ══ */}
          <div>

            {/* ── Niveau auto : résultats ── */}
            {niveau === "auto" && (
              <div style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", minHeight:400 }}>

                {/* État vide */}
                {!loading && !contenu && !erreur && (
                  <div style={{ display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", height:360, gap:12, color:"#BDBDBD" }}>
                    <div style={{ fontSize:48 }}>✨</div>
                    <div style={{ fontSize:14, fontWeight:500, color:"#9E9E9E" }}>
                      {kit==="journees" ? `Kit ${journee?.label}` : "Kit Plan d'Action DEI"}
                    </div>
                    <div style={{ fontSize:12, color:"#BDBDBD" }}>Cliquez sur "Générer" pour obtenir vos contenus</div>
                  </div>
                )}

                {/* Chargement */}
                {loading && (
                  <div style={{ display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", height:360, gap:12 }}>
                    <div style={{ fontSize:32 }}>⏳</div>
                    <div style={{ fontSize:14, color:"#1A237E", fontWeight:500 }}>Génération en cours...</div>
                    <div style={{ fontSize:12, color:"#9E9E9E" }}>Personnalisation pour {user?.organisationNom ?? "votre organisation"}</div>
                  </div>
                )}

                {/* Erreur */}
                {erreur && (
                  <div style={{ padding:"12px 16px", background:"#FFEBEE", borderRadius:8, color:"#B71C1C", fontSize:13, marginBottom:16 }}>
                    ⚠️ {erreur}
                  </div>
                )}

                {/* Contenus générés */}
                {contenu && (
                  <>
                    {/* Header résultat */}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:"#1A237E" }}>
                          {kit==="journees" ? journee?.label : "Plan d'Action DEI"} — Contenus générés
                        </div>
                        <div style={{ fontSize:11, color:"#9E9E9E", marginTop:2 }}>
                          {user?.organisationNom ?? "Votre organisation"} · {RESEAUX.length} formats disponibles
                        </div>
                      </div>
                      <button className="haki-btn" onClick={() => setContenu(null)}
                        style={{ padding:"5px 12px", background:"#F5F5F5", color:"#424242", border:"1px solid #E0E0E0", fontSize:11 }}>
                        ↺ Regénérer
                      </button>
                    </div>

                    {/* Onglets réseaux */}
                    <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" as const }}>
                      {RESEAUX.map(r => (
                        <button key={r.id} className="haki-btn"
                          onClick={() => setReseau(r.id)}
                          style={{
                            padding:"6px 12px", fontSize:11, fontWeight:600,
                            background: reseau===r.id ? "#1A237E" : "#F5F5F5",
                            color: reseau===r.id ? "#fff" : "#424242",
                          }}>
                          {r.emoji} {r.label}
                          {r.maxChars && <span style={{ fontSize:9, opacity:.7, marginLeft:4 }}>max {r.maxChars}</span>}
                        </button>
                      ))}
                    </div>

                    {/* Contenu du réseau actif */}
                    <div style={{ position:"relative" as const }}>
                      <div style={{
                        padding:"16px", background:"#F8F9FA", borderRadius:10,
                        fontSize:13, lineHeight:1.75, color:"#212121", minHeight:180,
                        border:"1px solid #E0E0E0", whiteSpace:"pre-wrap" as const,
                      }}>
                        {contenu[reseau]}
                      </div>
                      {reseauActif?.maxChars && (
                        <div style={{ position:"absolute" as const, bottom:10, right:12, fontSize:10, color: contenu[reseau].length > reseauActif.maxChars ? "#B71C1C" : "#9E9E9E" }}>
                          {contenu[reseau].length} / {reseauActif.maxChars} caractères
                        </div>
                      )}
                    </div>

                    {/* Bouton copier */}
                    <div style={{ display:"flex", justifyContent:"flex-end", marginTop:10 }}>
                      <button className="haki-btn"
                        onClick={() => copierTexte(contenu[reseau], reseau)}
                        style={{ padding:"8px 18px", background:copie===reseau?"#2E7D32":"#1A237E", color:"#fff", fontSize:12, fontWeight:600 }}>
                        {copie===reseau ? "✓ Copié !" : "📋 Copier ce contenu"}
                      </button>
                    </div>

                    {/* Copier tout */}
                    <div style={{ marginTop:16, paddingTop:14, borderTop:"1px solid #F0F0F0" }}>
                      <div style={{ fontSize:11, color:"#9E9E9E", marginBottom:8 }}>Copier tous les formats d'un coup :</div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" as const }}>
                        {RESEAUX.map(r => (
                          <button key={r.id} className="haki-btn"
                            onClick={() => copierTexte(contenu[r.id], `all-${r.id}`)}
                            style={{ padding:"5px 10px", fontSize:10, background:copie===`all-${r.id}`?"#2E7D32":"#E8EAF6", color:copie===`all-${r.id}`?"#fff":"#1A237E" }}>
                            {copie===`all-${r.id}`?"✓":r.emoji} {r.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Niveau sur mesure : formulaire ── */}
            {niveau === "sur_mesure" && (
              <div style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
                {!demandeEnvoyee ? (
                  <>
                    <div style={{ fontSize:14, fontWeight:700, color:"#E65100", marginBottom:4 }}>
                      ✍️ Production sur mesure Haki
                    </div>
                    <div style={{ fontSize:12, color:"#9E9E9E", marginBottom:20, lineHeight:1.6 }}>
                      L'équipe Haki produit vos contenus DEI personnalisés, relus et validés par un expert DEI CI. Délai : 5 jours ouvrés.
                    </div>

                    <div style={{ display:"flex", flexDirection:"column" as const, gap:14 }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:600, color:"#424242", marginBottom:6 }}>Kit demandé</div>
                        <div style={{ padding:"10px 14px", background:"#F5F5F5", borderRadius:8, fontSize:13, color:"#1A237E", fontWeight:500 }}>
                          {kit==="journees" ? `📅 Kit Journées DEI — ${journee?.label}` : "🎯 Kit Plan d'Action DEI"}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize:12, fontWeight:600, color:"#424242", marginBottom:6 }}>
                          Contexte complémentaire <span style={{ color:"#9E9E9E", fontWeight:400 }}>(optionnel mais recommandé)</span>
                        </div>
                        <textarea
                          value={contexte}
                          onChange={e => setContexte(e.target.value)}
                          placeholder="Ex : Notre organisation vient de lancer un programme de mentorat pour les femmes cadres. Nous souhaitons mettre en avant notre score MMI-CI de 72/100 et notre engagement sur la parité managériale..."
                          rows={5}
                          style={{ width:"100%", padding:"10px 12px", border:"1px solid #E0E0E0", borderRadius:8, fontSize:13, fontFamily:"system-ui", resize:"vertical" as const, boxSizing:"border-box" as const }}
                        />
                      </div>

                      {erreur && (
                        <div style={{ padding:"8px 12px", background:"#FFEBEE", borderRadius:7, color:"#B71C1C", fontSize:12 }}>
                          ⚠️ {erreur}
                        </div>
                      )}

                      <div style={{ padding:"14px 16px", background:"#FFF3E0", borderRadius:8, fontSize:12, color:"#E65100", lineHeight:1.6 }}>
                        <strong>Ce service est payant.</strong> Un devis vous sera envoyé par email sous 24h après soumission de votre demande. Aucun engagement avant validation du devis.
                      </div>

                      <button className="haki-btn" onClick={envoyerDemandeSurMesure}
                        style={{ padding:"13px", background:"#E65100", color:"#fff", fontSize:14, fontWeight:700 }}>
                        Soumettre ma demande →
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", padding:"48px 24px", gap:14, textAlign:"center" as const }}>
                    <div style={{ fontSize:48 }}>✅</div>
                    <div style={{ fontSize:16, fontWeight:700, color:"#2E7D32" }}>Demande envoyée</div>
                    <div style={{ fontSize:13, color:"#757575", maxWidth:360, lineHeight:1.7 }}>
                      L'équipe Haki a bien reçu votre demande pour <strong>{kit==="journees" ? journee?.label : "le Plan d'Action DEI"}</strong>.
                      Vous recevrez un devis sous 24h à l'adresse email de votre compte.
                    </div>
                    <div style={{ fontSize:12, color:"#9E9E9E" }}>Délai de production : 5 jours ouvrés après validation du devis</div>
                    <button className="haki-btn" onClick={() => { setDemandeEnvoyee(false); setContexte(""); }}
                      style={{ padding:"9px 20px", background:"#F5F5F5", color:"#424242", border:"1px solid #E0E0E0", fontSize:12, marginTop:8 }}>
                      Faire une nouvelle demande
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
