"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import ManagerSection from "./ManagerSection";
import CalendrierDEI from "./CalendrierDEI";

const DIM_CONFIG = [
  { key:"scoreDim1Genre",    label:"Genre & Égalité + VIH/Sida",        max:38, color:"#1A237E", bg:"#E8EAF6" },
  { key:"scoreDim2Handicap", label:"Handicap + Médecine du travail",     max:26, color:"#00695C", bg:"#E0F2F1" },
  { key:"scoreDim3Multicult",label:"Multiculturalité & Anti-tribalisme", max:25, color:"#E65100", bg:"#FFF3E0" },
  { key:"scoreDim4Intergen", label:"Intergénérationnel + QVT",           max:11, color:"#2E7D32", bg:"#E8F5E9" },
];

const NIVEAUX: Record<number,{label:string;color:string;bg:string}> = {
  1:{label:"Non-conforme",   color:"#B71C1C",bg:"#FFEBEE"},
  2:{label:"Conforme",       color:"#E65100",bg:"#FFF3E0"},
  3:{label:"Consciente",     color:"#F57F17",bg:"#FFFDE7"},
  4:{label:"Engagée",        color:"#00695C",bg:"#E0F2F1"},
  5:{label:"Transformatrice",color:"#1A237E",bg:"#E8EAF6"},
};

