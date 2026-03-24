"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Tab = "dashboard" | "notifications" | "clients" | "commandes" | "productions";

const STATUT_DOC: Record<string,{label:string;color:string;bg:string}> = {
  en_attente:        { label:"En attente",        color:"#E65100", bg:"#FFF3E0" },
  proforma_envoyee:  { label:"Proforma envoyée",   color:"#1565C0", bg:"#E3F2FD" },
  validee:           { label:"Validée",            color:"#2E7D32", bg:"#E8F5E9" },
  en_production:     { label:"En production",      color:"#6A1B9A", bg:"#F3E5F5" },
  livre:             { label:"Livré ✓",            color:"#1A237E", bg:"#E8EAF6" },
  annule:            { label:"Annulée",            color:"#B71C1C", bg:"#FFEBEE" },
};

const STATUTS_ORDRE = ["en_attente","proforma_envoyee","validee","en_production","livre","annule"];

const TYPE_DOC_LABELS: Record<string,string> = {
  strategie_genre:  "Stratégie Genre",
  charte_di:        "Charte Diversité & Inclusion",
  politique_genre:  "Politique Genre",
  pag:              "Plan d'Action Genre",
  mecanisme_se:     "Mécanisme Suivi-Évaluation",
};

const TYPE_PROD_LABELS: Record<string,{label:string;emoji:string;color:string}> = {
  rapport_pdf:      { label:"Rapport PDF",              emoji:"📄", color:"#1A237E" },
  document_gis:     { label:"Document GIS",             emoji:"📋", color:"#4A148C" },
  communication:    { label:"Communication digitale",   emoji:"📣", color:"#00838F" },
};

