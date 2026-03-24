"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import ManagerSection from "./ManagerSection";
import CalendrierGIS from "./CalendrierGIS";
import OnboardingGuide from "./OnboardingGuide";

// ── Constantes ────────────────────────────────────────────────────
const DIM_CONFIG = [
  { key:"scoreDim1Genre",     label:"Genre & Égalité",          labelCourt:"Genre",          max:38, color:"#1A237E", bg:"#E8EAF6", icon:"♀️" },
  { key:"scoreDim2Handicap",  label:"Handicap & Médecine",       labelCourt:"Handicap",       max:26, color:"#00695C", bg:"#E0F2F1", icon:"♿" },
  { key:"scoreDim3Multicult", label:"Multiculturalité",          labelCourt:"Multicult.",     max:25, color:"#E65100", bg:"#FFF3E0", icon:"🤝" },
  { key:"scoreDim4Intergen",  label:"Intergénérationnel & QVT",  labelCourt:"Intergén.",      max:11, color:"#2E7D32", bg:"#E8F5E9", icon:"🌱" },
];

const NIVEAUX: Record<number,{label:string;color:string;bg:string}> = {
  1:{label:"Non-conforme",    color:"#B71C1C", bg:"#FFEBEE"},
  2:{label:"Conforme",        color:"#E65100", bg:"#FFF3E0"},
  3:{label:"Consciente",      color:"#F57F17", bg:"#FFFDE7"},
  4:{label:"Engagée",         color:"#00695C", bg:"#E0F2F1"},
  5:{label:"Transformatrice", color:"#1A237E", bg:"#E8EAF6"},
};

const NAV_ITEMS = [
  { id:"overview",    icon:"⬛", label:"Vue d'ensemble" },
  { id:"diagnostic",  icon:"📋", label:"Diagnostic GIS" },
  { id:"equipes",     icon:"👥", label:"Équipes" },
  { id:"managers",    icon:"🧭", label:"Managers" },
  { id:"services",    icon:"💼", label:"Services" },
  { id:"benchmarks",  icon:"📈", label:"Benchmarks" },
  { id:"calendrier",  icon:"📅", label:"Calendrier GIS" },
];

// ── Composant jauge circulaire ────────────────────────────────────
function JaugeCirculaire({ score, max=100, color="#1A237E", size=120 }: { score:number; max?:number; color?:string; size?:number }) {
  const pct = Math.min(score/max, 1);
  const r = (size/2) - 10;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0F0F0" strokeWidth={8}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition:"stroke-dasharray .8s ease" }}/>
    </svg>
  );
}

// ── Composant barre de progression ───────────────────────────────
function BarreDim({ score, max, color, label, icon }: { score:number; max:number; color:string; label:string; icon:string }) {
  const pct = Math.round((score/max)*100);
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
        <span style={{ fontSize:12, fontWeight:600, color:"#424242" }}>{icon} {label}</span>
        <span style={{ fontSize:12, fontWeight:700, color }}>
          {score}<span style={{ fontSize:10, color:"#9E9E9E", fontWeight:400 }}>/{max}</span>
          <span style={{ fontSize:10, color:"#9E9E9E", fontWeight:400, marginLeft:4 }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ height:7, background:"#F0F0F0", borderRadius:99, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:99, transition:"width .7s ease" }}/>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────
