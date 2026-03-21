"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const DIM_CONFIG = [
  { key:"scoreDim1Genre",    label:"Genre & Égalité + VIH/Sida",        max:38, color:"#1A237E" },
  { key:"scoreDim2Handicap", label:"Handicap + Médecine du travail",     max:26, color:"#00695C" },
  { key:"scoreDim3Multicult",label:"Multiculturalité & Anti-tribalisme", max:25, color:"#E65100" },
  { key:"scoreDim4Intergen", label:"Intergénérationnel + QVT",           max:11, color:"#2E7D32" },
];

const NIVEAUX: Record<number,{label:string;color:string;bg:string}> = {
  1:{label:"Non-conforme",   color:"#B71C1C",bg:"#FFEBEE"},
  2:{label:"Conforme",       color:"#E65100",bg:"#FFF3E0"},
  3:{label:"Consciente",     color:"#F57F17",bg:"#FFFDE7"},
  4:{label:"Engagée",        color:"#00695C",bg:"#E0F2F1"},
  5:{label:"Transformatrice",color:"#1A237E",bg:"#E8EAF6"},
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Collaborateurs
  const [modeCollab, setModeCollab] = useState<"none"|"email"|"lien">("none");
  const [emailsCollabText, setEmailsCollabText] = useState("");
  const [nbLiens, setNbLiens] = useState(10);
  const [collabLoading, setCollabLoading] = useState(false);
  const [collabResult, setCollabResult] = useState<any>(null);
  const [liensGeneres, setLiensGeneres] = useState<any[]>([]);
  const [statsCollab, setStatsCollab] = useState<any>(null);
  const [copie, setCopie] = useState<string>("");
  // Managers
  const [modeManager, setModeManager] = useState<"none"|"email"|"lien">("none");
  const [emailsManagerText, setEmailsManagerText] = useState("");
  const [managerLoading, setManagerLoading] = useState(false);
  const [managerResult, setManagerResult] = useState<any>(null);
  const [liensManagers, setLiensManagers] = useState<string[]>([]);
  const [statsManager, setStatsManager] = useState<any>(null);

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
    fetch(`/api/sessions/${sessions[0].id}/liens-collaborateur`).then(r => r.json()).then(d => { if (d.stats) setStatsCollab(d.stats); });
    fetch(`/api/sessions/${sessions[0].id}/envoyer-liens-managers`).then(r => r.json()).then(d => { if (d.stats) setStatsManager(d.stats); });
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
    if (emails.length === 0) { alert("Aucune adresse email valide."); return; }
    setCollabLoading(true); setCollabResult(null);
    const res = await fetch(`/api/sessions/${sessions[0].id}/envoyer-liens`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ emails }) });
    const data = await res.json();
    setCollabResult(data); setCollabLoading(false);
    const d = await fetch(`/api/sessions/${sessions[0].id}/liens-collaborateur`).then(r => r.json());
    if (d.stats) setStatsCollab(d.stats);
  }

  async function genererLiensCollab() {
    if (!sessions[0]?.id) return;
    setCollabLoading(true);
    const res = await fetch(`/api/sessions/${sessions[0].id}/liens-collaborateur`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ nombre: nbLiens }) });
    const data = await res.json();
    if (data.tokens) { setLiensGeneres(data.tokens); const d = await fetch(`/api/sessions/${sessions[0].id}/liens-collaborateur`).then(r => r.json()); if (d.stats) setStatsCollab(d.stats); }
    setCollabLoading(false);
  }

  async function envoyerEmailsManager() {
    if (!sessions[0]?.id) return;
    const emails = emailsManagerText.split(/[\n,;]+/).map(e => e.trim()).filter(e => e.includes("@"));
    if (emails.length === 0) { alert("Aucune adresse email valide."); return; }
    setManagerLoading(true); setManagerResult(null);
    const res = await fetch(`/api/sessions/${sessions[0].id}/envoyer-liens-managers`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ emails }) });
    const data = await res.json();
    setManagerResult(data); setManagerLoading(false);
    if (data.liens) setLiensManagers(data.liens);
    const d = await fetch(`/api/sessions/${sessions[0].id}/envoyer-liens-managers`).then(r => r.json());
    if (d.stats) setStatsManager(d.stats);
  }

  async function genererLiensManager() {
    if (!sessions[0]?.id) return;
    setManagerLoading(true);
    const appUrl = "https://haki-mvp.vercel.app";
    const { createHash, randomUUID } = await import("crypto").catch(() => ({ createHash: null, randomUUID: null }));
    // On passe par l'API admin pour générer un lien sans email
    const res = await fetch(`/api/admin/creer-token-manager`);
    const data = await res.json();
    if (data.url) setLiensManagers(l => [...l, data.url]);
    setManagerLoading(false);
  }

  function copierTexte(texte: string, id: string) {
    navigator.clipboard.writeText(texte);
    setCopie(id);
    setTimeout(() => setCopie(""), 2000);
  }

  if (status === "loading" || loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"system-ui" }}>
      <div style={{ color:"#1A237E" }}>Chargement...</div>
    </div>
  );

  const latest = sessions[0];
  const score = latest?.scoreMmiCi;
  const socle = latest?.socleDiagnostic;
  const niveau = score ? NIVEAUX[score.niveauMmi] : null;
  const user = session?.user as any;

  const SectionBarometre = ({ titre, sous, couleur, bgCouleur, stats, mode, setMode, emailsText, setEmailsText, onEmail, onLien, emailLoading, emailResult, liens, nbL, setNbL, onGenererLien, labelEmail, labelLien, noteTest }: any) => (
    <div style={{ background:"#fff", borderRadius:12, padding:22, marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:500, color:"#424242" }}>{titre}</div>
          <div style={{ fontSize:12, color:"#9E9E9E", marginTop:2 }}>{sous}</div>
        </div>
        {stats && (
          <div style={{ display:"flex", gap:16, fontSize:12 }}>
            <span><strong style={{ color:couleur }}>{stats.total}</strong> <span style={{ color:"#9E9E9E" }}>liens</span></span>
            <span><strong style={{ color:"#2E7D32" }}>{stats.completes ?? stats.utilises}</strong> <span style={{ color:"#9E9E9E" }}>{stats.completes !== undefined ? "complétés" : "réponses"}</span></span>
            <span><strong style={{ color:"#E65100" }}>{stats.enAttente}</strong> <span style={{ color:"#9E9E9E" }}>en attente</span></span>
          </div>
        )}
      </div>

      {mode === "none" && (
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => setMode("email")} style={{ flex:1, padding:"14px 16px", background:`${bgCouleur}`, color:couleur, border:`1.5px solid ${couleur}40`, borderRadius:10, fontSize:13, fontWeight:500, cursor:"pointer", textAlign:"left" }}>
            <div style={{ fontSize:18, marginBottom:4 }}>📧</div>
            <div>{labelEmail}</div>
            <div style={{ fontSize:11, color:`${couleur}99`, marginTop:2 }}>Saisir les adresses — envoi automatique</div>
          </button>
          <button onClick={() => setMode("lien")} style={{ flex:1, padding:"14px 16px", background:"#E0F2F1", color:"#00695C", border:"1.5px solid #A5D6A7", borderRadius:10, fontSize:13, fontWeight:500, cursor:"pointer", textAlign:"left" }}>
            <div style={{ fontSize:18, marginBottom:4 }}>🔗</div>
            <div>{labelLien}</div>
            <div style={{ fontSize:11, color:"#4DB6AC", marginTop:2 }}>Copier et partager manuellement</div>
          </button>
        </div>
      )}

      {mode !== "none" && (
        <>
          <button onClick={() => setMode("none")} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:"#F5F5F5", color:"#424242", border:"1.5px solid #E0E0E0", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", marginBottom:16 }}>
            ← Changer de méthode
          </button>

          {mode === "email" && (
            <div>
              <div style={{ fontSize:13, color:"#424242", marginBottom:8 }}>Saisissez les adresses email — une par ligne ou séparées par des virgules :</div>
              <textarea value={emailsText} onChange={e => setEmailsText(e.target.value)}
                placeholder={"email1@entreprise.ci\nemail2@entreprise.ci"}
                rows={5} style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #E0E0E0", borderRadius:8, fontSize:13, fontFamily:"monospace", resize:"vertical", marginBottom:10, boxSizing:"border-box" }} />
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                <div style={{ fontSize:12, color:"#9E9E9E" }}>{emailsText.split(/[\n,;]+/).filter(e => e.trim().includes("@")).length} adresse(s) détectée(s)</div>
                <button onClick={onEmail} disabled={emailLoading}
                  style={{ padding:"10px 20px", background:emailLoading?"#9FA8DA":couleur, color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:emailLoading?"default":"pointer" }}>
                  {emailLoading ? "Envoi en cours..." : "Envoyer les liens →"}
                </button>
              </div>
              {emailResult && (
                <div style={{ padding:"12px 16px", borderRadius:8, background:emailResult.erreurs>0?"#FFF3E0":"#E8F5E9", fontSize:13, color:emailResult.erreurs>0?"#E65100":"#2E7D32", marginBottom:10 }}>
                  {emailResult.envoyes > 0 && <div>✓ {emailResult.envoyes} email(s) envoyé(s) avec succès</div>}
                  {emailResult.erreurs > 0 && <div>⚠ {emailResult.erreurs} email(s) non envoyé(s)</div>}
                </div>
              )}
              {noteTest && <div style={{ fontSize:11, color:"#9E9E9E", lineHeight:1.6 }}>⚠ {noteTest}</div>}
            </div>
          )}

          {mode === "lien" && (
            <div>
              {nbL !== undefined && (
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                  <span style={{ fontSize:13, color:"#424242" }}>Nombre de liens :</span>
                  <input type="number" value={nbL} onChange={e => setNbL(Number(e.target.value))} min={1} max={500}
                    style={{ padding:"8px 12px", border:"1.5px solid #E0E0E0", borderRadius:8, fontSize:14, width:90 }} />
                  <button onClick={onLien} disabled={emailLoading}
                    style={{ padding:"9px 18px", background:emailLoading?"#9FA8DA":"#00695C", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:emailLoading?"default":"pointer" }}>
                    {emailLoading ? "Génération..." : "Générer →"}
                  </button>
                </div>
              )}
              {nbL === undefined && (
                <button onClick={onLien} disabled={emailLoading}
                  style={{ padding:"9px 18px", background:emailLoading?"#9FA8DA":"#00695C", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:emailLoading?"default":"pointer", marginBottom:14 }}>
                  {emailLoading ? "Génération..." : "Générer un lien →"}
                </button>
              )}
              {liens.length > 0 && (
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <div style={{ fontSize:12, color:"#2E7D32" }}>✓ {liens.length} lien(s) généré(s)</div>
                    <button onClick={() => copierTexte(liens.map((l:any) => l.url ?? l).join("\n"), "tous")}
                      style={{ padding:"5px 12px", background:copie==="tous"?"#2E7D32":"#E0F2F1", color:copie==="tous"?"#fff":"#00695C", border:"none", borderRadius:6, fontSize:12, fontWeight:500, cursor:"pointer" }}>
                      {copie==="tous"?"✓ Copié !":"Copier tous"}
                    </button>
                  </div>
                  <div style={{ background:"#F5F5F5", borderRadius:8, padding:14, maxHeight:200, overflowY:"auto" }}>
                    {liens.map((l:any, i:number) => {
                      const url = l.url ?? l;
                      const id = l.id ?? String(i);
                      return (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                          <span style={{ fontSize:11, color:"#757575", minWidth:22 }}>{i+1}.</span>
                          <span style={{ fontSize:11, color:"#1A237E", fontFamily:"monospace", flex:1, wordBreak:"break-all" }}>{url}</span>
                          <button onClick={() => copierTexte(url, id)}
                            style={{ padding:"3px 10px", background:copie===id?"#2E7D32":"#E0F2F1", color:copie===id?"#fff":"#00695C", border:"none", borderRadius:4, fontSize:11, cursor:"pointer", flexShrink:0 }}>
                            {copie===id?"✓":"Copier"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop:10, fontSize:11, color:"#9E9E9E" }}>Partagez par email ou WhatsApp · Lien à usage unique · Expiration 30 jours</div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div style={{ fontFamily:"system-ui,sans-serif", background:"#F5F5F5", minHeight:"100vh" }}>
      <div style={{ background:"#1A237E", padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:20, fontWeight:600, color:"#FFC107", letterSpacing:2 }}>HAKI</span>
          <span style={{ fontSize:12, color:"#9FA8DA" }}>Plateforme DEI · Côte d'Ivoire</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:12, color:"#C5CAE9" }}>{user?.organisationNom}</span>
          <span style={{ background:"#283593", padding:"3px 10px", borderRadius:99, fontSize:11, color:"#90CAF9" }}>{user?.role?.toUpperCase()}</span>
          <button onClick={() => signOut({ callbackUrl:"/connexion" })} style={{ background:"transparent", border:"1px solid #3949AB", color:"#90CAF9", borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer" }}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 20px" }}>
        {!latest && (
          <div style={{ background:"#fff", borderRadius:12, padding:36, textAlign:"center", border:"2px dashed #E0E0E0" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🚀</div>
            <div style={{ fontSize:18, fontWeight:500, marginBottom:8, color:"#1A237E" }}>Lancer votre premier diagnostic Haki</div>
            <div style={{ fontSize:14, color:"#757575", marginBottom:24 }}>Commencez par le SOCLE puis les 4 dimensions DEI.</div>
            <button onClick={creerSession} style={{ background:"#1A237E", color:"#fff", border:"none", borderRadius:8, padding:"12px 28px", fontSize:14, fontWeight:500, cursor:"pointer" }}>Créer un diagnostic</button>
          </div>
        )}

        {latest && (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              <div style={{ background:"#fff", borderRadius:12, padding:24 }}>
                <div style={{ fontSize:11, color:"#9E9E9E", letterSpacing:".05em", marginBottom:12 }}>SCORE MMI-CI GLOBAL</div>
                {score ? (
                  <>
                    <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:10 }}>
                      <span style={{ fontSize:52, fontWeight:500, color:"#1A237E", lineHeight:1 }}>{score.scoreGlobal}</span>
                      <span style={{ fontSize:18, color:"#9E9E9E" }}>/100</span>
                    </div>
                    {niveau && <span style={{ display:"inline-block", padding:"5px 14px", borderRadius:99, background:niveau.bg, color:niveau.color, fontSize:12, fontWeight:500 }}>Niveau {score.niveauMmi} — {niveau.label}</span>}
                  </>
                ) : <div style={{ fontSize:14, color:"#9E9E9E" }}>Score calculé après complétion du questionnaire</div>}
              </div>

              <div style={{ background:"#fff", borderRadius:12, padding:24 }}>
                <div style={{ fontSize:11, color:"#9E9E9E", letterSpacing:".05em", marginBottom:12 }}>BADGE SOCLE — CONFORMITÉ LÉGALE CI</div>
                {socle ? (
                  <>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                      <span style={{ fontSize:22 }}>{socle.badgeGlobal==="conforme"?"✅":socle.badgeGlobal==="en_cours"?"⏳":"⚠️"}</span>
                      <span style={{ fontSize:14, fontWeight:500, color:socle.badgeGlobal==="conforme"?"#2E7D32":socle.badgeGlobal==="en_cours"?"#E65100":"#B71C1C" }}>
                        {socle.badgeGlobal==="conforme"?"Conforme":socle.badgeGlobal==="en_cours"?"En cours":"Non conforme"}
                      </span>
                    </div>
                    {Array.isArray(socle.alertes) && (socle.alertes as any[]).slice(0,2).map((a:any,i:number) => (
                      <div key={i} style={{ display:"flex", gap:8, padding:"7px 10px", borderRadius:6, background:a.niveau==="rouge"?"#FFEBEE":"#FFF3E0", marginBottom:5, fontSize:12, color:a.niveau==="rouge"?"#B71C1C":"#E65100" }}>
                        <div style={{ width:7, height:7, borderRadius:"50%", background:a.niveau==="rouge"?"#B71C1C":"#E65100", flexShrink:0, marginTop:3 }}/>
                        <div><strong>{a.composante}</strong> — {a.message}</div>
                      </div>
                    ))}
                  </>
                ) : <div style={{ fontSize:14, color:"#9E9E9E" }}>SOCLE non encore évalué</div>}
              </div>
            </div>

            {score && (
              <div style={{ background:"#fff", borderRadius:12, padding:22, marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:500, color:"#424242", marginBottom:16 }}>Scores par dimension MMI-CI</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  {DIM_CONFIG.map(dim => {
                    const s = score[dim.key] ?? 0;
                    const pct = Math.round((s/dim.max)*100);
                    return (
                      <div key={dim.key}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <div style={{ fontSize:12, fontWeight:500, color:dim.color }}>{dim.label}</div>
                          <div style={{ fontSize:12, fontWeight:500, color:dim.color }}>{s}/{dim.max}</div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ flex:1, height:8, background:"#F5F5F5", borderRadius:4, overflow:"hidden" }}>
                            <div style={{ width:`${pct}%`, height:"100%", background:dim.color, borderRadius:4 }}/>
                          </div>
                          <div style={{ fontSize:12, fontWeight:500, color:dim.color, minWidth:32 }}>{pct}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <SectionBarometre
              titre="Baromètre COLLABORATEURS"
              sous="Liens anonymes · Résultats agrégés · Seuil n≥5"
              couleur="#1A237E" bgCouleur="#E8EAF6"
              stats={statsCollab}
              mode={modeCollab} setMode={setModeCollab}
              emailsText={emailsCollabText} setEmailsText={setEmailsCollabText}
              onEmail={envoyerEmailsCollab}
              onLien={genererLiensCollab}
              emailLoading={collabLoading}
              emailResult={collabResult}
              liens={liensGeneres}
              nbL={nbLiens} setNbL={setNbLiens}
              labelEmail="Inviter par email"
              labelLien="Générer des liens"
              noteTest="En mode test, l'envoi n'est possible que vers l'email de votre compte Resend."
            />

            <SectionBarometre
              titre="Auto-diagnostic MANAGERS"
              sous="Liens privés · Score strictement confidentiel · Jamais transmis à l'organisation"
              couleur="#E65100" bgCouleur="#FFF3E0"
              stats={statsManager}
              mode={modeManager} setMode={setModeManager}
              emailsText={emailsManagerText} setEmailsText={setEmailsManagerText}
              onEmail={envoyerEmailsManager}
              onLien={genererLiensManager}
              emailLoading={managerLoading}
              emailResult={managerResult}
              liens={liensManagers}
              nbL={undefined} setNbL={undefined}
              labelEmail="Envoyer par email aux managers"
              labelLien="Générer un lien manager"
              noteTest="En mode test, l'envoi n'est possible que vers l'email de votre compte Resend."
            />

            <div style={{ background:"#fff", borderRadius:12, padding:22 }}>
              <div style={{ fontSize:13, fontWeight:500, color:"#424242", marginBottom:14 }}>Actions diagnostic</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <button onClick={() => router.push(`/diagnostic/${latest.id}/socle`)}
                  style={{ padding:"9px 18px", background:"#FFEBEE", color:"#B71C1C", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer" }}>
                  {socle ? "Mettre à jour le SOCLE" : "Compléter le SOCLE"}
                </button>
                <button onClick={() => router.push(`/diagnostic/${latest.id}/organisation`)}
                  style={{ padding:"9px 18px", background:"#1A237E", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer" }}>
                  {score ? "Modifier le questionnaire" : "Questionnaire ORGANISATION"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
