"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Tab = "dashboard" | "notifications" | "clients";

const STATUT_DOC: Record<string,{label:string;color:string;bg:string}> = {
  en_attente:       { label:"En attente",       color:"#E65100", bg:"#FFF3E0" },
  proforma_envoyee: { label:"Proforma envoyée", color:"#1565C0", bg:"#E3F2FD" },
  validee:          { label:"Validée",           color:"#2E7D32", bg:"#E8F5E9" },
  en_production:    { label:"En production",     color:"#6A1B9A", bg:"#F3E5F5" },
  livre:            { label:"Livré",             color:"#1A237E", bg:"#E8EAF6" },
  annule:           { label:"Annulée",           color:"#B71C1C", bg:"#FFEBEE" },
};

function fmt(n:number){ return n.toLocaleString("fr-FR")+" FCFA"; }
function fmtDate(d:string){ return new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}); }

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [searchClient, setSearchClient] = useState("");
  const [clientOuvert, setClientOuvert] = useState<string|null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem("haki_admin_auth");
    if (!auth) { router.push("/admin/login"); return; }
    chargerDonnees();
  }, []);

  async function chargerDonnees() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard", {
        headers:{ "x-admin-auth": sessionStorage.getItem("haki_admin_auth_pwd") ?? "" }
      });
      if (res.status === 401) { router.push("/admin/login"); return; }
      const d = await res.json();
      setData(d);
    } catch {
      setErreur("Erreur chargement données.");
    }
    setLoading(false);
  }

  function deconnexion() {
    sessionStorage.removeItem("haki_admin_auth");
    sessionStorage.removeItem("haki_admin_auth_pwd");
    router.push("/admin/login");
  }

  const css = `
    * { box-sizing: border-box; }
    .adm-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap:12px; }
    .adm-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap:12px; }
    .adm-btn { border:none; border-radius:7px; font-family:system-ui; cursor:pointer; font-weight:500; transition:opacity .15s; }
    .adm-btn:hover { opacity:.88; }
    @media(max-width:900px){
      .adm-grid-4 { grid-template-columns:1fr 1fr; }
      .adm-grid-3 { grid-template-columns:1fr; }
    }
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
  const commandes = data?.commandes ?? [];
  const commandesEnAttente = commandes.filter((c:any) => c.statut==="en_attente");

  return (
    <div style={{ fontFamily:"system-ui,-apple-system,sans-serif", background:"#F0F2F5", minHeight:"100vh" }}>
      <style>{css}</style>

      {/* ── HEADER ADMIN ── */}
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
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button className="adm-btn" onClick={() => router.push("/dashboard")}
            style={{ padding:"5px 12px", background:"#1A1A3E", color:"#9FA8DA", fontSize:11 }}>
            ← Plateforme
          </button>
          <button className="adm-btn" onClick={() => chargerDonnees()}
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

        {/* ── Onglets ── */}
        <div style={{ display:"flex", gap:6, marginBottom:24 }}>
          {([
            { id:"dashboard",     label:"📊 Tableau de bord",  badge:null },
            { id:"notifications", label:"🔔 Notifications",    badge:commandesEnAttente.length||null },
            { id:"clients",       label:"🏢 Clients",          badge:stats.totalOrgs||null },
          ] as any[]).map(t => (
            <button key={t.id} className="adm-btn"
              onClick={() => setTab(t.id)}
              style={{ padding:"8px 18px", fontSize:13, fontWeight:600,
                background: tab===t.id ? "#1A237E" : "#fff",
                color: tab===t.id ? "#fff" : "#424242",
                boxShadow: tab===t.id ? "none" : "0 1px 3px rgba(0,0,0,0.07)",
                position:"relative" as const }}>
              {t.label}
              {t.badge > 0 && (
                <span style={{ fontSize:9, background:"#B91C1C", color:"#fff", padding:"1px 5px", borderRadius:99, marginLeft:5, fontWeight:700 }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══ TAB : DASHBOARD ══ */}
        {tab === "dashboard" && (
          <>
            {/* KPIs */}
            <div className="adm-grid-4" style={{ marginBottom:20 }}>
              {[
                { label:"Organisations actives",    value:stats.totalOrgs??0,              icon:"🏢", color:"#1A237E", bg:"#E8EAF6" },
                { label:"Diagnostics complétés",    value:stats.sessionsAvecScore??0,       icon:"📋", color:"#00695C", bg:"#E0F2F1" },
                { label:"Score MMI-CI moyen",       value:`${stats.scoresMoyen??0}/100`,    icon:"⭐", color:"#E65100", bg:"#FFF3E0" },
                { label:"Commandes en attente",     value:stats.commandesEnAttente??0,      icon:"🔔", color:"#B71C1C", bg:"#FFEBEE" },
              ].map(k => (
                <div key={k.label} style={{ background:"#fff", borderRadius:12, padding:"18px 20px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", borderLeft:`3px solid ${k.color}` }}>
                  <div style={{ fontSize:20, marginBottom:8 }}>{k.icon}</div>
                  <div style={{ fontSize:26, fontWeight:700, color:k.color, marginBottom:4 }}>{k.value}</div>
                  <div style={{ fontSize:11, color:"#9E9E9E", fontWeight:500 }}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Revenu estimé */}
            <div style={{ background:"linear-gradient(135deg, #1A237E 0%, #283593 100%)", borderRadius:12, padding:"20px 24px", marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:"#9FA8DA", letterSpacing:".1em", textTransform:"uppercase" as const, marginBottom:6 }}>
                  Revenus estimés (commandes documents)
                </div>
                <div style={{ fontSize:32, fontWeight:700, color:"#FFC107" }}>
                  {fmt(stats.revenuEstime??0)}
                </div>
              </div>
              <div style={{ fontSize:48 }}>💰</div>
            </div>

            {/* Dernières commandes */}
            <div style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#1A237E", marginBottom:16 }}>
                Dernières commandes documents
              </div>
              {commandes.length === 0 ? (
                <div style={{ fontSize:13, color:"#9E9E9E", textAlign:"center" as const, padding:"24px 0" }}>
                  Aucune commande pour le moment
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column" as const, gap:8 }}>
                  {commandes.slice(0,8).map((c:any) => {
                    const st = STATUT_DOC[c.statut] ?? STATUT_DOC["en_attente"];
                    return (
                      <div key={c.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"#F8F9FA", borderRadius:8 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, fontWeight:600, color:"#212121" }}>{c.organisationNom}</div>
                          <div style={{ fontSize:11, color:"#9E9E9E" }}>{c.typeDocument} · {c.niveau} · {fmtDate(c.commandeeLe)}</div>
                        </div>
                        <span style={{ fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:99, background:st.bg, color:st.color }}>
                          {st.label}
                        </span>
                        <div style={{ fontSize:12, fontWeight:600, color:"#1A237E", minWidth:90, textAlign:"right" as const }}>
                          {fmt(c.montantFcfa??0)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ══ TAB : NOTIFICATIONS ══ */}
        {tab === "notifications" && (
          <div style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#1A237E", marginBottom:16 }}>
              Commandes en attente de traitement
            </div>
            {commandesEnAttente.length === 0 ? (
              <div style={{ textAlign:"center" as const, padding:"48px 0", color:"#9E9E9E" }}>
                <div style={{ fontSize:32, marginBottom:12 }}>✅</div>
                <div style={{ fontSize:14 }}>Aucune commande en attente</div>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column" as const, gap:10 }}>
                {commandesEnAttente.map((c:any) => (
                  <div key={c.id} style={{ padding:"16px 18px", background:"#FFF3E0", borderRadius:10, border:"1px solid #FFCC80", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap" as const, gap:12 }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:"#E65100", marginBottom:3 }}>
                        🔔 Nouvelle commande — {c.organisationNom}
                      </div>
                      <div style={{ fontSize:12, color:"#757575" }}>
                        {c.typeDocument} · Niveau {c.niveau} · {fmtDate(c.commandeeLe)}
                      </div>
                      <div style={{ fontSize:13, fontWeight:700, color:"#1A237E", marginTop:4 }}>
                        {fmt(c.montantFcfa??0)}
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button className="adm-btn"
                        style={{ padding:"8px 16px", background:"#1A237E", color:"#fff", fontSize:12 }}>
                        Envoyer proforma
                      </button>
                      <button className="adm-btn"
                        style={{ padding:"8px 16px", background:"#F5F5F5", color:"#424242", fontSize:12 }}>
                        Annuler
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ TAB : CLIENTS ══ */}
        {tab === "clients" && (
          <>
            {/* Recherche */}
            <div style={{ marginBottom:14 }}>
              <input
                value={searchClient}
                onChange={e => setSearchClient(e.target.value)}
                placeholder="Rechercher une organisation..."
                style={{ width:"100%", maxWidth:400, padding:"10px 14px", border:"1px solid #E0E0E0", borderRadius:8, fontSize:13, fontFamily:"system-ui", background:"#fff" }}
              />
            </div>

            <div style={{ display:"flex", flexDirection:"column" as const, gap:8 }}>
              {clients.length === 0 ? (
                <div style={{ textAlign:"center" as const, padding:"48px 0", color:"#9E9E9E", background:"#fff", borderRadius:12 }}>
                  <div style={{ fontSize:13 }}>Aucun client trouvé</div>
                </div>
              ) : clients.map((org:any) => {
                const diag = org.dernierDiagnostic;
                const score = (diag?.scoreMmiCi as any)?.scoreGlobal;
                const isOpen = clientOuvert === org.id;
                return (
                  <div key={org.id} style={{ background:"#fff", borderRadius:12, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
                    <div
                      onClick={() => setClientOuvert(isOpen ? null : org.id)}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 18px", cursor:"pointer" }}>
                      <div style={{ width:36, height:36, borderRadius:8, background:"#E8EAF6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                        🏢
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:"#1A237E" }}>{org.nom}</div>
                        <div style={{ fontSize:11, color:"#9E9E9E", marginTop:1 }}>
                          {org.secteur ?? "Secteur non renseigné"} · {org.ville ?? "CI"} · {org.utilisateurs?.length ?? 0} utilisateur{org.utilisateurs?.length > 1 ? "s" : ""}
                        </div>
                      </div>
                      {score !== undefined ? (
                        <div style={{ textAlign:"center" as const, flexShrink:0 }}>
                          <div style={{ fontSize:20, fontWeight:700, color:"#1A237E" }}>{score}</div>
                          <div style={{ fontSize:9, color:"#9E9E9E" }}>MMI-CI</div>
                        </div>
                      ) : (
                        <span style={{ fontSize:10, color:"#9E9E9E", padding:"3px 8px", background:"#F5F5F5", borderRadius:99 }}>Pas de diagnostic</span>
                      )}
                      <span style={{ fontSize:11, color:"#BDBDBD" }}>{isOpen ? "▲" : "▼"}</span>
                    </div>

                    {isOpen && (
                      <div style={{ padding:"0 18px 18px", borderTop:"1px solid #F0F0F0" }}>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginTop:14 }}>
                          <div style={{ padding:"12px 14px", background:"#F8F9FA", borderRadius:8 }}>
                            <div style={{ fontSize:10, fontWeight:700, color:"#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".07em", marginBottom:4 }}>Inscription</div>
                            <div style={{ fontSize:12, color:"#424242" }}>{fmtDate(org.creeLe)}</div>
                          </div>
                          <div style={{ padding:"12px 14px", background:"#F8F9FA", borderRadius:8 }}>
                            <div style={{ fontSize:10, fontWeight:700, color:"#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".07em", marginBottom:4 }}>Taille</div>
                            <div style={{ fontSize:12, color:"#424242" }}>{org.taille ?? "—"}</div>
                          </div>
                          <div style={{ padding:"12px 14px", background:"#F8F9FA", borderRadius:8 }}>
                            <div style={{ fontSize:10, fontWeight:700, color:"#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".07em", marginBottom:4 }}>Dernier diagnostic</div>
                            <div style={{ fontSize:12, color:"#424242" }}>{diag ? fmtDate(diag.creeLe) : "Aucun"}</div>
                          </div>
                        </div>

                        {/* Utilisateurs */}
                        <div style={{ marginTop:12 }}>
                          <div style={{ fontSize:11, fontWeight:700, color:"#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".07em", marginBottom:8 }}>Utilisateurs</div>
                          <div style={{ display:"flex", flexDirection:"column" as const, gap:5 }}>
                            {org.utilisateurs?.map((u:any) => (
                              <div key={u.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", background:"#F0F2F5", borderRadius:6 }}>
                                <div style={{ width:6, height:6, borderRadius:"50%", background:"#1A237E", flexShrink:0 }}/>
                                <span style={{ fontSize:12, color:"#424242", flex:1 }}>{u.email}</span>
                                <span style={{ fontSize:10, padding:"2px 7px", borderRadius:99, background:"#E8EAF6", color:"#1A237E", fontWeight:600 }}>{u.role}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions manuelles */}
                        <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid #F0F0F0" }}>
                          <div style={{ fontSize:11, fontWeight:700, color:"#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".07em", marginBottom:8 }}>Actions manuelles</div>
                          <div style={{ display:"flex", gap:8, flexWrap:"wrap" as const }}>
                            <button className="adm-btn"
                              style={{ padding:"7px 14px", background:"#E8EAF6", color:"#1A237E", fontSize:11, fontWeight:600 }}>
                              📧 Envoyer email de bienvenue
                            </button>
                            <button className="adm-btn"
                              style={{ padding:"7px 14px", background:"#E8F5E9", color:"#2E7D32", fontSize:11, fontWeight:600 }}>
                              🎁 Accorder une réduction
                            </button>
                            <button className="adm-btn"
                              style={{ padding:"7px 14px", background:"#FFF3E0", color:"#E65100", fontSize:11, fontWeight:600 }}>
                              ↺ Réinitialiser le diagnostic
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