export default function DashboardPage() {
  const { data:session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [navActif, setNavActif] = useState("overview");
  const [sidebarReduit, setSidebarReduit] = useState(false);

  // États baromètre
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
    fetch("/api/sessions").then(r=>r.json()).then(d => {
      setSessions(d.sessions ?? []);
      setLoading(false);
    });
  }, [status]);

  useEffect(() => {
    if (!sessions[0]?.id) return;
    fetch(`/api/sessions/${sessions[0].id}/liens-collaborateur`)
      .then(r=>r.json()).then(d => { if (d.stats) setStatsCollab(d.stats); });
  }, [sessions]);

  async function creerSession() {
    const user = session?.user as any;
    await fetch("/api/sessions", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ organisationId:user?.organisationId, type:"complet" }) });
    const d = await fetch("/api/sessions").then(r=>r.json());
    setSessions(d.sessions ?? []);
  }

  async function envoyerEmailsCollab() {
    if (!sessions[0]?.id) return;
    const emails = emailsCollabText.split(/[\n,;]+/).map(e=>e.trim()).filter(e=>e.includes("@"));
    if (!emails.length) { alert("Aucune adresse valide."); return; }
    setCollabLoading(true); setCollabResult(null);
    const res = await fetch(`/api/sessions/${sessions[0].id}/envoyer-liens`, {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ emails })
    });
    setCollabResult(await res.json());
    setCollabLoading(false);
    const d = await fetch(`/api/sessions/${sessions[0].id}/liens-collaborateur`).then(r=>r.json());
    if (d.stats) setStatsCollab(d.stats);
  }

  async function genererLiensCollab() {
    if (!sessions[0]?.id) return;
    setCollabLoading(true);
    const res = await fetch(`/api/sessions/${sessions[0].id}/liens-collaborateur`, {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ nombre:nbLiens })
    });
    const data = await res.json();
    if (data.tokens) {
      setLiensGeneres(data.tokens);
      const d = await fetch(`/api/sessions/${sessions[0].id}/liens-collaborateur`).then(r=>r.json());
      if (d.stats) setStatsCollab(d.stats);
    }
    setCollabLoading(false);
  }

  async function genererRapport(format:string) {
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
        a.href = url; a.download = `Haki_Rapport_GIS_${format}_${new Date().getFullYear()}.pdf`;
        a.click(); URL.revokeObjectURL(url);
      } else { alert("Erreur génération rapport."); }
    } catch { alert("Erreur réseau."); }
    setRapportLoading("");
  }

  function copierTexte(texte:string, id:string) {
    navigator.clipboard.writeText(texte);
    setCopie(id);
    setTimeout(() => setCopie(""), 2000);
  }

  if (status === "loading" || loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#F4F5F7", fontFamily:"system-ui" }}>
      <div style={{ textAlign:"center" as const }}>
        <div style={{ fontSize:28, fontWeight:700, color:"#1A237E", letterSpacing:4, marginBottom:8 }}>HAKI</div>
        <div style={{ fontSize:13, color:"#9E9E9E" }}>Chargement...</div>
      </div>
    </div>
  );

  const latest = sessions[0];
  const score = latest?.scoreMmiCi;
  const socle = latest?.socleDiagnostic;
  const niveau = score ? NIVEAUX[score.niveauMmi] : null;
  const user = session?.user as any;
  const collabTaux = statsCollab?.total > 0 ? Math.round((statsCollab.utilises/statsCollab.total)*100) : 0;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; }
    body { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .hk-sidebar { width: ${sidebarReduit?64:220}px; transition: width .25s ease; flex-shrink: 0; }
    .hk-nav-label { display: ${sidebarReduit?"none":"block"}; transition: opacity .2s; }
    .hk-nav-item { display:flex; align-items:center; gap:10px; padding:${sidebarReduit?"10px":"10px 14px"}; border-radius:8px; cursor:pointer; transition:all .15s; margin-bottom:3px; justify-content:${sidebarReduit?"center":"flex-start"}; }
    .hk-nav-item:hover { background:rgba(255,255,255,0.08); }
    .hk-nav-item.active { background:rgba(255,193,7,0.15); }
    .hk-card { background:#fff; border-radius:12px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04); }
    .hk-btn { border:none; border-radius:7px; font-family:'DM Sans',system-ui; cursor:pointer; font-weight:500; transition:all .15s; }
    .hk-btn:hover { opacity:.88; }
    .hk-btn:disabled { opacity:.5; cursor:default; }
    .hk-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .hk-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; }
    .hk-grid-4 { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:12px; }
    .hk-kpi-card { background:#fff; border-radius:12px; padding:16px 18px; box-shadow:0 1px 3px rgba(0,0,0,0.06); border-top:3px solid var(--kpi-color,#1A237E); }
    .hk-section-title { font-size:10px; font-weight:700; color:#9E9E9E; letter-spacing:.12em; text-transform:uppercase; margin-bottom:14px; }
    @media(max-width:1100px){
      .hk-grid-4 { grid-template-columns:1fr 1fr; }
      .hk-grid-3 { grid-template-columns:1fr 1fr; }
    }
    @media(max-width:768px){
      .hk-sidebar { display:none; }
      .hk-grid-2,.hk-grid-3,.hk-grid-4 { grid-template-columns:1fr; }
    }
  `;

  return (
    <div style={{ display:"flex", height:"100vh", background:"#F4F5F7", fontFamily:"'DM Sans',system-ui,sans-serif", overflow:"hidden" }}>
      <style>{css}</style>

      {/* ════════════════════════════════
          SIDEBAR
      ════════════════════════════════ */}
      <div className="hk-sidebar" style={{ background:"#0F172A", display:"flex", flexDirection:"column" as const, height:"100vh", position:"sticky", top:0, overflow:"hidden" }}>

        {/* Logo */}
        <div style={{ padding:sidebarReduit?"16px 0":"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:sidebarReduit?"center":"space-between" }}>
          {!sidebarReduit && (
            <div>
              <div style={{ fontSize:18, fontWeight:700, color:"#FFC107", letterSpacing:3 }}>HAKI</div>
              <div style={{ fontSize:9, color:"#475569", letterSpacing:".1em", textTransform:"uppercase" as const, marginTop:1 }}>Genre & Inclusion</div>
            </div>
          )}
          <button className="hk-btn"
            onClick={() => setSidebarReduit(!sidebarReduit)}
            style={{ width:28, height:28, background:"rgba(255,255,255,0.06)", color:"#94A3B8", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {sidebarReduit ? "→" : "←"}
          </button>
        </div>

        {/* Organisation */}
        {!sidebarReduit && (
          <div style={{ padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)", cursor:"pointer" }} onClick={() => router.push("/profil")}>
            <div style={{ fontSize:11, fontWeight:600, color:"#fff", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>{user?.organisationNom}</div>
            <div style={{ fontSize:10, color:"#475569" }}>{user?.role?.toUpperCase()}</div>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex:1, padding:"12px 8px", overflowY:"auto" as const }}>
          {NAV_ITEMS.map(item => (
            <div key={item.id} className={`hk-nav-item${navActif===item.id?" active":""}`}
              onClick={() => setNavActif(item.id)}
              title={sidebarReduit ? item.label : undefined}>
              <span style={{ fontSize:16, flexShrink:0 }}>{item.icon}</span>
              <span className="hk-nav-label" style={{ fontSize:12, fontWeight:navActif===item.id?600:400, color:navActif===item.id?"#FFC107":"#94A3B8" }}>
                {item.label}
              </span>
            </div>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div style={{ padding:"10px 8px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          {!sidebarReduit && user?.role==="admin_haki" && (
            <div className="hk-nav-item" onClick={() => router.push("/admin")}
              style={{ marginBottom:4 }}>
              <span style={{ fontSize:14 }}>⚙️</span>
              <span className="hk-nav-label" style={{ fontSize:11, color:"#FFC107", fontWeight:600 }}>Admin Haki</span>
            </div>
          )}
          <div className="hk-nav-item" onClick={() => router.push("/services")}>
            <span style={{ fontSize:14 }}>🛍️</span>
            <span className="hk-nav-label" style={{ fontSize:11, color:"#94A3B8" }}>Nos services</span>
          </div>
          <div className="hk-nav-item" onClick={() => signOut({ callbackUrl:"/connexion" })}>
            <span style={{ fontSize:14 }}>🚪</span>
            <span className="hk-nav-label" style={{ fontSize:11, color:"#94A3B8" }}>Déconnexion</span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          CONTENU PRINCIPAL
      ════════════════════════════════ */}
      <div style={{ flex:1, overflowY:"auto" as const, display:"flex", flexDirection:"column" as const }}>

        {/* Top bar */}
        <div style={{ background:"#fff", borderBottom:"1px solid #E8EAED", padding:"0 24px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50, flexShrink:0 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:"#0F172A" }}>
              {NAV_ITEMS.find(n=>n.id===navActif)?.label ?? "Tableau de bord"}
            </div>
            {latest && (
              <div style={{ fontSize:11, color:"#94A3B8" }}>
                Dernière mise à jour · {new Date().toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"})}
              </div>
            )}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {score && (
              <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", background:"#E8EAF6", borderRadius:99 }}>
                <span style={{ fontSize:11, fontWeight:700, color:"#1A237E" }}>Score {score.scoreGlobal}/100</span>
                {niveau && <span style={{ fontSize:10, fontWeight:600, color:niveau.color }}>· {niveau.label}</span>}
              </div>
            )}
            <button className="hk-btn" onClick={() => router.push("/profil")}
              style={{ padding:"6px 12px", background:"#F4F5F7", color:"#424242", fontSize:11, border:"1px solid #E0E0E0" }}>
              👤 {user?.organisationNom?.split(" ")[0]}
            </button>
          </div>
        </div>

        {/* ── Pas de session ── */}
        {!latest && (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
            <div style={{ textAlign:"center" as const, maxWidth:440 }}>
              <div style={{ fontSize:56, marginBottom:20 }}>🚀</div>
              <div style={{ fontSize:22, fontWeight:700, color:"#0F172A", marginBottom:10 }}>Lancer votre premier diagnostic</div>
              <div style={{ fontSize:14, color:"#64748B", marginBottom:28, lineHeight:1.7 }}>
                Commencez par évaluer votre conformité sociale, puis obtenez votre score de maturité inclusive sur 100 points.
              </div>
              <button className="hk-btn" onClick={creerSession}
                style={{ padding:"13px 32px", background:"#1A237E", color:"#fff", fontSize:14, fontWeight:600 }}>
                Créer mon diagnostic →
              </button>
            </div>
          </div>
        )}

        {latest && (
          <div style={{ padding:"20px 24px", flex:1 }}>

            {/* ════════ VUE D'ENSEMBLE ════════ */}
            {navActif === "overview" && (
              <>
                {/* KPIs row */}
                <div className="hk-grid-4" style={{ marginBottom:16 }}>

                  {/* Score GIS */}
                  <div className="hk-kpi-card" style={{ "--kpi-color":"#1A237E" } as any }>
                    <div className="hk-section-title">Score GIS Global</div>
                    {score ? (
                      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                        <div style={{ position:"relative" as const, flexShrink:0 }}>
                          <JaugeCirculaire score={score.scoreGlobal} color={niveau?.color??"#1A237E"} size={72}/>
                          <div style={{ position:"absolute" as const, inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" as const }}>
                            <span style={{ fontSize:16, fontWeight:700, color:"#0F172A" }}>{score.scoreGlobal}</span>
                            <span style={{ fontSize:8, color:"#94A3B8" }}>/100</span>
                          </div>
                        </div>
                        <div>
                          {niveau && (
                            <span style={{ display:"inline-block", fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:99, background:niveau.bg, color:niveau.color, marginBottom:4 }}>
                              N{score.niveauMmi} — {niveau.label}
                            </span>
                          )}
                          <div style={{ fontSize:11, color:"#64748B" }}>Objectif Label Haki : 75/100</div>
                          <div style={{ fontSize:11, color:"#64748B" }}>Écart : {Math.max(0,75-score.scoreGlobal)} pts</div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize:13, color:"#94A3B8", marginBottom:10 }}>Questionnaire non complété</div>
                        <button className="hk-btn" onClick={() => router.push(`/diagnostic/${latest.id}/organisation`)}
                          style={{ padding:"7px 14px", background:"#1A237E", color:"#fff", fontSize:12 }}>
                          Compléter →
                        </button>
                      </div>
                    )}
                  </div>

                  {/* SOCLE */}
                  <div className="hk-kpi-card" style={{ "--kpi-color": socle?.badgeGlobal==="conforme"?"#2E7D32":socle?.badgeGlobal==="en_cours"?"#E65100":"#B71C1C" } as any}>
                    <div className="hk-section-title">Conformité Sociale</div>
                    {socle ? (
                      <>
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                          <span style={{ fontSize:28 }}>{socle.badgeGlobal==="conforme"?"✅":socle.badgeGlobal==="en_cours"?"⏳":"⚠️"}</span>
                          <div>
                            <div style={{ fontSize:14, fontWeight:700, color:socle.badgeGlobal==="conforme"?"#2E7D32":socle.badgeGlobal==="en_cours"?"#E65100":"#B71C1C" }}>
                              {socle.badgeGlobal==="conforme"?"Conforme":socle.badgeGlobal==="en_cours"?"En cours":"Non conforme"}
                            </div>
                            <div style={{ fontSize:10, color:"#94A3B8" }}>CNPS · CMU · Médecine · Prévoyance</div>
                          </div>
                        </div>
                        {Array.isArray(socle.alertes) && (socle.alertes as any[]).slice(0,2).map((a:any,i:number) => (
                          <div key={i} style={{ fontSize:10, color:a.niveau==="rouge"?"#B71C1C":"#E65100", padding:"4px 8px", background:a.niveau==="rouge"?"#FFEBEE":"#FFF3E0", borderRadius:5, marginBottom:3 }}>
                            ⚠ {a.composante} — {a.message?.slice(0,40)}...
                          </div>
                        ))}
                      </>
                    ) : (
                      <div>
                        <div style={{ fontSize:13, color:"#94A3B8", marginBottom:10 }}>SOCLE non évalué</div>
                        <button className="hk-btn" onClick={() => router.push(`/diagnostic/${latest.id}/socle`)}
                          style={{ padding:"7px 14px", background:"#B71C1C", color:"#fff", fontSize:12 }}>
                          Évaluer →
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Baromètre */}
                  <div className="hk-kpi-card" style={{ "--kpi-color":"#00695C" } as any}>
                    <div className="hk-section-title">Baromètre Collaborateurs</div>
                    {statsCollab && statsCollab.total > 0 ? (
                      <>
                        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:10 }}>
                          <div style={{ position:"relative" as const, flexShrink:0 }}>
                            <JaugeCirculaire score={collabTaux} color="#00695C" size={72}/>
                            <div style={{ position:"absolute" as const, inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" as const }}>
                              <span style={{ fontSize:16, fontWeight:700, color:"#0F172A" }}>{collabTaux}%</span>
                              <span style={{ fontSize:8, color:"#94A3B8" }}>taux</span>
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize:13, fontWeight:600, color:"#0F172A", marginBottom:3 }}>{statsCollab.utilises} réponses</div>
                            <div style={{ fontSize:11, color:"#64748B" }}>{statsCollab.total} liens envoyés</div>
                            <div style={{ fontSize:11, color:"#94A3B8" }}>{statsCollab.enAttente} en attente</div>
                          </div>
                        </div>
                        {collabTaux < 50 && (
                          <div style={{ fontSize:10, color:"#E65100", padding:"4px 8px", background:"#FFF3E0", borderRadius:5 }}>
                            Taux de réponse faible — relancez vos collaborateurs
                          </div>
                        )}
                      </>
                    ) : (
                      <div>
                        <div style={{ fontSize:13, color:"#94A3B8", marginBottom:10 }}>Aucun lien envoyé</div>
                        <button className="hk-btn" onClick={() => setNavActif("equipes")}
                          style={{ padding:"7px 14px", background:"#00695C", color:"#fff", fontSize:12 }}>
                          Lancer →
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Rapports */}
                  <div className="hk-kpi-card" style={{ "--kpi-color":"#4A148C" } as any}>
                    <div className="hk-section-title">Rapports PDF</div>
                    {score ? (
                      <div style={{ display:"flex", flexDirection:"column" as const, gap:8 }}>
                        <button className="hk-btn" onClick={() => genererRapport("executif")} disabled={!!rapportLoading}
                          style={{ padding:"10px 14px", background:rapportLoading==="executif"?"#9FA8DA":"#00695C", color:"#fff", fontSize:12, textAlign:"left" as const }}>
                          <div style={{ fontWeight:600 }}>{rapportLoading==="executif"?"⏳...":"📄 Rapport Exécutif"}</div>
                          <div style={{ fontSize:10, opacity:.8 }}>6 pages · DG & bailleurs</div>
                        </button>
                        <button className="hk-btn" onClick={() => genererRapport("analytique")} disabled={!!rapportLoading}
                          style={{ padding:"10px 14px", background:rapportLoading==="analytique"?"#9FA8DA":"#1A237E", color:"#fff", fontSize:12, textAlign:"left" as const }}>
                          <div style={{ fontWeight:600 }}>{rapportLoading==="analytique"?"⏳...":"📊 Rapport Analytique"}</div>
                          <div style={{ fontSize:10, opacity:.8 }}>14 pages · DRH détaillé</div>
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize:13, color:"#94A3B8" }}>Disponible après le diagnostic</div>
                    )}
                  </div>
                </div>

                {/* Score par dimension + Benchmarks */}
                <div className="hk-grid-2" style={{ marginBottom:16 }}>

                  {/* Dimensions */}
                  <div className="hk-card">
                    <div className="hk-section-title">Scores par dimension</div>
                    {score ? (
                      DIM_CONFIG.map(dim => (
                        <BarreDim key={dim.key}
                          score={score[dim.key]??0}
                          max={dim.max}
                          color={dim.color}
                          label={dim.label}
                          icon={dim.icon}
                        />
                      ))
                    ) : (
                      <div style={{ fontSize:13, color:"#94A3B8", textAlign:"center" as const, padding:"24px 0" }}>
                        Complétez le questionnaire pour voir les scores
                      </div>
                    )}
                    <button className="hk-btn" onClick={() => setNavActif("diagnostic")}
                      style={{ width:"100%", padding:"9px", background:"#F4F5F7", color:"#1A237E", fontSize:12, fontWeight:600, marginTop:8 }}>
                      {score ? "Voir le diagnostic complet →" : "Compléter le questionnaire →"}
                    </button>
                  </div>

                  {/* Benchmarks aperçu */}
                  <div className="hk-card">
                    <div className="hk-section-title">Position sectorielle</div>
                    {score ? (
                      <>
                        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16, padding:"14px 16px", background:"#F8F9FA", borderRadius:10 }}>
                          <div style={{ textAlign:"center" as const }}>
                            <div style={{ fontSize:28, fontWeight:700, color:"#1A237E" }}>{score.scoreGlobal}</div>
                            <div style={{ fontSize:10, color:"#94A3B8" }}>Votre score</div>
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:12, color:"#424242", marginBottom:6 }}>vs. moyenne sectorielle</div>
                            <div style={{ height:7, background:"#F0F0F0", borderRadius:99, overflow:"hidden", position:"relative" as const }}>
                              <div style={{ width:`${score.scoreGlobal}%`, height:"100%", background:"#1A237E", borderRadius:99 }}/>
                              <div style={{ position:"absolute" as const, top:0, left:"52%", width:2, height:"100%", background:"#E65100" }}/>
                            </div>
                            <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:"#94A3B8", marginTop:3 }}>
                              <span>0</span>
                              <span style={{ color:"#E65100" }}>↑ moy. 52</span>
                              <span>100</span>
                            </div>
                          </div>
                        </div>
                        {score.scoreGlobal > 52 ? (
                          <div style={{ padding:"8px 12px", background:"#E8F5E9", borderRadius:8, fontSize:12, color:"#2E7D32", fontWeight:500 }}>
                            ✓ Au-dessus de la moyenne sectorielle (+{score.scoreGlobal-52} pts)
                          </div>
                        ) : (
                          <div style={{ padding:"8px 12px", background:"#FFF3E0", borderRadius:8, fontSize:12, color:"#E65100", fontWeight:500 }}>
                            ↓ En dessous de la moyenne sectorielle ({52-score.scoreGlobal} pts à combler)
                          </div>
                        )}
                        <button className="hk-btn" onClick={() => router.push("/benchmarks")}
                          style={{ width:"100%", padding:"9px", background:"#F4F5F7", color:"#1A237E", fontSize:12, fontWeight:600, marginTop:12 }}>
                          Voir les benchmarks complets →
                        </button>
                      </>
                    ) : (
                      <div style={{ fontSize:13, color:"#94A3B8", textAlign:"center" as const, padding:"24px 0" }}>
                        Disponible après le diagnostic
                      </div>
                    )}
                  </div>
                </div>

                {/* Services complémentaires */}
                <div className="hk-card" style={{ marginBottom:16 }}>
                  <div className="hk-section-title">Services complémentaires</div>
                  <div className="hk-grid-3">
                    {[
                      { emoji:"📄", titre:"Production Documentaire", desc:"Stratégie, Charte, Politique Genre, PAG", color:"#1A237E", lien:"/documents" },
                      { emoji:"🎓", titre:"Formation Managers", desc:"33 thématiques · Configurateur devis", color:"#F57F17", lien:"/formation" },
                      { emoji:"📣", titre:"Communication Digitale", desc:"2 kits × 5 réseaux · IA + Sur mesure", color:"#00838F", lien:"/communication" },
                    ].map(s => (
                      <div key={s.titre}
                        onClick={() => router.push(s.lien)}
                        style={{ padding:"14px 16px", borderRadius:10, border:`1px solid ${s.color}20`, background:"#FAFAFA", cursor:"pointer", transition:"all .15s" }}
                        onMouseEnter={e => (e.currentTarget.style.background="#F0F4FF")}
                        onMouseLeave={e => (e.currentTarget.style.background="#FAFAFA")}>
                        <div style={{ fontSize:22, marginBottom:8 }}>{s.emoji}</div>
                        <div style={{ fontSize:12, fontWeight:700, color:s.color, marginBottom:4 }}>{s.titre}</div>
                        <div style={{ fontSize:11, color:"#94A3B8" }}>{s.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ════════ DIAGNOSTIC ════════ */}
            {navActif === "diagnostic" && (
              <div style={{ display:"flex", flexDirection:"column" as const, gap:14 }}>
                <div className="hk-grid-2">
                  {/* SOCLE détail */}
                  <div className="hk-card">
                    <div className="hk-section-title">Badge SOCLE — Conformité légale</div>
                    {socle ? (
                      <>
                        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                          <span style={{ fontSize:36 }}>{socle.badgeGlobal==="conforme"?"✅":socle.badgeGlobal==="en_cours"?"⏳":"⚠️"}</span>
                          <div>
                            <div style={{ fontSize:16, fontWeight:700, color:socle.badgeGlobal==="conforme"?"#2E7D32":socle.badgeGlobal==="en_cours"?"#E65100":"#B71C1C" }}>
                              {socle.badgeGlobal==="conforme"?"Conforme":socle.badgeGlobal==="en_cours"?"En cours de conformité":"Non conforme"}
                            </div>
                            <div style={{ fontSize:11, color:"#94A3B8" }}>CNPS · CMU · Médecine du travail · Prévoyance</div>
                          </div>
                        </div>
                        {Array.isArray(socle.alertes) && (socle.alertes as any[]).map((a:any,i:number) => (
                          <div key={i} style={{ display:"flex", gap:8, padding:"8px 12px", borderRadius:8, background:a.niveau==="rouge"?"#FFEBEE":"#FFF3E0", marginBottom:6 }}>
                            <div style={{ width:6, height:6, borderRadius:"50%", background:a.niveau==="rouge"?"#B71C1C":"#E65100", flexShrink:0, marginTop:4 }}/>
                            <div style={{ fontSize:12, color:a.niveau==="rouge"?"#B71C1C":"#E65100", lineHeight:1.5 }}>
                              <strong>{a.composante}</strong> — {a.message}
                            </div>
                          </div>
                        ))}
                        <button className="hk-btn" onClick={() => router.push(`/diagnostic/${latest.id}/socle`)}
                          style={{ padding:"9px 16px", background:"#F4F5F7", color:"#1A237E", fontSize:12, fontWeight:600, marginTop:8 }}>
                          Mettre à jour le SOCLE →
                        </button>
                      </>
                    ) : (
                      <div>
                        <div style={{ fontSize:13, color:"#94A3B8", marginBottom:14 }}>SOCLE non encore évalué</div>
                        <button className="hk-btn" onClick={() => router.push(`/diagnostic/${latest.id}/socle`)}
                          style={{ padding:"10px 20px", background:"#B71C1C", color:"#fff", fontSize:13 }}>
                          Évaluer le SOCLE →
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Score détail */}
                  <div className="hk-card">
                    <div className="hk-section-title">Score MMI — Maturité Inclusive</div>
                    {score ? (
                      <>
                        <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:16 }}>
                          <div style={{ position:"relative" as const }}>
                            <JaugeCirculaire score={score.scoreGlobal} color={niveau?.color??"#1A237E"} size={100}/>
                            <div style={{ position:"absolute" as const, inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" as const }}>
                              <span style={{ fontSize:24, fontWeight:700, color:"#0F172A" }}>{score.scoreGlobal}</span>
                              <span style={{ fontSize:10, color:"#94A3B8" }}>/100</span>
                            </div>
                          </div>
                          <div>
                            {niveau && <span style={{ display:"inline-block", padding:"5px 14px", borderRadius:99, background:niveau.bg, color:niveau.color, fontSize:12, fontWeight:700, marginBottom:8 }}>
                              Niveau {score.niveauMmi} — {niveau.label}
                            </span>}
                            <div style={{ fontSize:12, color:"#64748B", lineHeight:1.6 }}>
                              Objectif Label Haki : <strong>75/100</strong><br/>
                              Il vous manque <strong style={{ color:"#1A237E" }}>{Math.max(0,75-score.scoreGlobal)} points</strong>
                            </div>
                          </div>
                        </div>
                        {DIM_CONFIG.map(dim => <BarreDim key={dim.key} score={score[dim.key]??0} max={dim.max} color={dim.color} label={dim.label} icon={dim.icon}/>)}
                        <button className="hk-btn" onClick={() => router.push(`/diagnostic/${latest.id}/organisation`)}
                          style={{ padding:"9px 16px", background:"#F4F5F7", color:"#1A237E", fontSize:12, fontWeight:600, marginTop:8 }}>
                          Modifier le questionnaire →
                        </button>
                      </>
                    ) : (
                      <div>
                        <div style={{ fontSize:13, color:"#94A3B8", marginBottom:14 }}>Questionnaire non complété</div>
                        <button className="hk-btn" onClick={() => router.push(`/diagnostic/${latest.id}/organisation`)}
                          style={{ padding:"10px 20px", background:"#1A237E", color:"#fff", fontSize:13 }}>
                          Remplir le questionnaire →
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rapports PDF */}
                {score && (
                  <div className="hk-card">
                    <div className="hk-section-title">Rapports PDF</div>
                    <div className="hk-grid-2" style={{ gap:12 }}>
                      <button className="hk-btn" onClick={() => genererRapport("executif")} disabled={!!rapportLoading}
                        style={{ padding:"16px 20px", background:rapportLoading==="executif"?"#9FA8DA":"#00695C", color:"#fff", fontSize:13, textAlign:"left" as const }}>
                        <div style={{ fontSize:22, marginBottom:6 }}>📄</div>
                        <div style={{ fontWeight:700 }}>{rapportLoading==="executif"?"⏳ Génération...":"Rapport Exécutif"}</div>
                        <div style={{ fontSize:11, opacity:.8 }}>6 pages · Pour le DG, bailleurs, partenaires</div>
                      </button>
                      <button className="hk-btn" onClick={() => genererRapport("analytique")} disabled={!!rapportLoading}
                        style={{ padding:"16px 20px", background:rapportLoading==="analytique"?"#9FA8DA":"#1A237E", color:"#fff", fontSize:13, textAlign:"left" as const }}>
                        <div style={{ fontSize:22, marginBottom:6 }}>📊</div>
                        <div style={{ fontWeight:700 }}>{rapportLoading==="analytique"?"⏳ Génération...":"Rapport Analytique"}</div>
                        <div style={{ fontSize:11, opacity:.8 }}>14 pages · Pour le DRH, détail par composante</div>
                      </button>
                    </div>
                    {rapportLoading && <div style={{ marginTop:10, fontSize:12, color:"#00695C" }}>⏳ Génération en cours — 20 à 30 secondes...</div>}
                  </div>
                )}
              </div>
            )}

            {/* ════════ ÉQUIPES (Baromètre) ════════ */}
            {navActif === "equipes" && (
              <div style={{ display:"flex", flexDirection:"column" as const, gap:14 }}>
                {/* Stats collaborateurs */}
                {statsCollab && statsCollab.total > 0 && (
                  <div className="hk-grid-4">
                    {[
                      { label:"Liens envoyés",   val:statsCollab.total,    color:"#1A237E", bg:"#E8EAF6" },
                      { label:"Réponses reçues", val:statsCollab.utilises, color:"#2E7D32", bg:"#E8F5E9" },
                      { label:"En attente",      val:statsCollab.enAttente,color:"#E65100", bg:"#FFF3E0" },
                      { label:"Taux de réponse", val:`${collabTaux}%`,     color:"#00695C", bg:"#E0F2F1" },
                    ].map(k => (
                      <div key={k.label} style={{ background:k.bg, borderRadius:10, padding:"14px 16px", border:`1px solid ${k.color}20` }}>
                        <div style={{ fontSize:24, fontWeight:700, color:k.color, marginBottom:3 }}>{k.val}</div>
                        <div style={{ fontSize:11, color:"#64748B" }}>{k.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="hk-card">
                  <div className="hk-section-title">Baromètre COLLABORATEURS</div>
                  <div style={{ fontSize:12, color:"#64748B", marginBottom:16 }}>Liens anonymes · Résultats agrégés · Conformité données garantie</div>

                  {modeCollab === "none" && (
                    <div className="hk-grid-2" style={{ gap:10 }}>
                      <button className="hk-btn" onClick={() => setModeCollab("email")}
                        style={{ padding:"16px", background:"#E8EAF6", color:"#1A237E", border:"1px solid #C5CAE9", fontSize:13, textAlign:"left" as const }}>
                        <div style={{ fontSize:22, marginBottom:6 }}>📧</div>
                        <div style={{ fontWeight:600 }}>Inviter par email</div>
                        <div style={{ fontSize:11, color:"#7986CB", marginTop:2 }}>Envoi automatique du lien anonyme</div>
                      </button>
                      <button className="hk-btn" onClick={() => setModeCollab("lien")}
                        style={{ padding:"16px", background:"#E0F2F1", color:"#00695C", border:"1px solid #A5D6A7", fontSize:13, textAlign:"left" as const }}>
                        <div style={{ fontSize:22, marginBottom:6 }}>🔗</div>
                        <div style={{ fontWeight:600 }}>Générer des liens</div>
                        <div style={{ fontSize:11, color:"#4DB6AC", marginTop:2 }}>Copier et partager manuellement</div>
                      </button>
                    </div>
                  )}

                  {modeCollab !== "none" && (
                    <>
                      <button className="hk-btn" onClick={() => setModeCollab("none")}
                        style={{ padding:"6px 12px", background:"#F4F5F7", color:"#424242", border:"1px solid #E0E0E0", fontSize:12, marginBottom:14 }}>
                        ← Changer de méthode
                      </button>
                      {modeCollab === "email" && (
                        <div>
                          <textarea value={emailsCollabText} onChange={e=>setEmailsCollabText(e.target.value)}
                            placeholder={"collab1@entreprise.ci\ncollab2@entreprise.ci"}
                            rows={4} style={{ width:"100%", padding:"10px 12px", border:"1px solid #E0E0E0", borderRadius:8, fontSize:13, fontFamily:"'DM Sans',system-ui", resize:"vertical" as const, marginBottom:10, boxSizing:"border-box" as const }}/>
                          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            <span style={{ fontSize:12, color:"#94A3B8" }}>{emailsCollabText.split(/[\n,;]+/).filter(e=>e.trim().includes("@")).length} adresse(s)</span>
                            <button className="hk-btn" onClick={envoyerEmailsCollab} disabled={collabLoading}
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
                            <input type="number" value={nbLiens} onChange={e=>setNbLiens(Number(e.target.value))} min={1} max={5000}
                              style={{ padding:"7px 10px", border:"1px solid #E0E0E0", borderRadius:7, fontSize:13, width:80 }}/>
                            <button className="hk-btn" onClick={genererLiensCollab} disabled={collabLoading}
                              style={{ padding:"8px 16px", background:collabLoading?"#9FA8DA":"#00695C", color:"#fff", fontSize:13 }}>
                              {collabLoading?"Génération...":"Générer →"}
                            </button>
                          </div>
                          {liensGeneres.length > 0 && (
                            <div>
                              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                                <span style={{ fontSize:12, color:"#2E7D32" }}>✓ {liensGeneres.length} liens générés</span>
                                <button className="hk-btn" onClick={() => copierTexte(liensGeneres.map(l=>l.url).join("\n"),"col-tous")}
                                  style={{ padding:"4px 10px", background:copie==="col-tous"?"#2E7D32":"#E0F2F1", color:copie==="col-tous"?"#fff":"#00695C", fontSize:11 }}>
                                  {copie==="col-tous"?"✓ Copié":"Copier tous"}
                                </button>
                              </div>
                              <div style={{ background:"#F4F5F7", borderRadius:8, padding:12, maxHeight:200, overflowY:"auto" as const }}>
                                {liensGeneres.map((l,i) => (
                                  <div key={i} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                                    <span style={{ fontSize:10, color:"#94A3B8", minWidth:20 }}>{i+1}.</span>
                                    <span style={{ fontSize:11, color:"#1A237E", fontFamily:"'DM Mono',monospace", flex:1, wordBreak:"break-all" as const }}>{l.url}</span>
                                    <button className="hk-btn" onClick={() => copierTexte(l.url,l.id)}
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
              </div>
            )}

            {/* ════════ MANAGERS ════════ */}
            {navActif === "managers" && (
              <div className="hk-card">
                <div className="hk-section-title">Auto-diagnostic MANAGERS</div>
                <ManagerSection sessionId={latest.id} copie={copie} setCopie={setCopie}/>
              </div>
            )}

            {/* ════════ SERVICES ════════ */}
            {navActif === "services" && (
              <div style={{ display:"flex", flexDirection:"column" as const, gap:14 }}>
                {/* Production documentaire */}
                <div style={{ background:"linear-gradient(135deg,#1A237E,#283593)", borderRadius:14, padding:24 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap" as const, gap:16 }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:"#FFC107", marginBottom:6 }}>📄 PRODUCTION DOCUMENTAIRE GIS</div>
                      <div style={{ fontSize:13, color:"#C5CAE9", marginBottom:10 }}>5 documents · Stratégie, Charte, Politique Genre, PAG, Mécanisme S&E</div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" as const }}>
                        {["Pack Essentiel -20%","Pack Conformité -25%","Pack Transformation -30%"].map((p,i) => (
                          <span key={p} style={{ fontSize:10, padding:"3px 10px", borderRadius:99, background:i===2?"rgba(255,193,7,0.2)":"rgba(255,255,255,0.08)", color:i===2?"#FFC107":"#C5CAE9" }}>{p}</span>
                        ))}
                      </div>
                    </div>
                    <button className="hk-btn" onClick={() => router.push("/documents")}
                      style={{ padding:"12px 24px", background:"#FFC107", color:"#1A237E", fontSize:13, fontWeight:700 }}>
                      Voir le catalogue →
                    </button>
                  </div>
                </div>
                {/* Formation */}
                <div style={{ background:"linear-gradient(135deg,#E65100,#F57F17)", borderRadius:14, padding:24 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap" as const, gap:16 }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:"#fff", marginBottom:6 }}>🎓 FORMATION HAKI MANAGERS</div>
                      <div style={{ fontSize:13, color:"rgba(255,255,255,0.85)", marginBottom:10 }}>33 thématiques · Présentiel & en ligne · Certification disponible</div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" as const }}>
                        {["Genre & VIH","Handicap","Anti-tribalisme","Leadership","Sur mesure"].map(t => (
                          <span key={t} style={{ fontSize:10, padding:"3px 10px", borderRadius:99, background:"rgba(255,255,255,0.2)", color:"#fff" }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <button className="hk-btn" onClick={() => router.push("/formation")}
                      style={{ padding:"12px 24px", background:"#fff", color:"#E65100", fontSize:13, fontWeight:700 }}>
                      Voir le catalogue →
                    </button>
                  </div>
                </div>
                {/* Communication */}
                <div style={{ background:"linear-gradient(135deg,#00695C,#00838F)", borderRadius:14, padding:24 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap" as const, gap:16 }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:"#fff", marginBottom:6 }}>📣 COMMUNICATION DIGITALE GIS</div>
                      <div style={{ fontSize:13, color:"rgba(255,255,255,0.85)", marginBottom:10 }}>LinkedIn · Facebook · Twitter · Email · WhatsApp · IA + Sur mesure</div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" as const }}>
                        {["Kit Journées GIS","Kit Plan d'Action","Génération IA","Sur mesure"].map(t => (
                          <span key={t} style={{ fontSize:10, padding:"3px 10px", borderRadius:99, background:"rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.9)" }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <button className="hk-btn" onClick={() => router.push("/communication")}
                      style={{ padding:"12px 24px", background:"#fff", color:"#00695C", fontSize:13, fontWeight:700 }}>
                      Créer mes contenus →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ════════ BENCHMARKS ════════ */}
            {navActif === "benchmarks" && (
              <div className="hk-card" style={{ textAlign:"center" as const, padding:"40px 24px" }}>
                <div style={{ fontSize:32, marginBottom:12 }}>📈</div>
                <div style={{ fontSize:16, fontWeight:700, color:"#1A237E", marginBottom:6 }}>Benchmarks sectoriels</div>
                <div style={{ fontSize:13, color:"#64748B", marginBottom:20 }}>Comparez votre score aux entreprises de votre secteur</div>
                <button className="hk-btn" onClick={() => router.push("/benchmarks")}
                  style={{ padding:"12px 28px", background:"#1A237E", color:"#fff", fontSize:13, fontWeight:600 }}>
                  Accéder aux benchmarks →
                </button>
              </div>
            )}

            {/* ════════ CALENDRIER ════════ */}
            {navActif === "calendrier" && <CalendrierGIS/>}

          </div>
        )}
      </div>

      {/* ONBOARDING GUIDE */}
      <OnboardingGuide
        score={score}
        socle={socle}
        statsCollab={statsCollab}
        sessionId={latest?.id ?? null}
        onNavigate={(path) => router.push(path)}
      />
    </div>
  );
}