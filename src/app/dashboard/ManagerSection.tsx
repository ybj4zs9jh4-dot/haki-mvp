"use client";
import { useState, useEffect } from "react";

export default function ManagerSection({ sessionId, copie, setCopie }: {
  sessionId: string;
  copie: string;
  setCopie: (v: string) => void;
}) {
  const [mode, setMode] = useState<"none"|"email"|"lien">("none");
  const [emailsText, setEmailsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [liens, setLiens] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [dateCloture, setDateCloture] = useState("");
  const [rappelLoading, setRappelLoading] = useState(false);
  const [rappelResult, setRappelResult] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    chargerStats();
  }, [sessionId]);

  async function chargerStats() {
    const d = await fetch(`/api/sessions/${sessionId}/parametres-managers`).then(r => r.json());
    if (d.stats) {
      setStats(d.stats);
      if (d.stats.dateClotureMgr) {
        setDateCloture(new Date(d.stats.dateClotureMgr).toISOString().split("T")[0]);
      }
    }
  }

  async function envoyerEmails() {
    const emails = emailsText.split(/[\n,;]+/).map(e => e.trim()).filter(e => e.includes("@"));
    if (emails.length === 0) { alert("Aucune adresse email valide."); return; }
    setLoading(true); setResult(null);
    const res = await fetch(`/api/sessions/${sessionId}/envoyer-liens-managers`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails }),
    });
    const data = await res.json();
    setResult(data);
    if (data.liens) setLiens(l => [...l, ...data.liens]);
    setLoading(false);
    chargerStats();
  }

  async function genererLien() {
    setLoading(true);
    const res = await fetch(`/api/admin/creer-token-manager`);
    const data = await res.json();
    if (data.url) setLiens(l => [...l, data.url]);
    setLoading(false);
    chargerStats();
  }

  async function sauvegarderCloture() {
    await fetch(`/api/sessions/${sessionId}/parametres-managers`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dateClotureMgr: dateCloture }),
    });
    chargerStats();
  }

  async function envoyerRappel() {
    setRappelLoading(true); setRappelResult(null);
    const res = await fetch(`/api/sessions/${sessionId}/parametres-managers`, { method: "POST" });
    const data = await res.json();
    setRappelResult(data);
    setRappelLoading(false);
    chargerStats();
  }

  function copierTexte(texte: string, id: string) {
    navigator.clipboard.writeText(texte);
    setCopie(id);
    setTimeout(() => setCopie(""), 2000);
  }

  const joursRestants = dateCloture ? Math.ceil((new Date(dateCloture).getTime() - Date.now()) / 86400000) : null;

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 22, marginBottom: 16 }}>

      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#424242" }}>Auto-diagnostic MANAGERS</div>
          <div style={{ fontSize: 12, color: "#9E9E9E", marginTop: 2 }}>
            Liens privés · Score strictement confidentiel · Jamais transmis à l'organisation
          </div>
        </div>
        {stats && stats.total > 0 && (
          <button onClick={() => setShowDetail(!showDetail)}
            style={{ fontSize: 12, color: "#E65100", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
            {showDetail ? "Masquer détails" : "Voir détails"}
          </button>
        )}
      </div>

      {/* Taux de complétion */}
      {stats && stats.total > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ fontSize: 13, color: "#424242" }}>
              <strong style={{ color: "#E65100" }}>{stats.completes}/{stats.total}</strong> managers ont complété
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: stats.tauxCompletion === 100 ? "#2E7D32" : "#E65100" }}>
              {stats.tauxCompletion}%
            </div>
          </div>
          <div style={{ height: 10, background: "#F5F5F5", borderRadius: 5, overflow: "hidden" }}>
            <div style={{ width: `${stats.tauxCompletion}%`, height: "100%", background: stats.tauxCompletion === 100 ? "#2E7D32" : "#E65100", borderRadius: 5, transition: "width .5s" }} />
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 11, color: "#9E9E9E" }}>
            <span><strong style={{ color: "#2E7D32" }}>{stats.completes}</strong> complétés</span>
            <span><strong style={{ color: "#E65100" }}>{stats.enAttente}</strong> en attente</span>
            <span><strong style={{ color: "#9E9E9E" }}>{stats.expires}</strong> expirés</span>
          </div>

          {/* Détail managers en attente */}
          {showDetail && stats.managersEnAttente?.length > 0 && (
            <div style={{ marginTop: 12, background: "#FFF3E0", borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#E65100", marginBottom: 8 }}>
                Managers n'ayant pas encore complété :
              </div>
              {stats.managersEnAttente.map((m: any, i: number) => (
                <div key={i} style={{ fontSize: 12, color: "#424242", marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                  <span>{m.email}</span>
                  <span style={{ color: "#9E9E9E" }}>expire le {new Date(m.expireAt).toLocaleDateString("fr-FR")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Date de clôture */}
      <div style={{ background: "#F5F5F5", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#424242", marginBottom: 8 }}>📅 Date de clôture du diagnostic managers</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="date" value={dateCloture} onChange={e => setDateCloture(e.target.value)}
            style={{ padding: "7px 12px", border: "1.5px solid #E0E0E0", borderRadius: 8, fontSize: 13 }} />
          <button onClick={sauvegarderCloture}
            style={{ padding: "7px 16px", background: "#E65100", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
            Enregistrer
          </button>
          {joursRestants !== null && (
            <span style={{ fontSize: 12, color: joursRestants <= 3 ? "#B71C1C" : "#9E9E9E" }}>
              {joursRestants > 0 ? `${joursRestants} jour(s) restant(s)` : "Date dépassée"}
            </span>
          )}
        </div>
      </div>

      {/* Rappel automatique */}
      {stats && stats.enAttente > 0 && (
        <div style={{ background: "#FFEBEE", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#B71C1C", marginBottom: 6 }}>
            📣 {stats.enAttente} manager(s) n'ont pas encore complété leur diagnostic
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={envoyerRappel} disabled={rappelLoading}
              style={{ padding: "8px 16px", background: rappelLoading ? "#9FA8DA" : "#B71C1C", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: rappelLoading ? "default" : "pointer" }}>
              {rappelLoading ? "Envoi en cours..." : "Envoyer un rappel par email →"}
            </button>
            {rappelResult && (
              <span style={{ fontSize: 12, color: rappelResult.envoyes > 0 ? "#2E7D32" : "#E65100" }}>
                {rappelResult.envoyes > 0 ? `✓ ${rappelResult.envoyes} rappel(s) envoyé(s)` : "⚠ Erreur d'envoi"}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Invitation */}
      {mode === "none" && (
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setMode("email")}
            style={{ flex: 1, padding: "14px 16px", background: "#FFF3E0", color: "#E65100", border: "1.5px solid #FFCC8040", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", textAlign: "left" }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>📧</div>
            <div>Envoyer par email aux managers</div>
            <div style={{ fontSize: 11, color: "#E6510099", marginTop: 2 }}>Envoi automatique du lien privé</div>
          </button>
          <button onClick={() => setMode("lien")}
            style={{ flex: 1, padding: "14px 16px", background: "#E0F2F1", color: "#00695C", border: "1.5px solid #A5D6A7", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", textAlign: "left" }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>🔗</div>
            <div>Générer un lien manager</div>
            <div style={{ fontSize: 11, color: "#4DB6AC", marginTop: 2 }}>Copier et partager manuellement</div>
          </button>
        </div>
      )}

      {mode !== "none" && (
        <>
          <button onClick={() => setMode("none")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#F5F5F5", color: "#424242", border: "1.5px solid #E0E0E0", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", marginBottom: 16 }}>
            ← Changer de méthode
          </button>

          {mode === "email" && (
            <div>
              <div style={{ fontSize: 13, color: "#424242", marginBottom: 8 }}>
                Saisissez les emails des managers — un par ligne :
              </div>
              <textarea value={emailsText} onChange={e => setEmailsText(e.target.value)}
                placeholder={"manager1@entreprise.ci\nmanager2@entreprise.ci"}
                rows={4} style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #E0E0E0", borderRadius: 8, fontSize: 13, fontFamily: "monospace", resize: "vertical", marginBottom: 10, boxSizing: "border-box" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#9E9E9E" }}>
                  {emailsText.split(/[\n,;]+/).filter(e => e.trim().includes("@")).length} manager(s) détecté(s)
                </span>
                <button onClick={envoyerEmails} disabled={loading}
                  style={{ padding: "10px 20px", background: loading ? "#9FA8DA" : "#E65100", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: loading ? "default" : "pointer" }}>
                  {loading ? "Envoi..." : "Envoyer les liens →"}
                </button>
              </div>
              {result && (
                <div style={{ padding: "10px 14px", borderRadius: 8, background: result.erreurs > 0 ? "#FFF3E0" : "#E8F5E9", fontSize: 13, color: result.erreurs > 0 ? "#E65100" : "#2E7D32" }}>
                  {result.envoyes > 0 && <div>✓ {result.envoyes} email(s) envoyé(s)</div>}
                  {result.erreurs > 0 && <div>⚠ {result.erreurs} email(s) non envoyé(s)</div>}
                </div>
              )}
              <div style={{ marginTop: 10, fontSize: 11, color: "#9E9E9E" }}>
                ⚠ En mode test, l'envoi n'est possible que vers l'email de votre compte Resend.
              </div>
            </div>
          )}

          {mode === "lien" && (
            <div>
              <button onClick={genererLien} disabled={loading}
                style={{ padding: "9px 18px", background: loading ? "#9FA8DA" : "#00695C", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: loading ? "default" : "pointer", marginBottom: 14 }}>
                {loading ? "Génération..." : "Générer un lien →"}
              </button>
              {liens.length > 0 && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: "#2E7D32" }}>✓ {liens.length} lien(s) généré(s)</div>
                    <button onClick={() => copierTexte(liens.join("\n"), "mgr-tous")}
                      style={{ padding: "5px 12px", background: copie === "mgr-tous" ? "#2E7D32" : "#E0F2F1", color: copie === "mgr-tous" ? "#fff" : "#00695C", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                      {copie === "mgr-tous" ? "✓ Copié !" : "Copier tous"}
                    </button>
                  </div>
                  <div style={{ background: "#F5F5F5", borderRadius: 8, padding: 14, maxHeight: 180, overflowY: "auto" }}>
                    {liens.map((url, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: "#757575", minWidth: 22 }}>{i + 1}.</span>
                        <span style={{ fontSize: 11, color: "#E65100", fontFamily: "monospace", flex: 1, wordBreak: "break-all" }}>{url}</span>
                        <button onClick={() => copierTexte(url, `mgr-${i}`)}
                          style={{ padding: "3px 10px", background: copie === `mgr-${i}` ? "#2E7D32" : "#E0F2F1", color: copie === `mgr-${i}` ? "#fff" : "#00695C", border: "none", borderRadius: 4, fontSize: 11, cursor: "pointer", flexShrink: 0 }}>
                          {copie === `mgr-${i}` ? "✓" : "Copier"}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 11, color: "#9E9E9E" }}>
                    Chaque lien est personnel et confidentiel · Expiration 30 jours
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
