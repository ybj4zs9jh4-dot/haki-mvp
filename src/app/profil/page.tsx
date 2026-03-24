"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SECTEURS = [
  "Banque & Finance","Assurance","Télécommunications","Industrie & Manufacturing",
  "Agroalimentaire","Hôtellerie & Restauration","Santé & Cliniques","Commerce & Distribution",
  "BTP & Immobilier","Transport & Logistique","Énergie & Mines","ONG & Associations",
  "Secteur public & Parapublic","Conseil & Services","Autre",
];
const TAILLES = [
  { id:"pme",   label:"PME — moins de 50 employés" },
  { id:"eti",   label:"ETI — 50 à 250 employés" },
  { id:"ge",    label:"Grande entreprise — 250 à 999 employés" },
  { id:"multi", label:"Multinationale — 1000+ employés" },
  { id:"ong",   label:"ONG / Association / Bailleur" },
];
const ROLES = [
  { id:"drh",   label:"DRH — Directeur des Ressources Humaines" },
  { id:"dg",    label:"DG — Directeur Général" },
  { id:"rse",   label:"Responsable RSE / GIS" },
  { id:"autre", label:"Autre" },
];
const NIVEAUX_SCORE: Record<number,{label:string;color:string;bg:string}> = {
  1:{label:"Non-conforme",    color:"#B71C1C", bg:"#FFEBEE"},
  2:{label:"Conforme",        color:"#E65100", bg:"#FFF3E0"},
  3:{label:"Consciente",      color:"#F57F17", bg:"#FFFDE7"},
  4:{label:"Engagée",         color:"#00695C", bg:"#E0F2F1"},
  5:{label:"Transformatrice", color:"#1A237E", bg:"#E8EAF6"},
};

function fmtDate(d:string){ return d ? new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}) : "—"; }

type Tab = "organisation" | "compte" | "securite" | "historique" | "services";

