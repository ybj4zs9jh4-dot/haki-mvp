"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SECTEURS = [
  "Banque & Finance","Assurance","Télécommunications","Industrie & Manufacturing",
  "Agroalimentaire","Hôtellerie & Restauration","Santé & Cliniques","Commerce & Distribution",
  "BTP & Immobilier","Transport & Logistique","Énergie & Mines","ONG & Associations",
  "Secteur public & Parapublic","Conseil & Services","Autre",
];

const TAILLES = [
  { id:"pme",    label:"PME — moins de 50 employés" },
  { id:"eti",    label:"ETI — 50 à 250 employés" },
  { id:"ge",     label:"Grande entreprise — 250 à 999 employés" },
  { id:"multi",  label:"Multinationale — 1000+ employés" },
  { id:"ong",    label:"ONG / Association / Bailleur" },
];

const SEGMENTS = [
  { id:"s1", label:"S1 — Grande Entreprise / Multinationale", color:"#1A237E", bg:"#E8EAF6" },
  { id:"s2", label:"S2 — PME formelle CI",                    color:"#00695C", bg:"#E0F2F1" },
  { id:"s3", label:"S3 — ONG / Bailleur",                     color:"#BF360C", bg:"#FBE9E7" },
];

export default function InscriptionPage() {
  const router = useRouter();
  const [etape, setEtape] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  const [form, setForm] = useState({
    // Étape 1 — Organisation
    orgNom: "", secteur: "", taille: "", ville: "Abidjan",
    // Étape 2 — Compte
    prenom: "", nom: "", role: "drh", email: "", password: "", passwordConfirm: "",
    // Étape 3 — Segment
    segment: "s2",
  });

  function set(k: string, v: string) {
    setForm(p => ({ ...p, [k]: v }));
    setErreur("");
  }

  function validerEtape1() {
    if (!form.orgNom.trim()) { setErreur("Le nom de l'organisation est requis."); return false; }
    if (!form.secteur) { setErreur("Sélectionnez votre secteur d'activité."); return false; }
    if (!form.taille) { setErreur("Sélectionnez la taille de votre organisation."); return false; }
    return true;
  }

  function validerEtape2() {
    if (!form.prenom.trim() || !form.nom.trim()) { setErreur("Prénom et nom requis."); return false; }
    if (!form.email.includes("@")) { setErreur("Email invalide."); return false; }
    if (form.password.length < 8) { setErreur("Mot de passe minimum 8 caractères."); return false; }
    if (form.password !== form.passwordConfirm) { setErreur("Les mots de passe ne correspondent pas."); return false; }
    return true;
  }

  async function soumettre() {
    setLoading(true); setErreur("");
    try {
      const res = await fetch("/api/organisations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.orgNom,
          secteur: form.secteur,
          taille: form.taille,
          ville: form.ville,
          email: form.email,
          password: form.password,
          prenom: form.prenom,
          nom_utilisateur: form.nom,
          role: form.role,
          segment: form.segment,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErreur(data.error ?? "Erreur lors de l'inscription."); setLoading(false); return; }
      router.push("/connexion?inscrit=1");
    } catch {
      setErreur("Erreur réseau. Réessaie.");
    }
    setLoading(false);
  }

  const css = `
    * { box-sizing: border-box; }
    .inp { width: 100%; padding: 11px 14px; border: 1px solid #E0E0E0; border-radius: 8px; fontSize: 14px; font-family: system-ui; outline: none; transition: border-color .15s; }
    .inp:focus { border-color: #1A237E; }
    .hb { border: none; border-radius: 8px; font-family: system-ui; cursor: pointer; font-weight: 600; transition: opacity .15s; }
    .hb:hover { opacity: .88; }
    .hb:disabled { opacity: .5; cursor: default; }
    .seg-btn { border-radius: 10px; cursor: pointer; transition: all .15s; font-family: system-ui; }
    .seg-btn:hover { transform: translateY(-1px); }
  `;

  return (
    <div style={{ fontFamily:"system-ui,-apple-system,sans-serif", background:"linear-gradient(135deg, #0D0D2B 0%, #1A237E 100%)", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
      <style>{css}</style>

      <div style={{ width:"100%", maxWidth:520 }}>

        {/* Logo */}
        <div style={{ textAlign:"center" as const, marginBottom:32 }}>
          <div style={{ fontSize:28, fontWeight:700, color:"#FFC107", letterSpacing:5, marginBottom:4, cursor:"pointer" }} onClick={() => router.push("/")}>
            HAKI
          </div>
          <div style={{ fontSize:11, color:"#9FA8DA", letterSpacing:".1em", textTransform:"uppercase" as const }}>
            Plateforme GIS · Côte d'Ivoire
          </div>
        </div>

        {/* Card */}
        <div style={{ background:"#fff", borderRadius:16, padding:"32px 36px", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>

          {/* Étapes */}
          <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:28 }}>
            {[
              { n:1, label:"Organisation" },
              { n:2, label:"Compte" },
              { n:3, label:"Segment" },
            ].map((e, i) => (
              <div key={e.n} style={{ display:"flex", alignItems:"center", flex: i < 2 ? 1 : "none" }}>
                <div style={{ display:"flex", flexDirection:"column" as const, alignItems:"center", gap:4 }}>
                  <div style={{
                    width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:12, fontWeight:700,
                    background: etape > e.n ? "#2E7D32" : etape === e.n ? "#1A237E" : "#E0E0E0",
                    color: etape >= e.n ? "#fff" : "#9E9E9E",
                  }}>
                    {etape > e.n ? "✓" : e.n}
                  </div>
                  <div style={{ fontSize:9, fontWeight:600, color: etape === e.n ? "#1A237E" : "#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".06em" }}>
                    {e.label}
                  </div>
                </div>
                {i < 2 && <div style={{ flex:1, height:2, background: etape > e.n + 0.5 ? "#2E7D32" : "#E0E0E0", margin:"0 6px 16px" }}/>}
              </div>
            ))}
          </div>

          {/* ── ÉTAPE 1 : Organisation ── */}
          {etape === 1 && (
            <div style={{ display:"flex", flexDirection:"column" as const, gap:14 }}>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:"#1A237E", marginBottom:4 }}>Votre organisation</div>
                <div style={{ fontSize:12, color:"#9E9E9E" }}>Informations sur votre entreprise ou organisation</div>
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#424242", textTransform:"uppercase" as const, letterSpacing:".07em", display:"block", marginBottom:5 }}>Nom de l'organisation *</label>
                <input className="inp" value={form.orgNom} onChange={e=>set("orgNom",e.target.value)}
                  placeholder="Ex : Groupe Nsia, MTN CI, ONG AFEF..." style={{ fontSize:14 }}/>
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#424242", textTransform:"uppercase" as const, letterSpacing:".07em", display:"block", marginBottom:5 }}>Secteur d'activité *</label>
                <select value={form.secteur} onChange={e=>set("secteur",e.target.value)}
                  style={{ width:"100%", padding:"11px 14px", border:"1px solid #E0E0E0", borderRadius:8, fontSize:14, fontFamily:"system-ui", background:"#fff", color: form.secteur ? "#212121" : "#9E9E9E" }}>
                  <option value="">Sélectionner...</option>
                  {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#424242", textTransform:"uppercase" as const, letterSpacing:".07em", display:"block", marginBottom:8 }}>Taille *</label>
                <div style={{ display:"flex", flexDirection:"column" as const, gap:6 }}>
                  {TAILLES.map(t => (
                    <button key={t.id} className="hb"
                      onClick={() => set("taille", t.id)}
                      style={{ padding:"9px 14px", textAlign:"left" as const, fontSize:12,
                        background: form.taille===t.id ? "#E8EAF6" : "#F5F5F5",
                        border: `1.5px solid ${form.taille===t.id ? "#1A237E" : "transparent"}`,
                        color: form.taille===t.id ? "#1A237E" : "#424242",
                        fontWeight: form.taille===t.id ? 600 : 400 }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#424242", textTransform:"uppercase" as const, letterSpacing:".07em", display:"block", marginBottom:5 }}>Ville</label>
                <input className="inp" value={form.ville} onChange={e=>set("ville",e.target.value)}
                  placeholder="Abidjan" style={{ fontSize:14 }}/>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 : Compte ── */}
          {etape === 2 && (
            <div style={{ display:"flex", flexDirection:"column" as const, gap:14 }}>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:"#1A237E", marginBottom:4 }}>Votre compte</div>
                <div style={{ fontSize:12, color:"#9E9E9E" }}>Identifiants de connexion à la plateforme Haki</div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"#424242", textTransform:"uppercase" as const, letterSpacing:".07em", display:"block", marginBottom:5 }}>Prénom *</label>
                  <input className="inp" value={form.prenom} onChange={e=>set("prenom",e.target.value)} placeholder="Ex : Kofi" style={{ fontSize:14 }}/>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"#424242", textTransform:"uppercase" as const, letterSpacing:".07em", display:"block", marginBottom:5 }}>Nom *</label>
                  <input className="inp" value={form.nom} onChange={e=>set("nom",e.target.value)} placeholder="Ex : Kouassi" style={{ fontSize:14 }}/>
                </div>
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#424242", textTransform:"uppercase" as const, letterSpacing:".07em", display:"block", marginBottom:5 }}>Votre rôle</label>
                <select value={form.role} onChange={e=>set("role",e.target.value)}
                  style={{ width:"100%", padding:"11px 14px", border:"1px solid #E0E0E0", borderRadius:8, fontSize:14, fontFamily:"system-ui", background:"#fff" }}>
                  <option value="drh">DRH — Directeur des Ressources Humaines</option>
                  <option value="dg">DG — Directeur Général</option>
                  <option value="rse">Responsable RSE / GIS</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#424242", textTransform:"uppercase" as const, letterSpacing:".07em", display:"block", marginBottom:5 }}>Email professionnel *</label>
                <input className="inp" type="email" value={form.email} onChange={e=>set("email",e.target.value)}
                  placeholder="prenom.nom@organisation.ci" style={{ fontSize:14 }}/>
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#424242", textTransform:"uppercase" as const, letterSpacing:".07em", display:"block", marginBottom:5 }}>Mot de passe *</label>
                <input className="inp" type="password" value={form.password} onChange={e=>set("password",e.target.value)}
                  placeholder="Minimum 8 caractères" style={{ fontSize:14 }}/>
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#424242", textTransform:"uppercase" as const, letterSpacing:".07em", display:"block", marginBottom:5 }}>Confirmer le mot de passe *</label>
                <input className="inp" type="password" value={form.passwordConfirm} onChange={e=>set("passwordConfirm",e.target.value)}
                  placeholder="Répétez le mot de passe" style={{ fontSize:14 }}/>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 : Segment ── */}
          {etape === 3 && (
            <div style={{ display:"flex", flexDirection:"column" as const, gap:14 }}>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:"#1A237E", marginBottom:4 }}>Votre profil Haki</div>
                <div style={{ fontSize:12, color:"#9E9E9E" }}>Sélectionnez le segment qui correspond à votre organisation</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column" as const, gap:10 }}>
                {SEGMENTS.map(s => (
                  <button key={s.id} className="seg-btn"
                    onClick={() => set("segment", s.id)}
                    style={{
                      padding:"16px 18px", textAlign:"left" as const, border:`2px solid ${form.segment===s.id ? s.color : "#E0E0E0"}`,
                      background: form.segment===s.id ? s.bg : "#fff",
                    }}>
                    <div style={{ fontSize:13, fontWeight:700, color: form.segment===s.id ? s.color : "#212121" }}>{s.label}</div>
                  </button>
                ))}
              </div>

              {/* Récap */}
              <div style={{ background:"#F8F9FA", borderRadius:10, padding:"14px 16px", marginTop:4 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#9E9E9E", textTransform:"uppercase" as const, letterSpacing:".07em", marginBottom:8 }}>Récapitulatif</div>
                <div style={{ fontSize:12, color:"#424242", lineHeight:1.8 }}>
                  🏢 {form.orgNom} · {form.secteur}<br/>
                  👤 {form.prenom} {form.nom} · {form.role.toUpperCase()}<br/>
                  📧 {form.email}
                </div>
              </div>

              <div style={{ fontSize:11, color:"#9E9E9E", lineHeight:1.6 }}>
                En créant votre compte, vous acceptez les conditions d'utilisation de Haki et la politique de confidentialité conforme à la loi n° 2013-450 CI.
              </div>
            </div>
          )}

          {/* Erreur */}
          {erreur && (
            <div style={{ marginTop:12, padding:"8px 12px", background:"#FFEBEE", borderRadius:7, color:"#B71C1C", fontSize:12 }}>
              ⚠️ {erreur}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:20 }}>
            {etape > 1 ? (
              <button className="hb" onClick={() => { setEtape(e => e-1); setErreur(""); }}
                style={{ padding:"10px 18px", background:"#F5F5F5", color:"#424242", fontSize:13 }}>
                ← Retour
              </button>
            ) : (
              <button className="hb" onClick={() => router.push("/connexion")}
                style={{ padding:"10px 18px", background:"transparent", color:"#9E9E9E", fontSize:12, border:"none" }}>
                Déjà inscrit ? Se connecter
              </button>
            )}

            {etape < 3 ? (
              <button className="hb"
                onClick={() => {
                  if (etape === 1 && !validerEtape1()) return;
                  if (etape === 2 && !validerEtape2()) return;
                  setEtape(e => e+1);
                }}
                style={{ padding:"11px 24px", background:"#1A237E", color:"#fff", fontSize:13 }}>
                Continuer →
              </button>
            ) : (
              <button className="hb" onClick={soumettre} disabled={loading}
                style={{ padding:"11px 24px", background:loading?"#9FA8DA":"#1A237E", color:"#fff", fontSize:13 }}>
                {loading ? "Création en cours..." : "Créer mon compte →"}
              </button>
            )}
          </div>
        </div>

        <div style={{ textAlign:"center" as const, marginTop:16, fontSize:11, color:"rgba(255,255,255,0.3)" }}>
          © 2026 Haki · Abidjan, Côte d'Ivoire
        </div>
      </div>
    </div>
  );
}
