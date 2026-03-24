"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  CATALOGUE, PACKAGES, calculerMontant, calculerMontantPackage,
  getTailleFromEffectif, formaterFcfa,
  type TypeDocument, type NiveauDocument, type TailleOrganisation,
} from "@/lib/catalogue-documents";

const DOCS_ORDER: TypeDocument[] = ["strategie_genre","charte_di","politique_genre","pag","mecanisme_se"];

export default function DocumentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orgData, setOrgData] = useState<any>(null);
  const [sessionDiag, setSessionDiag] = useState<any>(null);
  const [taille, setTaille] = useState<TailleOrganisation>("pme");
  const [niveau, setNiveau] = useState<NiveauDocument>("standard");
  const [vue, setVue] = useState<"catalogue"|"packages"|"commandes">("catalogue");
  const [docSelectionne, setDocSelectionne] = useState<TypeDocument | null>(null);
  const [packSelectionne, setPackSelectionne] = useState<string | null>(null);
  const [notesClient, setNotesClient] = useState("");
  const [loading, setLoading] = useState(true);
  const [commandeLoading, setCommandeLoading] = useState(false);
  const [commandeResult, setCommandeResult] = useState<any>(null);
  const [commandes, setCommandes] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    Promise.all([
      fetch("/api/sessions").then(r => r.json()),
      fetch("/api/documents").then(r => r.json()),
    ]).then(([sessions, docs]) => {
      const latest = sessions.sessions?.[0];
      setSessionDiag(latest);
      if (latest) {
        const t = getTailleFromEffectif(latest.organisation?.taille ?? "50-200");
        setTaille(t);
      }
      setCommandes(docs.commandes ?? []);
      setLoading(false);
    });
  }, [status]);

  async function commander(typeDoc: TypeDocument, packageId?: string) {
    if (!sessionDiag?.id) return;
    setCommandeLoading(true);
    setCommandeResult(null);
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sessionDiag.id,
        typeDocument: typeDoc,
        niveau,
        notesClient: notesClient || undefined,
        packageId,
      }),
    });
    const data = await res.json();
    setCommandeResult(data);
    setCommandeLoading(false);
    if (data.success) {
      const docs = await fetch("/api/documents").then(r => r.json());
      setCommandes(docs.commandes ?? []);
    }
  }

  const STATUT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    en_attente:        { label: "En attente",       color: "#E65100", bg: "#FFF3E0" },
    proforma_envoyee:  { label: "Proforma envoyée", color: "#1565C0", bg: "#E3F2FD" },
    validee:           { label: "Validée ✓",         color: "#2E7D32", bg: "#E8F5E9" },
    en_production:     { label: "En production",    color: "#6A1B9A", bg: "#F3E5F5" },
    livre:             { label: "Livré ✓",           color: "#2E7D32", bg: "#E8F5E9" },
    annule:            { label: "Annulé",            color: "#757575", bg: "#F5F5F5" },
  };

  if (status === "loading" || loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", fontFamily:"system-ui" }}>
      <div style={{ color:"#1A237E" }}>Chargement...</div>
    </div>
  );

  return (
    <div style={{ fontFamily:"system-ui,sans-serif", background:"#F5F5F5", minHeight:"100vh" }}>
      {/* Header */}
      <div style={{ background:"#1A237E", padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:20, fontWeight:600, color:"#FFC107", letterSpacing:2 }}>HAKI</span>
          <span style={{ fontSize:12, color:"#9FA8DA" }}>Production documentaire GIS</span>
        </div>
        <button onClick={() => router.push("/dashboard")}
          style={{ background:"transparent", border:"1px solid #3949AB", color:"#90CAF9", borderRadius:6, padding:"6px 14px", fontSize:12, cursor:"pointer" }}>
          ← Tableau de bord
        </button>
      </div>

      {/* Intro */}
      <div style={{ background:"#fff", borderBottom:"1px solid #E0E0E0", padding:"16px 28px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ fontSize:16, fontWeight:500, color:"#1A237E", marginBottom:4 }}>
            Documents GIS personnalisés pour {sessionDiag?.organisation?.nom ?? "votre organisation"}
          </div>
          <div style={{ fontSize:13, color:"#757575" }}>
            Chaque document est produit sur mesure à partir de vos données diagnostiques Haki · Livraison 10 à 21 jours ouvrés · Contextualisation CI garantie
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ background:"#fff", borderBottom:"2px solid #E0E0E0", padding:"0 28px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", gap:0 }}>
          {[
            { id:"catalogue", label:"📄 Documents individuels" },
            { id:"packages",  label:"📦 Packages (économies jusqu'à -30%)" },
            { id:"commandes", label:`🧾 Mes commandes (${commandes.length})` },
          ].map(o => (
            <button key={o.id} onClick={() => setVue(o.id as any)}
              style={{ padding:"12px 20px", border:"none", background:"transparent", fontSize:13, fontWeight:500, cursor:"pointer",
                color: vue === o.id ? "#1A237E" : "#9E9E9E",
                borderBottom: vue === o.id ? "2px solid #1A237E" : "2px solid transparent",
                marginBottom: -2 }}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 20px" }}>

        {/* Sélecteur niveau */}
        <div style={{ background:"#fff", borderRadius:10, padding:"16px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
          <div style={{ fontSize:13, fontWeight:500, color:"#424242" }}>Niveau de service :</div>
          {(["standard","enrichi","premium"] as NiveauDocument[]).map(n => (
            <label key={n} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", padding:"8px 16px",
              border:`1.5px solid ${niveau === n ? "#1A237E" : "#E0E0E0"}`,
              borderRadius:8, background: niveau === n ? "#E8EAF6" : "#FAFAFA" }}>
              <input type="radio" name="niveau" checked={niveau === n} onChange={() => setNiveau(n)} style={{ accentColor:"#1A237E" }}/>
              <div>
                <div style={{ fontSize:13, fontWeight:500, color: niveau === n ? "#1A237E" : "#424242" }}>
                  {n === "standard" ? "Standard" : n === "enrichi" ? "Enrichi +35%" : "Premium +75%"}
                </div>
                <div style={{ fontSize:11, color:"#9E9E9E" }}>
                  {n === "standard" ? "Données Haki uniquement · 10j" : n === "enrichi" ? "Revue documentaire · 15j" : "Expert Haki + validation · 21j"}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Résultat commande */}
        {commandeResult && (
          <div style={{ padding:"16px 20px", borderRadius:10, marginBottom:20,
            background: commandeResult.success ? "#E8F5E9" : "#FFEBEE",
            border: `1px solid ${commandeResult.success ? "#A5D6A7" : "#EF9A9A"}` }}>
            {commandeResult.success ? (
              <>
                <div style={{ fontSize:14, fontWeight:500, color:"#2E7D32", marginBottom:6 }}>
                  ✓ Demande enregistrée — Référence {commandeResult.proformaRef}
                </div>
                <div style={{ fontSize:13, color:"#424242", marginBottom:4 }}>
                  Montant : <strong>{formaterFcfa(commandeResult.montant)}</strong>
                </div>
                <div style={{ fontSize:12, color:"#616161" }}>
                  Vous recevrez votre proforma détaillée par email sous 24h.
                  Livraison prévue : {new Date(commandeResult.livraisonPrevue).toLocaleDateString("fr-FR")}.
                </div>
              </>
            ) : (
              <div style={{ fontSize:13, color:"#B71C1C" }}>{commandeResult.error}</div>
            )}
          </div>
        )}

        {/* ══ VUE CATALOGUE ══ */}
        {vue === "catalogue" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {DOCS_ORDER.map(type => {
              const doc = CATALOGUE[type];
              const montant = calculerMontant(type, niveau, taille);
              const isSelected = docSelectionne === type;
              return (
                <div key={type} style={{ background:"#fff", borderRadius:12, overflow:"hidden",
                  border: `1.5px solid ${isSelected ? doc.couleur : "#E0E0E0"}`,
                  transition:"border .2s" }}>
                  {/* En-tête */}
                  <div style={{ background:doc.bg, padding:"16px 20px", borderBottom:`1px solid ${doc.couleur}20` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontSize:20, marginBottom:4 }}>{doc.emoji}</div>
                        <div style={{ fontSize:15, fontWeight:600, color:doc.couleur }}>{doc.label}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:16, fontWeight:600, color:doc.couleur }}>{formaterFcfa(montant)}</div>
                        <div style={{ fontSize:10, color:"#9E9E9E" }}>Livraison {doc.dureeJours[niveau]}j ouvrés</div>
                      </div>
                    </div>
                  </div>
                  {/* Corps */}
                  <div style={{ padding:"16px 20px" }}>
                    {/* Objectifs */}
                    <div style={{ fontSize:12, fontWeight:500, color:"#424242", marginBottom:8 }}>Objectifs</div>
                    {doc.objectifs.slice(0,2).map((o,i) => (
                      <div key={i} style={{ display:"flex", gap:6, fontSize:12, color:"#616161", marginBottom:4 }}>
                        <span style={{ color:doc.couleur }}>→</span><span>{o}</span>
                      </div>
                    ))}

                    {/* Table des matières condensée */}
                    <div style={{ marginTop:12, fontSize:12, fontWeight:500, color:"#424242", marginBottom:6 }}>Table des matières</div>
                    <div style={{ background:"#F5F5F5", borderRadius:6, padding:"10px 12px" }}>
                      {doc.tableDesMatieres.slice(0,5).map((t,i) => (
                        <div key={i} style={{ fontSize:11, color:"#616161", marginBottom:3 }}>{t}</div>
                      ))}
                      {doc.tableDesMatieres.length > 5 && (
                        <div style={{ fontSize:11, color:"#9E9E9E" }}>+ {doc.tableDesMatieres.length - 5} chapitres...</div>
                      )}
                    </div>

                    {/* Niveau sélectionné */}
                    <div style={{ marginTop:12, padding:"10px 12px", background:doc.bg, borderRadius:6 }}>
                      <div style={{ fontSize:12, fontWeight:500, color:doc.couleur, marginBottom:6 }}>
                        {doc.niveaux[niveau].label} — {doc.niveaux[niveau].description}
                      </div>
                      {doc.niveaux[niveau].inclus.slice(0,3).map((item,i) => (
                        <div key={i} style={{ fontSize:11, color:"#424242", marginBottom:2 }}>✓ {item}</div>
                      ))}
                    </div>

                    {/* Bouton */}
                    <button onClick={() => { setDocSelectionne(type); commander(type); }}
                      disabled={commandeLoading || !sessionDiag?.scoreMmiCi}
                      style={{ width:"100%", marginTop:14, padding:"10px 0", background: commandeLoading ? "#9FA8DA" : doc.couleur,
                        color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:500,
                        cursor: commandeLoading || !sessionDiag?.scoreMmiCi ? "default" : "pointer" }}>
                      {commandeLoading && docSelectionne === type ? "Enregistrement..." :
                       !sessionDiag?.scoreMmiCi ? "Score MMI-CI requis" : "Commander ce document →"}
                    </button>
                    {!sessionDiag?.scoreMmiCi && (
                      <div style={{ fontSize:11, color:"#E65100", textAlign:"center", marginTop:4 }}>
                        Complétez d'abord le questionnaire ORGANISATION
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ VUE PACKAGES ══ */}
        {vue === "packages" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {PACKAGES.map(pack => {
              const { sansRemise, avecRemise, economie } = calculerMontantPackage(pack.id, niveau, taille);
              return (
                <div key={pack.id} style={{ background:"#fff", borderRadius:12, overflow:"hidden",
                  border: `1.5px solid ${pack.recommande ? "#FFC107" : "#E0E0E0"}` }}>
                  {pack.recommande && (
                    <div style={{ background:"#FFC107", padding:"5px 20px", fontSize:11, fontWeight:600, color:"#1A237E", textAlign:"center" }}>
                      ⭐ RECOMMANDÉ — Le plus choisi par les organisations CI
                    </div>
                  )}
                  <div style={{ padding:"20px 24px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                      <div>
                        <div style={{ fontSize:18, marginBottom:4 }}>{pack.emoji}</div>
                        <div style={{ fontSize:16, fontWeight:600, color:"#1A237E" }}>{pack.label}</div>
                        <div style={{ fontSize:13, color:"#757575", marginTop:2 }}>{pack.description}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:13, color:"#9E9E9E", textDecoration:"line-through" }}>{formaterFcfa(sansRemise)}</div>
                        <div style={{ fontSize:22, fontWeight:600, color:"#1A237E" }}>{formaterFcfa(avecRemise)}</div>
                        <div style={{ fontSize:12, color:"#2E7D32", fontWeight:500 }}>Économie : {formaterFcfa(economie)} (-{Math.round(pack.remise*100)}%)</div>
                        <div style={{ fontSize:10, color:"#9E9E9E" }}>Livraison {pack.documents.length > 3 ? 15 : 10}j ouvrés · Niveau {niveau}</div>
                      </div>
                    </div>
                    {/* Documents inclus */}
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
                      {pack.documents.map(doc => (
                        <div key={doc} style={{ padding:"6px 12px", background:CATALOGUE[doc].bg, borderRadius:6,
                          fontSize:12, color:CATALOGUE[doc].couleur, fontWeight:500 }}>
                          {CATALOGUE[doc].emoji} {CATALOGUE[doc].label}
                        </div>
                      ))}
                    </div>
                    {/* Notes client */}
                    <textarea value={notesClient} onChange={e => setNotesClient(e.target.value)}
                      placeholder="Informations complémentaires pour Haki (optionnel)..."
                      rows={2} style={{ width:"100%", padding:"8px 12px", border:"1px solid #E0E0E0",
                        borderRadius:6, fontSize:12, resize:"none", marginBottom:12, boxSizing:"border-box" }} />
                    {/* Bouton commander */}
                    <button
                      onClick={async () => {
                        setPackSelectionne(pack.id);
                        setCommandeLoading(true);
                        setCommandeResult(null);
                        // Commander chaque document du package
                        let lastResult: any = null;
                        for (const doc of pack.documents) {
                          const res = await fetch("/api/documents", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ sessionId: sessionDiag?.id, typeDocument: doc, niveau, notesClient: notesClient || undefined, packageId: pack.id }),
                          });
                          lastResult = await res.json();
                        }
                        setCommandeResult({ ...lastResult, success: true, message: `Package ${pack.label} commandé — ${pack.documents.length} documents` });
                        setCommandeLoading(false);
                        const docs = await fetch("/api/documents").then(r => r.json());
                        setCommandes(docs.commandes ?? []);
                      }}
                      disabled={commandeLoading || !sessionDiag?.scoreMmiCi}
                      style={{ width:"100%", padding:"12px 0", background: commandeLoading ? "#9FA8DA" : "#1A237E",
                        color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:500,
                        cursor: commandeLoading || !sessionDiag?.scoreMmiCi ? "default" : "pointer" }}>
                      {commandeLoading && packSelectionne === pack.id ? "Enregistrement..." :
                       !sessionDiag?.scoreMmiCi ? "Score MMI-CI requis" :
                       `Commander le ${pack.label} — ${formaterFcfa(avecRemise)} →`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ VUE COMMANDES ══ */}
        {vue === "commandes" && (
          <div>
            {commandes.length === 0 ? (
              <div style={{ background:"#fff", borderRadius:12, padding:32, textAlign:"center" }}>
                <div style={{ fontSize:32, marginBottom:12 }}>📄</div>
                <div style={{ fontSize:15, fontWeight:500, color:"#1A237E", marginBottom:8 }}>Aucune commande pour le moment</div>
                <div style={{ fontSize:13, color:"#9E9E9E", marginBottom:20 }}>Parcourez notre catalogue et commandez vos premiers documents GIS.</div>
                <button onClick={() => setVue("catalogue")}
                  style={{ padding:"10px 24px", background:"#1A237E", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer" }}>
                  Voir le catalogue →
                </button>
              </div>
            ) : (
              commandes.map((c: any, i: number) => {
                const doc = CATALOGUE[c.typeDocument as TypeDocument];
                const statut = STATUT_CONFIG[c.statut] ?? STATUT_CONFIG.en_attente;
                return (
                  <div key={i} style={{ background:"#fff", borderRadius:10, padding:"16px 20px", marginBottom:10,
                    borderLeft:`4px solid ${doc?.couleur ?? "#1A237E"}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                          <span style={{ fontSize:16 }}>{doc?.emoji}</span>
                          <span style={{ fontSize:14, fontWeight:500, color:"#212121" }}>{doc?.label}</span>
                          <span style={{ fontSize:11, padding:"2px 8px", borderRadius:99,
                            background: statut.bg, color: statut.color, fontWeight:500 }}>
                            {statut.label}
                          </span>
                        </div>
                        <div style={{ fontSize:12, color:"#9E9E9E" }}>
                          Réf. {c.proformaRef} · Niveau {c.niveau} · {formaterFcfa(c.montantFcfa)}
                        </div>
                        <div style={{ fontSize:12, color:"#9E9E9E", marginTop:2 }}>
                          Commandé le {new Date(c.commandeeLe).toLocaleDateString("fr-FR")}
                          {c.livraisonPrevue && ` · Livraison prévue : ${new Date(c.livraisonPrevue).toLocaleDateString("fr-FR")}`}
                        </div>
                      </div>
                      {c.urlDocument && (
                        <a href={c.urlDocument} target="_blank" rel="noopener noreferrer"
                          style={{ padding:"8px 16px", background:"#E8F5E9", color:"#2E7D32",
                            border:"none", borderRadius:8, fontSize:12, fontWeight:500, textDecoration:"none" }}>
                          📥 Télécharger
                        </a>
                      )}
                    </div>
                    {c.statut === "en_attente" && (
                      <div style={{ marginTop:10, padding:"8px 12px", background:"#FFF3E0", borderRadius:6, fontSize:12, color:"#E65100" }}>
                        ⏳ Votre proforma sera envoyée par email sous 24h. Une fois validée et réglée, la production démarrera.
                      </div>
                    )}
                    {c.statut === "proforma_envoyee" && (
                      <div style={{ marginTop:10, padding:"8px 12px", background:"#E3F2FD", borderRadius:6, fontSize:12, color:"#1565C0" }}>
                        📧 Proforma envoyée — Vérifiez votre email et validez pour lancer la production.
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Note contextualisation */}
        <div style={{ marginTop:20, padding:"14px 18px", background:"#E8EAF6", borderRadius:8, fontSize:12, color:"#3949AB", lineHeight:1.6 }}>
          <strong>Contextualisation garantie :</strong> Chaque document est produit sur mesure à partir de vos 67 réponses diagnostiques,
          votre score MMI-CI ({sessionDiag?.scoreMmiCi?.scoreGlobal ?? "—"}/100), vos alertes SOCLE et votre secteur d'activité CI.
          Aucun document générique — chaque phrase cite vos données réelles.
        </div>
      </div>
    </div>
  );
}