export default function ProfilPage() {
  const { data:session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("organisation");
  const [profil, setProfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [succesMsg, setSuccesMsg] = useState("");
  const [erreurMsg, setErreurMsg] = useState("");

  // Formulaires
  const [orgForm, setOrgForm] = useState({ nom:"", secteur:"", taille:"", ville:"" });
  const [userForm, setUserForm] = useState({ prenom:"", nom:"", role:"" });
  const [emailForm, setEmailForm] = useState({ email:"" });
  const [pwdForm, setPwdForm] = useState({ ancienPassword:"", nouveauPassword:"", confirmer:"" });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    chargerProfil();
  }, [status]);

  async function chargerProfil() {
    setLoading(true);
    try {
      const res = await fetch("/api/profil");
      const d = await res.json();
      setProfil(d);
      setOrgForm({
        nom: d.organisation?.nom ?? "",
        secteur: d.organisation?.secteur ?? "",
        taille: d.organisation?.taille ?? "",
        ville: d.organisation?.ville ?? "",
      });
      setUserForm({
        prenom: d.user?.prenom ?? "",
        nom: d.user?.nom ?? "",
        role: d.user?.role ?? "drh",
      });
      setEmailForm({ email: d.user?.email ?? "" });
    } catch { setErreurMsg("Erreur chargement profil."); }
    setLoading(false);
  }

  async function sauvegarder(type: string, data: any) {
    setSaving(true); setSuccesMsg(""); setErreurMsg("");
    try {
      const res = await fetch("/api/profil", {
        method:"PATCH",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ type, ...data }),
      });
      const d = await res.json();
      if (!res.ok) { setErreurMsg(d.error ?? "Erreur."); }
      else {
        setSuccesMsg("Modifications sauvegardées ✓");
        await chargerProfil();
        if (type === "password") setPwdForm({ ancienPassword:"", nouveauPassword:"", confirmer:"" });
      }
    } catch { setErreurMsg("Erreur réseau."); }
    setSaving(false);
    setTimeout(() => { setSuccesMsg(""); setErreurMsg(""); }, 3000);
  }

  if (status === "loading" || loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#F0F2F5" }}>
      <div style={{ color:"#1A237E", fontSize:15, fontFamily:"system-ui" }}>Chargement...</div>
    </div>
  );

  const org = profil?.organisation;
  const user = profil?.user;
  const sessions = org?.sessions ?? [];
  const derniereSession = sessions[0];
  const scoreGlobal = (derniereSession?.scoreMmiCi as any)?.scoreGlobal;
  const niveauMmi = (derniereSession?.scoreMmiCi as any)?.niveauMmi;
  const niveauConf = niveauMmi ? NIVEAUX_SCORE[niveauMmi] : null;

  const SERVICES_ACTIFS = [
    { emoji:"📋", label:"Diagnostic GIS", statut:"Actif", color:"#1A237E" },
    { emoji:"📊", label:"Baromètre Collaborateurs", statut:"Actif", color:"#00695C" },
    { emoji:"🧭", label:"Auto-diagnostic Managers", statut:"Actif", color:"#2E7D32" },
    { emoji:"📈", label:"Benchmarks sectoriels", statut:"Actif", color:"#E65100" },
    { emoji:"📅", label:"Calendrier GIS", statut:"Actif", color:"#4A148C" },
    { emoji:"📄", label:"Production Documentaire", statut:"Sur commande", color:"#1A237E" },
    { emoji:"🎓", label:"Formation Managers", statut:"Sur commande", color:"#F57F17" },
    { emoji:"📣", label:"Communication Digitale", statut:"Sur commande", color:"#00838F" },
  ];

  const css = `
    * { box-sizing: border-box; }
    .hb { border:none; border-radius:8px; font-family:system-ui; cursor:pointer; font-weight:500; transition:opacity .15s; }
    .hb:hover { opacity:.88; }
    .hb:disabled { opacity:.5; cursor:default; }
    .inp { width:100%; padding:10px 13px; border:1.5px solid #E0E0E0; border-radius:8px; font-size:13px; font-family:system-ui; outline:none; transition:border-color .15s; }
    .inp:focus { border-color:#1A237E; }
  `;

  return (
    <div style={{ fontFamily:"system-ui,-apple-system,sans-serif", background:"#F0F2F5", minHeight:"100vh" }}>
      <style>{css}</style>

      {/* HEADER */}
      <div style={{ background:"#1A237E", padding:"0 28px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:20, fontWeight:700, color:"#FFC107", letterSpacing:3 }}>HAKI</span>
          <div style={{ width:1, height:18, background:"#3949AB" }}/>
          <span style={{ fontSize:12, color:"#9FA8DA" }}>Mon Profil</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button className="hb" onClick={() => router.push("/dashboard")}
            style={{ background:"#283593", color:"#90CAF9", padding:"6px 14px", fontSize:11 }}>
            ← Tableau de bord
          </button>
          <button className="hb" onClick={() => signOut({ callbackUrl:"/connexion" })}
            style={{ background:"transparent", color:"#9FA8DA", border:"1px solid #3949AB", padding:"5px 12px", fontSize:11 }}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"28px 20px" }}>

        {/* CARTE PROFIL RÉSUMÉ */}
        <div style={{ background:"linear-gradient(135deg,#1A237E 0%,#283593 100%)", borderRadius:14, padding:"24px 28px", marginBottom:20, display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" as const }}>
          <div style={{ width:60, height:60, borderRadius:"50%", background:"rgba(255,193,7,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>
            🏢
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18, fontWeight:700, color:"#fff", marginBottom:3 }}>{org?.nom ?? "—"}</div>
            <div style={{ fontSize:12, color:"#C5CAE9" }}>
              {org?.secteur ?? "—"} · {org?.ville ?? "—"} · {user?.prenom} {user?.nom}
            </div>
            <div style={{ fontSize:11, color:"#9FA8DA", marginTop:3 }}>
              {user?.email} · {ROLES.find(r=>r.id===user?.role)?.label ?? user?.role}
            </div>
          </div>
          {scoreGlobal !== undefined && niveauConf && (
            <div style={{ textAlign:"center" as const, background:"rgba(255,255,255,0.08)", borderRadius:10, padding:"12px 20px", flexShrink:0 }}>
              <div style={{ fontSize:32, fontWeight:700, color:"#FFC107" }}>{scoreGlobal}</div>
              <div style={{ fontSize:10, color:"#9FA8DA", marginTop:2 }}>Score GIS /100</div>
              <div style={{ fontSize:10, fontWeight:600, color:niveauConf.color, marginTop:4, padding:"2px 8px", background:niveauConf.bg, borderRadius:99 }}>
                {niveauConf.label}
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        {succesMsg && (
          <div style={{ padding:"10px 14px", background:"#E8F5E9", border:"1px solid #A5D6A7", borderRadius:8, color:"#2E7D32", fontSize:13, marginBottom:14, fontWeight:500 }}>
            ✓ {succesMsg}
          </div>
        )}
        {erreurMsg && (
          <div style={{ padding:"10px 14px", background:"#FFEBEE", border:"1px solid #FFCDD2", borderRadius:8, color:"#B71C1C", fontSize:13, marginBottom:14 }}>
            ⚠️ {erreurMsg}
          </div>
        )}

        {/* ONGLETS */}
        <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" as const }}>
          {([
            { id:"organisation", label:"🏢 Organisation" },
            { id:"compte",       label:"👤 Compte" },
            { id:"securite",     label:"🔒 Sécurité" },
            { id:"historique",   label:"📋 Historique" },
            { id:"services",     label:"💡 Services" },
          ] as {id:Tab;label:string}[]).map(t => (
            <button key={t.id} className="hb"
              onClick={() => setTab(t.id)}
              style={{ padding:"8px 16px", fontSize:12, fontWeight:600,
                background: tab===t.id ? "#1A237E" : "#fff",
                color: tab===t.id ? "#fff" : "#424242",
                boxShadow: tab===t.id ? "none" : "0 1px 3px rgba(0,0,0,0.07)" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ ORGANISATION ══ */}
        {tab === "organisation" && (
          <div style={{ background:"#fff", borderRadius:12, padding:28, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#1A237E", marginBottom:20 }}>Informations de l'organisation</div>
            <div style={{ display:"flex", flexDirection:"column" as const, gap:16 }}>
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".08em", marginBottom:6 }}>Nom de l'organisation</label>
                <input className="inp" value={orgForm.nom} onChange={e=>setOrgForm(p=>({...p,nom:e.target.value}))} placeholder="Nom de votre organisation"/>
              </div>
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".08em", marginBottom:6 }}>Secteur d'activité</label>
                <select value={orgForm.secteur} onChange={e=>setOrgForm(p=>({...p,secteur:e.target.value}))}
                  style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #E0E0E0", borderRadius:8, fontSize:13, fontFamily:"system-ui", background:"#fff" }}>
                  <option value="">Sélectionner...</option>
                  {SECTEURS.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".08em", marginBottom:8 }}>Taille</label>
                <div style={{ display:"flex", flexDirection:"column" as const, gap:6 }}>
                  {TAILLES.map(t=>(
                    <button key={t.id} className="hb"
                      onClick={()=>setOrgForm(p=>({...p,taille:t.id}))}
                      style={{ padding:"9px 14px", textAlign:"left" as const, fontSize:12,
                        background:orgForm.taille===t.id?"#E8EAF6":"#F5F5F5",
                        border:`1.5px solid ${orgForm.taille===t.id?"#1A237E":"transparent"}`,
                        color:orgForm.taille===t.id?"#1A237E":"#424242",
                        fontWeight:orgForm.taille===t.id?600:400 }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".08em", marginBottom:6 }}>Ville</label>
                <input className="inp" value={orgForm.ville} onChange={e=>setOrgForm(p=>({...p,ville:e.target.value}))} placeholder="Ville"/>
              </div>
              <button className="hb" onClick={()=>sauvegarder("organisation",orgForm)} disabled={saving}
                style={{ padding:"12px 24px", background:saving?"#9FA8DA":"#1A237E", color:"#fff", fontSize:13, alignSelf:"flex-start" as const }}>
                {saving?"Sauvegarde...":"💾 Sauvegarder les modifications"}
              </button>
            </div>
          </div>
        )}

        {/* ══ COMPTE ══ */}
        {tab === "compte" && (
          <div style={{ background:"#fff", borderRadius:12, padding:28, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#1A237E", marginBottom:20 }}>Informations personnelles</div>
            <div style={{ display:"flex", flexDirection:"column" as const, gap:16 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".08em", marginBottom:6 }}>Prénom</label>
                  <input className="inp" value={userForm.prenom} onChange={e=>setUserForm(p=>({...p,prenom:e.target.value}))} placeholder="Prénom"/>
                </div>
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".08em", marginBottom:6 }}>Nom</label>
                  <input className="inp" value={userForm.nom} onChange={e=>setUserForm(p=>({...p,nom:e.target.value}))} placeholder="Nom"/>
                </div>
              </div>
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".08em", marginBottom:8 }}>Rôle</label>
                <div style={{ display:"flex", flexDirection:"column" as const, gap:6 }}>
                  {ROLES.map(r=>(
                    <button key={r.id} className="hb"
                      onClick={()=>setUserForm(p=>({...p,role:r.id}))}
                      style={{ padding:"9px 14px", textAlign:"left" as const, fontSize:12,
                        background:userForm.role===r.id?"#E8EAF6":"#F5F5F5",
                        border:`1.5px solid ${userForm.role===r.id?"#1A237E":"transparent"}`,
                        color:userForm.role===r.id?"#1A237E":"#424242",
                        fontWeight:userForm.role===r.id?600:400 }}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <button className="hb" onClick={()=>sauvegarder("utilisateur",userForm)} disabled={saving}
                style={{ padding:"12px 24px", background:saving?"#9FA8DA":"#1A237E", color:"#fff", fontSize:13, alignSelf:"flex-start" as const }}>
                {saving?"Sauvegarde...":"💾 Sauvegarder"}
              </button>

              {/* Changer email */}
              <div style={{ marginTop:8, paddingTop:20, borderTop:"1px solid #F0F0F0" }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#1A237E", marginBottom:14 }}>Changer d'email</div>
                <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
                  <div style={{ flex:1 }}>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".08em", marginBottom:6 }}>Nouvel email</label>
                    <input className="inp" type="email" value={emailForm.email} onChange={e=>setEmailForm({email:e.target.value})} placeholder="nouveau@email.com"/>
                  </div>
                  <button className="hb" onClick={()=>sauvegarder("email",emailForm)} disabled={saving}
                    style={{ padding:"10px 18px", background:"#E65100", color:"#fff", fontSize:12, flexShrink:0 }}>
                    Changer
                  </button>
                </div>
                <div style={{ fontSize:11, color:"#9E9E9E", marginTop:5 }}>
                  ⚠️ Vous devrez vous reconnecter après ce changement.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ SÉCURITÉ ══ */}
        {tab === "securite" && (
          <div style={{ background:"#fff", borderRadius:12, padding:28, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#1A237E", marginBottom:20 }}>Changer le mot de passe</div>
            <div style={{ display:"flex", flexDirection:"column" as const, gap:16, maxWidth:480 }}>
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".08em", marginBottom:6 }}>Mot de passe actuel</label>
                <input className="inp" type="password" value={pwdForm.ancienPassword} onChange={e=>setPwdForm(p=>({...p,ancienPassword:e.target.value}))} placeholder="••••••••"/>
              </div>
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".08em", marginBottom:6 }}>Nouveau mot de passe</label>
                <input className="inp" type="password" value={pwdForm.nouveauPassword} onChange={e=>setPwdForm(p=>({...p,nouveauPassword:e.target.value}))} placeholder="Minimum 8 caractères"/>
              </div>
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".08em", marginBottom:6 }}>Confirmer le nouveau mot de passe</label>
                <input className="inp" type="password" value={pwdForm.confirmer} onChange={e=>setPwdForm(p=>({...p,confirmer:e.target.value}))} placeholder="Répétez le nouveau mot de passe"/>
              </div>
              {pwdForm.nouveauPassword && pwdForm.confirmer && pwdForm.nouveauPassword !== pwdForm.confirmer && (
                <div style={{ fontSize:12, color:"#B71C1C" }}>⚠️ Les mots de passe ne correspondent pas.</div>
              )}
              <button className="hb"
                onClick={() => {
                  if (pwdForm.nouveauPassword !== pwdForm.confirmer) { setErreurMsg("Les mots de passe ne correspondent pas."); return; }
                  if (pwdForm.nouveauPassword.length < 8) { setErreurMsg("Minimum 8 caractères."); return; }
                  sauvegarder("password", { ancienPassword:pwdForm.ancienPassword, nouveauPassword:pwdForm.nouveauPassword });
                }}
                disabled={saving}
                style={{ padding:"12px 24px", background:saving?"#9FA8DA":"#1A237E", color:"#fff", fontSize:13, alignSelf:"flex-start" as const }}>
                {saving?"Mise à jour...":"🔒 Mettre à jour le mot de passe"}
              </button>
            </div>
          </div>
        )}

        {/* ══ HISTORIQUE ══ */}
        {tab === "historique" && (
          <div style={{ background:"#fff", borderRadius:12, padding:28, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#1A237E", marginBottom:20 }}>
              Historique des diagnostics
              <span style={{ fontSize:11, fontWeight:400, color:"#9E9E9E", marginLeft:8 }}>{sessions.length} diagnostic{sessions.length>1?"s":""}</span>
            </div>
            {sessions.length === 0 ? (
              <div style={{ textAlign:"center" as const, padding:"48px 0", color:"#9E9E9E" }}>
                <div style={{ fontSize:32, marginBottom:10 }}>📋</div>
                <div style={{ fontSize:14 }}>Aucun diagnostic effectué</div>
                <button className="hb" onClick={() => router.push("/dashboard")}
                  style={{ marginTop:16, padding:"10px 20px", background:"#1A237E", color:"#fff", fontSize:13 }}>
                  Lancer mon premier diagnostic →
                </button>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column" as const, gap:8 }}>
                {sessions.map((s:any, i:number) => {
                  const sg = (s.scoreMmiCi as any)?.scoreGlobal;
                  const nm = (s.scoreMmiCi as any)?.niveauMmi;
                  const nc = nm ? NIVEAUX_SCORE[nm] : null;
                  return (
                    <div key={s.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background: i===0?"#F8F9FA":"#fff", borderRadius:10, border:`1px solid ${i===0?"#E8EAF6":"#F0F0F0"}` }}>
                      <div style={{ width:36, height:36, borderRadius:8, background:"#E8EAF6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                        {i===0?"🏆":"📋"}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:"#1A237E" }}>
                          Diagnostic {i===0?"(actuel)":""} · {fmtDate(s.creeLe)}
                        </div>
                        <div style={{ fontSize:11, color:"#9E9E9E", marginTop:1 }}>
                          Statut : {s.statut ?? "en cours"}
                        </div>
                      </div>
                      {sg !== undefined ? (
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ textAlign:"center" as const }}>
                            <div style={{ fontSize:22, fontWeight:700, color:"#1A237E" }}>{sg}</div>
                            <div style={{ fontSize:9, color:"#9E9E9E" }}>Score</div>
                          </div>
                          {nc && (
                            <span style={{ fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:99, background:nc.bg, color:nc.color }}>
                              {nc.label}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize:10, color:"#9E9E9E", padding:"3px 8px", background:"#F5F5F5", borderRadius:99 }}>Score en attente</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ SERVICES ══ */}
        {tab === "services" && (
          <div style={{ background:"#fff", borderRadius:12, padding:28, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#1A237E", marginBottom:6 }}>Services actifs & disponibles</div>
            <div style={{ fontSize:12, color:"#9E9E9E", marginBottom:20 }}>Votre abonnement Haki donne accès à tous les services inclus. Les services complémentaires sont disponibles sur commande.</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {SERVICES_ACTIFS.map((s,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:"#F8F9FA", borderRadius:10, border:`1px solid ${s.color}15` }}>
                  <span style={{ fontSize:20 }}>{s.emoji}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"#1A237E" }}>{s.label}</div>
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99,
                    background: s.statut==="Actif" ? "#E8F5E9" : "#FFF3E0",
                    color: s.statut==="Actif" ? "#2E7D32" : "#E65100" }}>
                    {s.statut}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ marginTop:20, paddingTop:16, borderTop:"1px solid #F0F0F0", display:"flex", gap:10 }}>
              <button className="hb" onClick={() => router.push("/services")}
                style={{ padding:"10px 20px", background:"#1A237E", color:"#fff", fontSize:12 }}>
                Voir tous les services →
              </button>
              <button className="hb" onClick={() => router.push("/documents")}
                style={{ padding:"10px 20px", background:"#E8EAF6", color:"#1A237E", fontSize:12 }}>
                Commander un document
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