const css = `
  * { box-sizing: border-box; }
  .haki-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .haki-grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; }
  .haki-card { background: #fff; border-radius: 14px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
  .haki-btn { border: none; border-radius: 8px; font-family: system-ui; cursor: pointer; font-weight: 500; transition: opacity .15s; }
  .haki-btn:hover { opacity: .88; }
  .haki-btn:disabled { opacity: .5; cursor: default; }
  .haki-section-title { font-size: 11px; font-weight: 700; color: #9E9E9E; letter-spacing: .1em; text-transform: uppercase; margin-bottom: 16px; }
  .haki-progress { height: 8px; background: #F0F0F0; border-radius: 4px; overflow: hidden; }
  .haki-progress-bar { height: 100%; border-radius: 4px; transition: width .6s ease; }
  @media (max-width: 900px) {
    .haki-grid-2 { grid-template-columns: 1fr; }
    .haki-grid-4 { grid-template-columns: 1fr 1fr; }
    .haki-card { padding: 18px; }
  }
  @media (max-width: 600px) {
    .haki-grid-4 { grid-template-columns: 1fr; }
  }
`;

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modeCollab, setModeCollab] = useState<"none"|"email"|"lien">("none");
  const [emailsCollabText, setEmailsCollabText] = useState("");
  const [nbLiens, setNbLiens] = useState(10);
  const [collabLoading, setCollabLoading] = useState(false);
  const [collabResult, setCollabResult] = useState<any>(null);
  const [liensGeneres, setLiensGeneres] = useState<any[]>([]);
  const [statsCollab, setStatsCollab] = useState<any>(null);
  const [copie, setCopie] = useState<string>("");
  const [rapportLoading, setRapportLoading] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/sessions").then(r => r.json()).then(d => {
      setSessions(d.sessions ?? []);
      setLoading(false);
    });
  }, [status]);

  useEffect(() => {
    if (!sessions[0]?.id) return;
    fetch(`/api/sessions/${sessions[0].id}/liens-collaborateur`)
      .then(r => r.json()).then(d => { if (d.stats) setStatsCollab(d.stats); });
  }, [sessions]);

  async function creerSession() {
    const user = session?.user as any;
    await fetch("/api/sessions", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ organisationId: user?.organisationId, type:"complet" }) });
    const d = await fetch("/api/sessions").then(r => r.json());
    setSessions(d.sessions ?? []);
  }

  async function envoyerEmailsCollab() {
    if (!sessions[0]?.id) return;
    const emails = emailsCollabText.split(/[\n,;]+/).map(e => e.trim()).filter(e => e.includes("@"));
    if (!emails.length) { alert("Aucune adresse valide."); return; }
    setCollabLoading(true); setCollabResult(null);
    const res = await fetch(`/api/sessions/${sessions[0].id}/envoyer-liens`, {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ emails })
    });
    setCollabResult(await res.json());
    setCollabLoading(false);
    const d = await fetch(`/api/sessions/${sessions[0].id}/liens-collaborateur`).then(r => r.json());
    if (d.stats) setStatsCollab(d.stats);
  }

  async function genererLiensCollab() {
    if (!sessions[0]?.id) return;
    setCollabLoading(true);
    const res = await fetch(`/api/sessions/${sessions[0].id}/liens-collaborateur`, {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ nombre: nbLiens })
    });
    const data = await res.json();
    if (data.tokens) {
      setLiensGeneres(data.tokens);
      const d = await fetch(`/api/sessions/${sessions[0].id}/liens-collaborateur`).then(r => r.json());
      if (d.stats) setStatsCollab(d.stats);
    }
    setCollabLoading(false);
  }

  async function genererRapport(format: string) {
    if (!sessions[0]?.id) return;
    setRapportLoading(format);
    try {
      const res = await fetch(`/api/sessions/${sessions[0].id}/rapports`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ format })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Haki_Rapport_DEI_${format}_${new Date().getFullYear()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const err = await res.json();
        alert(err.error ?? "Erreur génération rapport.");
      }
    } catch { alert("Erreur réseau."); }
    setRapportLoading("");
  }

  function copierTexte(texte: string, id: string) {
    navigator.clipboard.writeText(texte);
    setCopie(id);
    setTimeout(() => setCopie(""), 2000);
  }

  if (status === "loading" || loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", fontFamily:"system-ui" }}>
      <style>{css}</style>
      <div style={{ color:"#1A237E", fontSize:15 }}>Chargement...</div>
    </div>
  );

  const latest = sessions[0];
  const score = latest?.scoreMmiCi;
  const socle = latest?.socleDiagnostic;
  const niveau = score ? NIVEAUX[score.niveauMmi] : null;
  const user = session?.user as any;

  return (
    <div style={{ fontFamily:"system-ui,-apple-system,sans-serif", background:"#F0F2F5", minHeight:"100vh" }}>
      <style>{css}</style>

      {/* ── HEADER ── */}
      <div style={{ background:"#1A237E", padding:"0 28px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:20, fontWeight:700, color:"#FFC107", letterSpacing:3 }}>HAKI</span>
          <div style={{ width:1, height:18, background:"#3949AB" }}/>
          <span style={{ fontSize:12, color:"#9FA8DA" }}>Plateforme DEI · Côte d'Ivoire</span>
          <button onClick={() => router.push("/services")}
            style={{ background:"transparent", color:"#FFC107", border:"1px solid #FFC107", borderRadius:6, padding:"5px 12px", fontSize:11, fontWeight:600, cursor:"pointer", marginLeft:8 }}>
            Nos services
          </button>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ textAlign:"right" as const }}>
            <div style={{ fontSize:12, color:"#fff", fontWeight:500 }}>{user?.organisationNom}</div>
            <div style={{ fontSize:10, color:"#7986CB" }}>{user?.role?.toUpperCase()}</div>
          </div>
          <button className="haki-btn"
            onClick={() => signOut({ callbackUrl:"/connexion" })}
            style={{ background:"#283593", color:"#90CAF9", padding:"6px 14px", fontSize:11 }}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 20px" }}>

        {/* ── PAS DE SESSION ── */}
        {!latest && (
          <div className="haki-card" style={{ textAlign:"center", padding:48 }}>
            <div style={{ fontSize:44, marginBottom:16 }}>🚀</div>
            <div style={{ fontSize:20, fontWeight:600, color:"#1A237E", marginBottom:8 }}>Lancer votre premier diagnostic Haki</div>
            <div style={{ fontSize:14, color:"#757575", marginBottom:28, maxWidth:420, margin:"0 auto 28px" }}>
              Commencez par le SOCLE (conformité légale CI), puis les 4 dimensions DEI.
            </div>
            <button className="haki-btn" onClick={creerSession}
              style={{ background:"#1A237E", color:"#fff", padding:"13px 32px", fontSize:14 }}>
              Créer un diagnostic →
            </button>
          </div>
        )}

        {latest && (
          <>
            {/* ══ 1. SCORE + SOCLE ══ */}
            <div className="haki-grid-2" style={{ marginBottom:16 }}>

              {/* Score MMI-CI */}
              <div className="haki-card">
                <div className="haki-section-title">Score MMI-CI Global</div>
                {score ? (
                  <>
                    <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:14 }}>
                      <span style={{ fontSize:64, fontWeight:700, color:"#1A237E", lineHeight:1 }}>{score.scoreGlobal}</span>
                      <span style={{ fontSize:22, color:"#BDBDBD", fontWeight:300 }}>/100</span>
                    </div>
                    {niveau && (
                      <span style={{ display:"inline-block", padding:"6px 18px", borderRadius:99, background:niveau.bg, color:niveau.color, fontSize:12, fontWeight:700, marginBottom:16 }}>
                        Niveau {score.niveauMmi} — {niveau.label}
                      </span>
                    )}
                    <div className="haki-progress">
                      <div className="haki-progress-bar" style={{
                        width:`${score.scoreGlobal}%`,
                        background: score.scoreGlobal>=75?"#2E7D32":score.scoreGlobal>=50?"#FFC107":"#E65100"
                      }}/>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#BDBDBD", marginTop:4 }}>
                      <span>0 — Non-conforme</span>
                      <span>75 — Label Haki</span>
                      <span>100</span>
                    </div>
                  </>
                ) : (
                  <div>
                    <div style={{ fontSize:14, color:"#9E9E9E", marginBottom:16 }}>Complétez le questionnaire pour obtenir votre score</div>
                    <button className="haki-btn" onClick={() => router.push(`/diagnostic/${latest.id}/organisation`)}
                      style={{ background:"#1A237E", color:"#fff", padding:"10px 20px", fontSize:13 }}>
                      Questionnaire ORGANISATION →
                    </button>
                  </div>
                )}
              </div>

              {/* Badge SOCLE */}
              <div className="haki-card">
                <div className="haki-section-title">Badge SOCLE — Conformité Légale CI</div>
                {socle ? (
                  <>
                    <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
                      <span style={{ fontSize:32 }}>{socle.badgeGlobal==="conforme"?"✅":socle.badgeGlobal==="en_cours"?"⏳":"⚠️"}</span>
                      <div>
                        <div style={{ fontSize:17, fontWeight:700, color:socle.badgeGlobal==="conforme"?"#2E7D32":socle.badgeGlobal==="en_cours"?"#E65100":"#B71C1C" }}>
                          {socle.badgeGlobal==="conforme"?"Conforme":socle.badgeGlobal==="en_cours"?"En cours de conformité":"Non conforme"}
                        </div>
                        <div style={{ fontSize:11, color:"#9E9E9E", marginTop:2 }}>
                          CNPS · CMU · Médecine travail · Prévoyance
                        </div>
                      </div>
                    </div>
                    {Array.isArray(socle.alertes) && (socle.alertes as any[]).slice(0,3).map((a:any,i:number) => (
                      <div key={i} style={{ display:"flex", gap:8, padding:"8px 12px", borderRadius:8, background:a.niveau==="rouge"?"#FFEBEE":"#FFF3E0", marginBottom:6 }}>
                        <div style={{ width:7, height:7, borderRadius:"50%", background:a.niveau==="rouge"?"#B71C1C":"#E65100", flexShrink:0, marginTop:4 }}/>
                        <div style={{ fontSize:12, color:a.niveau==="rouge"?"#B71C1C":"#E65100", lineHeight:1.5 }}>
                          <strong>{a.composante}</strong> — {a.message}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div>
                    <div style={{ fontSize:14, color:"#9E9E9E", marginBottom:16 }}>SOCLE non encore évalué</div>
                    <button className="haki-btn" onClick={() => router.push(`/diagnostic/${latest.id}/socle`)}
                      style={{ background:"#B71C1C", color:"#fff", padding:"10px 20px", fontSize:13 }}>
                      Évaluer le SOCLE →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ══ 2. RAPPORTS PDF ══ */}
            {score && (
              <div className="haki-card" style={{ marginBottom:16 }}>
                <div className="haki-section-title">Rapports PDF</div>
                <div className="haki-grid-2" style={{ gap:12 }}>
                  <button className="haki-btn" onClick={() => genererRapport("executif")} disabled={!!rapportLoading}
                    style={{ padding:"14px 20px", background:rapportLoading==="executif"?"#9FA8DA":"#00695C", color:"#fff", fontSize:13, textAlign:"left" as const }}>
                    <div style={{ fontSize:20, marginBottom:4 }}>📄</div>
                    <div style={{ fontWeight:600 }}>{rapportLoading==="executif"?"⏳ Génération...":"Rapport Exécutif"}</div>
                    <div style={{ fontSize:11, opacity:.8, marginTop:2 }}>6 pages · Pour le DG, bailleurs, partenaires</div>
                  </button>
                  <button className="haki-btn" onClick={() => genererRapport("analytique")} disabled={!!rapportLoading}
                    style={{ padding:"14px 20px", background:rapportLoading==="analytique"?"#9FA8DA":"#1A237E", color:"#fff", fontSize:13, textAlign:"left" as const }}>
                    <div style={{ fontSize:20, marginBottom:4 }}>📊</div>
                    <div style={{ fontWeight:600 }}>{rapportLoading==="analytique"?"⏳ Génération...":"Rapport Analytique"}</div>
                    <div style={{ fontSize:11, opacity:.8, marginTop:2 }}>14 pages · Pour le DRH, détail par composante</div>
                  </button>
                </div>
                {rapportLoading && (
                  <div style={{ marginTop:10, fontSize:12, color:"#00695C" }}>⏳ Génération en cours — 20 à 30 secondes...</div>
                )}
              </div>
            )}

            {/* ══ 3. SCORES PAR DIMENSION ══ */}
            {score && (
              <div className="haki-card" style={{ marginBottom:16 }}>
                <div className="haki-section-title">Scores par dimension MMI-CI</div>
                <div className="haki-grid-4">
                  {DIM_CONFIG.map(dim => {
                    const s = score[dim.key] ?? 0;
                    const pct = Math.round((s/dim.max)*100);
                    const statut = pct>=65?"Fort":pct>=40?"Moyen":"Faible";
                    const sc = pct>=65?"#2E7D32":pct>=40?"#E65100":"#B71C1C";
                    return (
                      <div key={dim.key} style={{ padding:"16px", background:dim.bg, borderRadius:10, border:`1px solid ${dim.color}20` }}>
                        <div style={{ fontSize:11, fontWeight:700, color:dim.color, marginBottom:10, lineHeight:1.4 }}>{dim.label}</div>
                        <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:8 }}>
                          <span style={{ fontSize:28, fontWeight:700, color:dim.color }}>{s}</span>
                          <span style={{ fontSize:13, color:"#BDBDBD" }}>/{dim.max}</span>
                        </div>
                        <div className="haki-progress" style={{ marginBottom:6 }}>
                          <div className="haki-progress-bar" style={{ width:`${pct}%`, background:dim.color }}/>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <span style={{ fontSize:10, color:dim.color, fontWeight:600 }}>{pct}%</span>
                          <span style={{ fontSize:10, padding:"2px 7px", borderRadius:99, background:`${sc}15`, color:sc, fontWeight:600 }}>{statut}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══ 4. ACTIONS & DIAGNOSTICS ══ */}
            <div className="haki-card" style={{ marginBottom:16 }}>
              <div className="haki-section-title">Actions & Diagnostics</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" as const }}>
                <button className="haki-btn" onClick={() => router.push(`/diagnostic/${latest.id}/socle`)}
                  style={{ padding:"10px 20px", background:socle?"#FFEBEE":"#B71C1C", color:socle?"#B71C1C":"#fff", border:`1.5px solid #EF9A9A`, fontSize:13 }}>
                  ⚖️ {socle?"Mettre à jour le SOCLE":"Compléter le SOCLE"}
                </button>
                <button className="haki-btn" onClick={() => router.push(`/diagnostic/${latest.id}/organisation`)}
                  style={{ padding:"10px 20px", background:score?"#E8EAF6":"#1A237E", color:score?"#1A237E":"#fff", border:`1.5px solid #C5CAE9`, fontSize:13 }}>
                  📋 {score?"Modifier le questionnaire":"Questionnaire ORGANISATION"}
                </button>
              </div>
            </div>

            {/* ══ 5. BAROMÈTRE COLLABORATEURS ══ */}
            <div className="haki-card" style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, flexWrap:"wrap" as const, gap:8 }}>
                <div>
                  <div className="haki-section-title" style={{ marginBottom:2 }}>Baromètre COLLABORATEURS</div>
                  <div style={{ fontSize:12, color:"#9E9E9E" }}>Liens anonymes · Résultats agrégés · Seuil n≥5 (ARTCI)</div>
                </div>
                {statsCollab && statsCollab.total > 0 && (
                  <div style={{ display:"flex", gap:16, fontSize:12 }}>
                    <span><strong style={{ color:"#1A237E" }}>{statsCollab.total}</strong> <span style={{ color:"#9E9E9E" }}>liens</span></span>
                    <span><strong style={{ color:"#2E7D32" }}>{statsCollab.utilises}</strong> <span style={{ color:"#9E9E9E" }}>réponses</span></span>
                    <span><strong style={{ color:"#E65100" }}>{statsCollab.enAttente}</strong> <span style={{ color:"#9E9E9E" }}>en attente</span></span>
                  </div>
                )}
              </div>

              {modeCollab === "none" && (
                <div className="haki-grid-2" style={{ gap:10 }}>
                  <button className="haki-btn" onClick={() => setModeCollab("email")}
                    style={{ padding:"14px 16px", background:"#E8EAF6", color:"#1A237E", border:"1px solid #C5CAE9", fontSize:13, textAlign:"left" as const }}>
                    <div style={{ fontSize:20, marginBottom:4 }}>📧</div>
                    <div style={{ fontWeight:600 }}>Inviter par email</div>
                    <div style={{ fontSize:11, color:"#7986CB", marginTop:2 }}>Envoi automatique du lien anonyme</div>
                  </button>
                  <button className="haki-btn" onClick={() => setModeCollab("lien")}
                    style={{ padding:"14px 16px", background:"#E0F2F1", color:"#00695C", border:"1px solid #A5D6A7", fontSize:13, textAlign:"left" as const }}>
                    <div style={{ fontSize:20, marginBottom:4 }}>🔗</div>
                    <div style={{ fontWeight:600 }}>Générer des liens</div>
                    <div style={{ fontSize:11, color:"#4DB6AC", marginTop:2 }}>Copier et partager manuellement</div>
                  </button>
                </div>
              )}

              {modeCollab !== "none" && (
                <>
                  <button className="haki-btn" onClick={() => setModeCollab("none")}
                    style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:"#F5F5F5", color:"#424242", border:"1px solid #E0E0E0", fontSize:12, marginBottom:14 }}>
                    ← Changer de méthode
                  </button>

                  {modeCollab === "email" && (
                    <div>
                      <textarea value={emailsCollabText} onChange={e => setEmailsCollabText(e.target.value)}
                        placeholder={"collab1@entreprise.ci\ncollab2@entreprise.ci"}
                        rows={4} style={{ width:"100%", padding:"10px 12px", border:"1px solid #E0E0E0", borderRadius:8, fontSize:13, fontFamily:"monospace", resize:"vertical" as const, marginBottom:10, boxSizing:"border-box" as const }} />
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <span style={{ fontSize:12, color:"#9E9E9E" }}>
                          {emailsCollabText.split(/[\n,;]+/).filter(e=>e.trim().includes("@")).length} adresse(s)
                        </span>
                        <button className="haki-btn" onClick={envoyerEmailsCollab} disabled={collabLoading}
                          style={{ padding:"9px 18px", background:collabLoading?"#9FA8DA":"#1A237E", color:"#fff", fontSize:13 }}>
                          {collabLoading?"Envoi...":"Envoyer →"}
                        </button>
                      </div>
                      {collabResult && (
                        <div style={{ marginTop:10, padding:"8px 12px", borderRadius:7, background:collabResult.erreurs>0?"#FFF3E0":"#E8F5E9", fontSize:12, color:collabResult.erreurs>0?"#E65100":"#2E7D32" }}>
                          {collabResult.envoyes>0&&<div>✓ {collabResult.envoyes} email(s) envoyé(s)</div>}
                          {collabResult.erreurs>0&&<div>⚠ {collabResult.erreurs} non envoyé(s)</div>}
                        </div>
                      )}
                    </div>
                  )}

                  {modeCollab === "lien" && (
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                        <span style={{ fontSize:13 }}>Nombre :</span>
                        <input type="number" value={nbLiens} onChange={e => setNbLiens(Number(e.target.value))} min={1} max={5000}
                          style={{ padding:"7px 10px", border:"1px solid #E0E0E0", borderRadius:7, fontSize:13, width:80 }}/>
                        <button className="haki-btn" onClick={genererLiensCollab} disabled={collabLoading}
                          style={{ padding:"8px 16px", background:collabLoading?"#9FA8DA":"#00695C", color:"#fff", fontSize:13 }}>
                          {collabLoading?"Génération...":"Générer →"}
                        </button>
                      </div>
                      {liensGeneres.length > 0 && (
                        <div>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                            <span style={{ fontSize:12, color:"#2E7D32" }}>✓ {liensGeneres.length} liens générés</span>
                            <button className="haki-btn" onClick={() => copierTexte(liensGeneres.map(l=>l.url).join("\n"), "col-tous")}
                              style={{ padding:"4px 10px", background:copie==="col-tous"?"#2E7D32":"#E0F2F1", color:copie==="col-tous"?"#fff":"#00695C", fontSize:11 }}>
                              {copie==="col-tous"?"✓ Copié":"Copier tous"}
                            </button>
                          </div>
                          <div style={{ background:"#F5F5F5", borderRadius:8, padding:12, maxHeight:180, overflowY:"auto" as const }}>
                            {liensGeneres.map((l,i) => (
                              <div key={i} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                                <span style={{ fontSize:10, color:"#BDBDBD", minWidth:18 }}>{i+1}.</span>
                                <span style={{ fontSize:11, color:"#1A237E", fontFamily:"monospace", flex:1, wordBreak:"break-all" as const }}>{l.url}</span>
                                <button className="haki-btn" onClick={() => copierTexte(l.url, l.id)}
                                  style={{ padding:"2px 8px", background:copie===l.id?"#2E7D32":"#E0F2F1", color:copie===l.id?"#fff":"#00695C", fontSize:10 }}>
                                  {copie===l.id?"✓":"Copier"}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ══ 6. AUTO-DIAGNOSTIC MANAGERS ══ */}
            <ManagerSection sessionId={latest.id} copie={copie} setCopie={setCopie} />

            {/* ══ 7. PRODUCTION DOCUMENTAIRE ══ */}
            <div style={{ background:"linear-gradient(135deg, #1A237E 0%, #0D47A1 100%)", borderRadius:14, padding:24, marginBottom:16, boxShadow:"0 4px 20px rgba(26,35,126,0.25)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap" as const, gap:16 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#FFC107", marginBottom:6, letterSpacing:".05em" }}>
                    PRODUCTION DOCUMENTAIRE DEI
                  </div>
                  <div style={{ fontSize:13, color:"#C5CAE9", marginBottom:12 }}>
                    5 documents personnalisés · Stratégie Genre · Charte D&I · Politique Genre · PAG · Mécanisme S&E
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" as const }}>
                    {[
                      { label:"Pack Essentiel -20%", highlight:false },
                      { label:"Pack Conformité -25%", highlight:false },
                      { label:"Pack Transformation -30%", highlight:true },
                    ].map(p => (
                      <span key={p.label} style={{ fontSize:11, padding:"4px 12px", borderRadius:99,
                        background: p.highlight ? "rgba(255,193,7,0.25)" : "rgba(255,255,255,0.1)",
                        color: p.highlight ? "#FFC107" : "#C5CAE9",
                        border: p.highlight ? "1px solid rgba(255,193,7,0.4)" : "1px solid rgba(255,255,255,0.1)",
                        fontWeight: p.highlight ? 600 : 400 }}>
                        {p.label}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="haki-btn" onClick={() => router.push("/documents")}
                  style={{ padding:"13px 28px", background:"#FFC107", color:"#1A237E", fontSize:14, fontWeight:700, flexShrink:0 }}>
                  Voir le catalogue →
                </button>
              </div>
            </div>

            {/* ══ 8. BENCHMARKS CI ══ */}
            <div className="haki-card" style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap" as const, gap:12 }}>
                <div>
                  <div className="haki-section-title" style={{ marginBottom:4 }}>Benchmarks sectoriels CI</div>
                  <div style={{ fontSize:12, color:"#9E9E9E" }}>
                    Positionnement vs entreprises CI · Veille web DEI mensuelle · 339 entreprises suivies
                  </div>
                </div>
                <button className="haki-btn" onClick={() => router.push("/benchmarks")}
                  style={{ padding:"10px 20px", background:"#E8EAF6", color:"#1A237E", border:"1px solid #C5CAE9", fontSize:13 }}>
                  📊 Voir les benchmarks →
                </button>
              </div>
            </div>

            {/* ══ 9. CALENDRIER DEI ══ */}
            <CalendrierDEI />

          </>
        )}
      </div>
    </div>
  );
}