function fmt(n:number){ return n.toLocaleString("fr-FR")+" FCFA"; }
function fmtDate(d:string){ return d ? new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}) : "—"; }

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  // Clients
  const [searchClient, setSearchClient] = useState("");
  const [clientOuvert, setClientOuvert] = useState<string|null>(null);

  // Commandes
  const [searchCommande, setSearchCommande] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [commandeOuverte, setCommandeOuverte] = useState<string|null>(null);
  const [notesEdit, setNotesEdit] = useState<Record<string,string>>({});
  const [reductionEdit, setReductionEdit] = useState<Record<string,string>>({});
  const [savingCommande, setSavingCommande] = useState<string|null>(null);

  // Productions
  const [filtreTypeProd, setFiltreTypeProd] = useState("tous");

  useEffect(() => {
    const auth = sessionStorage.getItem("haki_admin_auth");
    if (!auth) { router.push("/admin/login"); return; }
    chargerDonnees();
  }, []);

  async function chargerDonnees() {
    setLoading(true);
    try {
      const pwd = sessionStorage.getItem("haki_admin_auth_pwd") ?? "";
      const res = await fetch("/api/admin/dashboard", {
        headers:{ "x-admin-auth": pwd }
      });
      if (res.status === 401) { router.push("/admin/login"); return; }
      const d = await res.json();
      setData(d);
    } catch {
      setErreur("Erreur chargement données.");
    }
    setLoading(false);
  }

  async function changerStatutCommande(commandeId: string, nouveauStatut: string) {
    setSavingCommande(commandeId);
    try {
      const pwd = sessionStorage.getItem("haki_admin_auth_pwd") ?? "";
      await fetch(`/api/admin/commandes/${commandeId}`, {
        method: "PATCH",
        headers: { "Content-Type":"application/json", "x-admin-auth": pwd },
        body: JSON.stringify({ statut: nouveauStatut }),
      });
      await chargerDonnees();
    } catch { setErreur("Erreur mise à jour statut."); }
    setSavingCommande(null);
  }

  async function sauvegarderCommande(commandeId: string) {
    setSavingCommande(commandeId);
    try {
      const pwd = sessionStorage.getItem("haki_admin_auth_pwd") ?? "";
      await fetch(`/api/admin/commandes/${commandeId}`, {
        method: "PATCH",
        headers: { "Content-Type":"application/json", "x-admin-auth": pwd },
        body: JSON.stringify({
          notesAdmin: notesEdit[commandeId] ?? "",
          montantFcfa: reductionEdit[commandeId] ? parseInt(reductionEdit[commandeId]) : undefined,
        }),
      });
      await chargerDonnees();
    } catch { setErreur("Erreur sauvegarde."); }
    setSavingCommande(null);
  }

  function deconnexion() {
    sessionStorage.removeItem("haki_admin_auth");
    sessionStorage.removeItem("haki_admin_auth_pwd");
    router.push("/admin/login");
  }

  const css = `
    * { box-sizing: border-box; }
    .adm-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap:12px; }
    .adm-btn { border:none; border-radius:7px; font-family:system-ui; cursor:pointer; font-weight:500; transition:opacity .15s; }
    .adm-btn:hover { opacity:.88; }
    .adm-btn:disabled { opacity:.5; cursor:default; }
    .inp { width:100%; padding:9px 12px; border:1px solid #E0E0E0; border-radius:7px; font-size:12px; font-family:system-ui; outline:none; }
    .inp:focus { border-color:#1A237E; }
    @media(max-width:900px){ .adm-grid-4 { grid-template-columns:1fr 1fr; } }
  `;

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#0D0D2B" }}>
      <div style={{ color:"#FFC107", fontSize:15, fontFamily:"system-ui" }}>Chargement Admin...</div>
    </div>
  );

  const stats = data?.stats ?? {};
  const clients = (data?.organisations ?? []).filter((o:any) =>
    o.nom.toLowerCase().includes(searchClient.toLowerCase())
  );
  const commandesEnAttente = (data?.commandes ?? []).filter((c:any) => c.statut==="en_attente");
  const commandes = (data?.commandes ?? []).filter((c:any) => {
    const matchSearch = c.organisationNom.toLowerCase().includes(searchCommande.toLowerCase()) ||
      (TYPE_DOC_LABELS[c.typeDocument]??c.typeDocument).toLowerCase().includes(searchCommande.toLowerCase());
    const matchStatut = filtreStatut === "tous" || c.statut === filtreStatut;
    return matchSearch && matchStatut;
  });
  const productions = data?.productions ?? [];
  const productionsFiltrees = filtreTypeProd === "tous" ? productions : productions.filter((p:any) => p.type === filtreTypeProd);

  // Stats productions
  const statsProds = {
    total: productions.length,
    rapports: productions.filter((p:any) => p.type === "rapport_pdf").length,
    documents: productions.filter((p:any) => p.type === "document_gis").length,
    comms: productions.filter((p:any) => p.type === "communication").length,
    echecs: productions.filter((p:any) => p.statut === "echec").length,
  };

  const TABS = [
    { id:"dashboard",     label:"📊 Tableau de bord",   badge:null },
    { id:"notifications", label:"🔔 Notifications",      badge:commandesEnAttente.length||null },
    { id:"clients",       label:"🏢 Clients",            badge:stats.totalOrgs||null },
    { id:"commandes",     label:"🛒 Commandes",          badge:stats.commandesEnAttente||null },
    { id:"productions",   label:"⚙️ Productions",        badge:statsProds.echecs||null },
  ];

  return (
    <div style={{ fontFamily:"system-ui,-apple-system,sans-serif", background:"#F0F2F5", minHeight:"100vh" }}>
      <style>{css}</style>

      {/* HEADER */}
      <div style={{ background:"#0D0D2B", padding:"0 28px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 8px rgba(0,0,0,0.4)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:18, fontWeight:700, color:"#FFC107", letterSpacing:3 }}>HAKI</span>
          <div style={{ width:1, height:16, background:"#2D2D5E" }}/>
          <span style={{ fontSize:11, color:"#4A5568", fontWeight:700, letterSpacing:".15em", textTransform:"uppercase" as const }}>Admin</span>
          {commandesEnAttente.length > 0 && (
            <span style={{ fontSize:10, background:"#B91C1C", color:"#fff", padding:"2px 8px", borderRadius:99, fontWeight:700 }}>
              {commandesEnAttente.length} en attente
            </span>
          )}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button className="adm-btn" onClick={() => router.push("/dashboard")}
            style={{ padding:"5px 12px", background:"#1A1A3E", color:"#9FA8DA", fontSize:11 }}>
            ← Plateforme
          </button>
          <button className="adm-btn" onClick={chargerDonnees}
            style={{ padding:"5px 12px", background:"#1A1A3E", color:"#FFC107", fontSize:11 }}>
            ↺ Actualiser
          </button>
          <button className="adm-btn" onClick={deconnexion}
            style={{ padding:"5px 12px", background:"#1A1A3E", color:"#6B7280", fontSize:11 }}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 20px" }}>

        {/* ONGLETS */}
        <div style={{ display:"flex", gap:6, marginBottom:24, flexWrap:"wrap" as const }}>
          {TABS.map(t => (
            <button key={t.id} className="adm-btn"
              onClick={() => setTab(t.id as Tab)}
              style={{ padding:"8px 16px", fontSize:12, fontWeight:600,
                background: tab===t.id ? "#1A237E" : "#fff",
                color: tab===t.id ? "#fff" : "#424242",
                boxShadow: tab===t.id ? "none" : "0 1px 3px rgba(0,0,0,0.07)" }}>
              {t.label}
              {(t.badge??0) > 0 && (
                <span style={{ fontSize:9, background:"#B91C1C", color:"#fff", padding:"1px 5px", borderRadius:99, marginLeft:5, fontWeight:700 }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══ DASHBOARD ══ */}
        {tab === "dashboard" && (
          <>
            <div className="adm-grid-4" style={{ marginBottom:20 }}>
              {[
                { label:"Organisations actives",  value:stats.totalOrgs??0,           icon:"🏢", color:"#1A237E", bg:"#E8EAF6" },
                { label:"Diagnostics complétés",  value:stats.sessionsAvecScore??0,    icon:"📋", color:"#00695C", bg:"#E0F2F1" },
                { label:"Score moyen /100",        value:`${stats.scoresMoyen??0}`,    icon:"⭐", color:"#E65100", bg:"#FFF3E0" },
                { label:"Commandes en attente",    value:stats.commandesEnAttente??0,  icon:"🔔", color:"#B71C1C", bg:"#FFEBEE" },
              ].map(k => (
                <div key={k.label} style={{ background:"#fff", borderRadius:12, padding:"18px 20px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", borderLeft:`3px solid ${k.color}` }}>
                  <div style={{ fontSize:20, marginBottom:8 }}>{k.icon}</div>
                  <div style={{ fontSize:26, fontWeight:700, color:k.color, marginBottom:4 }}>{k.value}</div>
                  <div style={{ fontSize:11, color:"#9E9E9E" }}>{k.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background:"linear-gradient(135deg,#1A237E,#283593)", borderRadius:12, padding:"20px 24px", marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:"#9FA8DA", letterSpacing:".1em", textTransform:"uppercase" as const, marginBottom:6 }}>Revenus estimés</div>
                <div style={{ fontSize:32, fontWeight:700, color:"#FFC107" }}>{fmt(stats.revenuEstime??0)}</div>
              </div>
              <div style={{ fontSize:48 }}>💰</div>
            </div>
            <div style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#1A237E", marginBottom:14 }}>Dernières commandes</div>
              {(data?.commandes??[]).length === 0 ? (
                <div style={{ fontSize:13, color:"#9E9E9E", textAlign:"center" as const, padding:"24px 0" }}>Aucune commande</div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column" as const, gap:6 }}>
                  {(data?.commandes??[]).slice(0,6).map((c:any) => {
                    const st = STATUT_DOC[c.statut] ?? STATUT_DOC["en_attente"];
                    return (
                      <div key={c.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"#F8F9FA", borderRadius:8 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, fontWeight:600 }}>{c.organisationNom}</div>
                          <div style={{ fontSize:11, color:"#9E9E9E" }}>{TYPE_DOC_LABELS[c.typeDocument]??c.typeDocument} · {c.niveau} · {fmtDate(c.commandeeLe)}</div>
                        </div>
                        <span style={{ fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:99, background:st.bg, color:st.color }}>{st.label}</span>
                        <div style={{ fontSize:12, fontWeight:600, color:"#1A237E", minWidth:90, textAlign:"right" as const }}>{fmt(c.montantFcfa??0)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ══ NOTIFICATIONS ══ */}
        {tab === "notifications" && (
          <div style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#1A237E", marginBottom:16 }}>Commandes en attente de traitement</div>
            {commandesEnAttente.length === 0 ? (
              <div style={{ textAlign:"center" as const, padding:"48px 0", color:"#9E9E9E" }}>
                <div style={{ fontSize:32, marginBottom:12 }}>✅</div>
                <div style={{ fontSize:14 }}>Aucune commande en attente</div>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column" as const, gap:10 }}>
                {commandesEnAttente.map((c:any) => (
                  <div key={c.id} style={{ padding:"16px 18px", background:"#FFF3E0", borderRadius:10, border:"1px solid #FFCC80" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap" as const, gap:10 }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:"#E65100", marginBottom:3 }}>
                          🔔 {c.organisationNom}
                        </div>
                        <div style={{ fontSize:12, color:"#757575" }}>
                          {TYPE_DOC_LABELS[c.typeDocument]??c.typeDocument} · Niveau {c.niveau} · {fmtDate(c.commandeeLe)}
                        </div>
                        <div style={{ fontSize:13, fontWeight:700, color:"#1A237E", marginTop:4 }}>{fmt(c.montantFcfa??0)}</div>
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        <button className="adm-btn"
                          onClick={() => changerStatutCommande(c.id, "proforma_envoyee")}
                          disabled={savingCommande===c.id}
                          style={{ padding:"8px 14px", background:"#1A237E", color:"#fff", fontSize:11 }}>
                          {savingCommande===c.id ? "..." : "Envoyer proforma →"}
                        </button>
                        <button className="adm-btn"
                          onClick={() => changerStatutCommande(c.id, "annule")}
                          disabled={savingCommande===c.id}
                          style={{ padding:"8px 14px", background:"#FFEBEE", color:"#B71C1C", fontSize:11 }}>
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ CLIENTS ══ */}
        {tab === "clients" && (
          <>
            <div style={{ marginBottom:14 }}>
              <input className="inp" value={searchClient} onChange={e=>setSearchClient(e.target.value)}
                placeholder="Rechercher une organisation..." style={{ maxWidth:400 }}/>
            </div>
            <div style={{ display:"flex", flexDirection:"column" as const, gap:8 }}>
              {clients.length === 0 ? (
                <div style={{ textAlign:"center" as const, padding:"48px 0", color:"#9E9E9E", background:"#fff", borderRadius:12 }}>
                  Aucun client trouvé
                </div>
              ) : clients.map((org:any) => {
                const diag = org.dernierDiagnostic;
                const score = (diag?.scoreMmiCi as any)?.scoreGlobal;
                const isOpen = clientOuvert === org.id;
                return (
                  <div key={org.id} style={{ background:"#fff", borderRadius:12, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
                    <div onClick={() => setClientOuvert(isOpen?null:org.id)}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 18px", cursor:"pointer" }}>
                      <div style={{ width:36, height:36, borderRadius:8, background:"#E8EAF6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🏢</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:"#1A237E" }}>{org.nom}</div>
                        <div style={{ fontSize:11, color:"#9E9E9E" }}>{org.secteur??"—"} · {org.ville??"—"} · {org.utilisateurs?.length??0} utilisateur{org.utilisateurs?.length>1?"s":""}</div>
                      </div>
                      {score !== undefined ? (
                        <div style={{ textAlign:"center" as const }}>
                          <div style={{ fontSize:20, fontWeight:700, color:"#1A237E" }}>{score}</div>
                          <div style={{ fontSize:9, color:"#9E9E9E" }}>Score</div>
                        </div>
                      ) : (
                        <span style={{ fontSize:10, color:"#9E9E9E", padding:"3px 8px", background:"#F5F5F5", borderRadius:99 }}>Pas de diagnostic</span>
                      )}
                      <span style={{ fontSize:11, color:"#BDBDBD" }}>{isOpen?"▲":"▼"}</span>
                    </div>
                    {isOpen && (
                      <div style={{ padding:"0 18px 18px", borderTop:"1px solid #F0F0F0" }}>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginTop:14, marginBottom:12 }}>
                          {[
                            { label:"Inscription", val:fmtDate(org.creeLe) },
                            { label:"Taille", val:org.taille??"—" },
                            { label:"Dernier diagnostic", val:diag?fmtDate(diag.creeLe):"Aucun" },
                          ].map(f => (
                            <div key={f.label} style={{ padding:"10px 12px", background:"#F8F9FA", borderRadius:8 }}>
                              <div style={{ fontSize:9, fontWeight:700, color:"#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".06em", marginBottom:3 }}>{f.label}</div>
                              <div style={{ fontSize:12 }}>{f.val}</div>
                            </div>
                          ))}
                        </div>
                        {org.utilisateurs?.map((u:any) => (
                          <div key={u.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px", background:"#F0F2F5", borderRadius:6, marginBottom:4 }}>
                            <div style={{ width:6, height:6, borderRadius:"50%", background:"#1A237E" }}/>
                            <span style={{ fontSize:12, flex:1 }}>{u.email}</span>
                            <span style={{ fontSize:10, padding:"2px 7px", borderRadius:99, background:"#E8EAF6", color:"#1A237E", fontWeight:600 }}>{u.role}</span>
                          </div>
                        ))}
                        <div style={{ marginTop:12, paddingTop:10, borderTop:"1px solid #F0F0F0", display:"flex", gap:8, flexWrap:"wrap" as const }}>
                          <button className="adm-btn" style={{ padding:"6px 12px", background:"#E8EAF6", color:"#1A237E", fontSize:11 }}>📧 Email bienvenue</button>
                          <button className="adm-btn" style={{ padding:"6px 12px", background:"#E8F5E9", color:"#2E7D32", fontSize:11 }}>🎁 Accorder réduction</button>
                          <button className="adm-btn" style={{ padding:"6px 12px", background:"#FFF3E0", color:"#E65100", fontSize:11 }}>↺ Réinitialiser diagnostic</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ══ COMMANDES ══ */}
        {tab === "commandes" && (
          <>
            {/* Filtres */}
            <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" as const, alignItems:"center" }}>
              <input className="inp" value={searchCommande} onChange={e=>setSearchCommande(e.target.value)}
                placeholder="Rechercher..." style={{ maxWidth:280 }}/>
              <select value={filtreStatut} onChange={e=>setFiltreStatut(e.target.value)}
                style={{ padding:"9px 12px", border:"1px solid #E0E0E0", borderRadius:7, fontSize:12, fontFamily:"system-ui", background:"#fff" }}>
                <option value="tous">Tous les statuts</option>
                {STATUTS_ORDRE.map(s => (
                  <option key={s} value={s}>{STATUT_DOC[s]?.label??s}</option>
                ))}
              </select>
              <span style={{ fontSize:12, color:"#9E9E9E" }}>{commandes.length} commande{commandes.length>1?"s":""}</span>
            </div>

            {commandes.length === 0 ? (
              <div style={{ textAlign:"center" as const, padding:"48px 0", color:"#9E9E9E", background:"#fff", borderRadius:12 }}>
                Aucune commande trouvée
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column" as const, gap:8 }}>
                {commandes.map((c:any) => {
                  const st = STATUT_DOC[c.statut] ?? STATUT_DOC["en_attente"];
                  const isOpen = commandeOuverte === c.id;
                  return (
                    <div key={c.id} style={{ background:"#fff", borderRadius:12, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>

                      {/* Ligne principale */}
                      <div onClick={() => setCommandeOuverte(isOpen?null:c.id)}
                        style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 18px", cursor:"pointer" }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:"#1A237E" }}>{c.organisationNom}</div>
                          <div style={{ fontSize:11, color:"#9E9E9E" }}>
                            {TYPE_DOC_LABELS[c.typeDocument]??c.typeDocument} · {c.niveau} · {fmtDate(c.commandeeLe)}
                          </div>
                        </div>
                        <span style={{ fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:99, background:st.bg, color:st.color }}>{st.label}</span>
                        <div style={{ fontSize:13, fontWeight:700, color:"#1A237E", minWidth:110, textAlign:"right" as const }}>{fmt(c.montantFcfa??0)}</div>
                        <span style={{ fontSize:11, color:"#BDBDBD" }}>{isOpen?"▲":"▼"}</span>
                      </div>

                      {/* Détail */}
                      {isOpen && (
                        <div style={{ padding:"0 18px 20px", borderTop:"1px solid #F0F0F0" }}>

                          {/* Changer statut */}
                          <div style={{ marginTop:14, marginBottom:14 }}>
                            <div style={{ fontSize:11, fontWeight:700, color:"#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".07em", marginBottom:8 }}>
                              Changer le statut
                            </div>
                            <div style={{ display:"flex", gap:6, flexWrap:"wrap" as const }}>
                              {STATUTS_ORDRE.map(s => {
                                const sConf = STATUT_DOC[s];
                                const isActif = c.statut === s;
                                return (
                                  <button key={s} className="adm-btn"
                                    onClick={() => !isActif && changerStatutCommande(c.id, s)}
                                    disabled={isActif || savingCommande===c.id}
                                    style={{ padding:"6px 12px", fontSize:11, fontWeight:600,
                                      background: isActif ? sConf.color : sConf.bg,
                                      color: isActif ? "#fff" : sConf.color,
                                      border:`1px solid ${sConf.color}40`,
                                      opacity: isActif ? 1 : 0.85 }}>
                                    {isActif ? "✓ " : ""}{sConf.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>

                            {/* Réduction */}
                            <div>
                              <div style={{ fontSize:11, fontWeight:700, color:"#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".07em", marginBottom:6 }}>
                                Montant / Réduction (FCFA)
                              </div>
                              <input className="inp" type="number"
                                defaultValue={c.montantFcfa}
                                onChange={e => setReductionEdit(p => ({...p, [c.id]:e.target.value}))}
                                placeholder="Montant en FCFA"/>
                              <div style={{ fontSize:10, color:"#9E9E9E", marginTop:3 }}>Montant original : {fmt(c.montantFcfa??0)}</div>
                            </div>

                            {/* Notes internes */}
                            <div>
                              <div style={{ fontSize:11, fontWeight:700, color:"#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".07em", marginBottom:6 }}>
                                Notes internes
                              </div>
                              <textarea
                                defaultValue={c.notesAdmin ?? ""}
                                onChange={e => setNotesEdit(p => ({...p, [c.id]:e.target.value}))}
                                placeholder="Notes visibles uniquement par l'équipe Haki..."
                                rows={3}
                                style={{ width:"100%", padding:"9px 12px", border:"1px solid #E0E0E0", borderRadius:7, fontSize:12, fontFamily:"system-ui", resize:"vertical" as const, boxSizing:"border-box" as const }}/>
                            </div>
                          </div>

                          {/* Actions */}
                          <div style={{ display:"flex", gap:8, marginTop:14, alignItems:"center" }}>
                            <button className="adm-btn"
                              onClick={() => sauvegarderCommande(c.id)}
                              disabled={savingCommande===c.id}
                              style={{ padding:"8px 18px", background:"#1A237E", color:"#fff", fontSize:12 }}>
                              {savingCommande===c.id ? "Sauvegarde..." : "💾 Sauvegarder"}
                            </button>
                            {c.urlDocument && (
                              <a href={c.urlDocument} target="_blank" rel="noreferrer">
                                <button className="adm-btn"
                                  style={{ padding:"8px 14px", background:"#E8F5E9", color:"#2E7D32", fontSize:12 }}>
                                  📥 Télécharger document
                                </button>
                              </a>
                            )}
                            <div style={{ fontSize:11, color:"#9E9E9E", marginLeft:"auto" }}>
                              Commande #{c.id?.slice(0,8)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ══ PRODUCTIONS ══ */}
        {tab === "productions" && (
          <>
            {/* Stats productions */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:20 }}>
              {[
                { label:"Total productions",       val:statsProds.total,     color:"#1A237E", bg:"#E8EAF6" },
                { label:"Rapports PDF",            val:statsProds.rapports,  color:"#00695C", bg:"#E0F2F1" },
                { label:"Documents GIS",           val:statsProds.documents, color:"#4A148C", bg:"#F3E5F5" },
                { label:"Communications digitales",val:statsProds.comms,     color:"#00838F", bg:"#E0F7FA" },
                { label:"Échecs à relancer",       val:statsProds.echecs,    color:"#B71C1C", bg:"#FFEBEE" },
              ].map(k => (
                <div key={k.label} style={{ background:"#fff", borderRadius:10, padding:"14px 16px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", borderLeft:`3px solid ${k.color}` }}>
                  <div style={{ fontSize:22, fontWeight:700, color:k.color, marginBottom:3 }}>{k.val}</div>
                  <div style={{ fontSize:10, color:"#9E9E9E", lineHeight:1.4 }}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Filtres */}
            <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" as const }}>
              {[
                { id:"tous", label:"Toutes" },
                { id:"rapport_pdf", label:"📄 Rapports PDF" },
                { id:"document_gis", label:"📋 Documents GIS" },
                { id:"communication", label:"📣 Communications" },
              ].map(f => (
                <button key={f.id} className="adm-btn"
                  onClick={() => setFiltreTypeProd(f.id)}
                  style={{ padding:"6px 14px", fontSize:11, fontWeight:600,
                    background: filtreTypeProd===f.id ? "#1A237E" : "#fff",
                    color: filtreTypeProd===f.id ? "#fff" : "#424242",
                    boxShadow:"0 1px 3px rgba(0,0,0,0.07)" }}>
                  {f.label}
                </button>
              ))}
            </div>

            {productionsFiltrees.length === 0 ? (
              <div style={{ background:"#fff", borderRadius:12, padding:"48px 0", textAlign:"center" as const, color:"#9E9E9E" }}>
                <div style={{ fontSize:32, marginBottom:10 }}>⚙️</div>
                <div style={{ fontSize:14, marginBottom:6 }}>Aucune production enregistrée</div>
                <div style={{ fontSize:12 }}>Les productions apparaîtront ici au fur et à mesure que les clients utilisent la plateforme</div>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column" as const, gap:8 }}>
                {productionsFiltrees.map((p:any, i:number) => {
                  const typeConf = TYPE_PROD_LABELS[p.type] ?? { label:p.type, emoji:"📦", color:"#424242" };
                  const isEchec = p.statut === "echec";
                  return (
                    <div key={i} style={{ background:"#fff", borderRadius:10, padding:"14px 18px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", display:"flex", alignItems:"center", gap:14, border: isEchec ? "1px solid #FFCDD2" : "1px solid transparent" }}>
                      <div style={{ width:36, height:36, borderRadius:8, background:`${typeConf.color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                        {typeConf.emoji}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:"#1A237E" }}>{p.organisationNom ?? "Organisation inconnue"}</div>
                        <div style={{ fontSize:11, color:"#9E9E9E" }}>
                          {typeConf.label} · {fmtDate(p.creeLe)}
                          {p.typeDocument && ` · ${TYPE_DOC_LABELS[p.typeDocument]??p.typeDocument}`}
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        {isEchec ? (
                          <>
                            <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:99, background:"#FFEBEE", color:"#B71C1C" }}>⚠️ Échec</span>
                            <button className="adm-btn"
                              style={{ padding:"6px 12px", background:"#1A237E", color:"#fff", fontSize:11 }}>
                              ↺ Relancer
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:99, background:"#E8F5E9", color:"#2E7D32" }}>✓ Généré</span>
                        )}
                        {p.type === "document_gis" && (
                          <div style={{ display:"flex", gap:6 }}>
                            <button className="adm-btn"
                              style={{ padding:"6px 12px", background:"#E8EAF6", color:"#1A237E", fontSize:11 }}>
                              ✏️ Modifier
                            </button>
                            <button className="adm-btn"
                              style={{ padding:"6px 12px", background:"#E8F5E9", color:"#2E7D32", fontSize:11 }}>
                              ✅ Valider
                            </button>
                          </div>
                        )}
                        {p.urlDocument && (
                          <a href={p.urlDocument} target="_blank" rel="noreferrer">
                            <button className="adm-btn"
                              style={{ padding:"6px 10px", background:"#F5F5F5", color:"#424242", fontSize:11 }}>
                              📥
                            </button>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {erreur && (
          <div style={{ marginTop:16, padding:"10px 14px", background:"#FFEBEE", borderRadius:8, color:"#B71C1C", fontSize:12 }}>
            ⚠️ {erreur}
          </div>
        )}
      </div>
    </div>
  );
}