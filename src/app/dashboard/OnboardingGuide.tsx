"use client";
import { useState, useEffect } from "react";

interface OnboardingGuideProps {
  score: any;
  socle: any;
  statsCollab: any;
  sessionId: string | null;
  onNavigate: (path: string) => void;
}

const ETAPES = [
  {
    id: 1,
    titre: "Diagnostic SOCLE",
    desc: "Évaluez votre conformité sociale — obligations légales, suivi médical, protection sociale.",
    emoji: "⚖️",
    color: "#B71C1C",
    bg: "#FFEBEE",
    cta: "Compléter le SOCLE →",
    action: "socle",
  },
  {
    id: 2,
    titre: "Questionnaire Organisation",
    desc: "Répondez aux 67 questions GIS pour obtenir votre score de maturité inclusive sur 100 points.",
    emoji: "📋",
    color: "#1A237E",
    bg: "#E8EAF6",
    cta: "Remplir le questionnaire →",
    action: "questionnaire",
  },
  {
    id: 3,
    titre: "Baromètre Collaborateurs",
    desc: "Envoyez des liens anonymes à vos collaborateurs pour mesurer leur sentiment d'inclusion.",
    emoji: "📊",
    color: "#00695C",
    bg: "#E0F2F1",
    cta: "Lancer le baromètre →",
    action: "barometre",
  },
  {
    id: 4,
    titre: "Auto-diagnostic Managers",
    desc: "Invitez vos managers à évaluer leurs pratiques managériales inclusives.",
    emoji: "🧭",
    color: "#2E7D32",
    bg: "#E8F5E9",
    cta: "Inviter les managers →",
    action: "managers",
  },
  {
    id: 5,
    titre: "Premier Rapport PDF",
    desc: "Générez votre rapport GIS complet — exécutif ou analytique — prêt à partager.",
    emoji: "📄",
    color: "#4A148C",
    bg: "#F3E5F5",
    cta: "Générer mon rapport →",
    action: "rapport",
  },
];

export default function OnboardingGuide({ score, socle, statsCollab, sessionId, onNavigate }: OnboardingGuideProps) {
  const [visible, setVisible] = useState(true);
  const [reduit, setReduit] = useState(false);
  const [etapeActive, setEtapeActive] = useState(1);

  // Calculer les étapes complétées
  const etapesCompletees = {
    1: !!socle,
    2: !!score,
    3: (statsCollab?.utilises ?? 0) >= 1,
    4: false, // On pourrait vérifier via l'API managers
    5: !!score, // Disponible dès qu'il y a un score
  } as Record<number, boolean>;

  const nbCompletes = Object.values(etapesCompletees).filter(Boolean).length;
  const progression = Math.round((nbCompletes / ETAPES.length) * 100);
  const prochaine = ETAPES.find(e => !etapesCompletees[e.id]);

  // Masquer si tout est complété
  useEffect(() => {
    if (nbCompletes === ETAPES.length) {
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [nbCompletes]);

  // Restaurer depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem("haki_onboarding_reduit");
    if (stored === "1") setReduit(true);
  }, []);

  function toggleReduit() {
    const newVal = !reduit;
    setReduit(newVal);
    localStorage.setItem("haki_onboarding_reduit", newVal ? "1" : "0");
  }

  function handleCTA(action: string) {
    if (!sessionId) return;
    switch(action) {
      case "socle":        onNavigate(`/diagnostic/${sessionId}/socle`); break;
      case "questionnaire": onNavigate(`/diagnostic/${sessionId}/organisation`); break;
      case "barometre":    onNavigate(`/dashboard#barometre`); break;
      case "managers":     onNavigate(`/dashboard#managers`); break;
      case "rapport":      onNavigate(`/dashboard#rapports`); break;
    }
  }

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      width: reduit ? 220 : 320,
      zIndex: 200,
      fontFamily: "system-ui,-apple-system,sans-serif",
      transition: "all .3s ease",
    }}>
      {/* ── Version réduite ── */}
      {reduit ? (
        <div
          onClick={toggleReduit}
          style={{
            background: "#1A237E",
            borderRadius: 12,
            padding: "12px 16px",
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(26,35,126,0.35)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#FFC107",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, flexShrink: 0,
          }}>
            🚀
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Guide de démarrage</div>
            <div style={{ fontSize: 10, color: "#9FA8DA", marginTop: 1 }}>{nbCompletes}/{ETAPES.length} étapes · {progression}%</div>
          </div>
          <div style={{ width: 32, height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
            <div style={{ width: `${progression}%`, height: "100%", background: "#FFC107", transition: "width .4s" }}/>
          </div>
        </div>
      ) : (
        /* ── Version complète ── */
        <div style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 12px 48px rgba(0,0,0,0.18)",
          overflow: "hidden",
          border: "1px solid #E8EAF6",
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #1A237E 0%, #283593 100%)",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
                🚀 Guide de démarrage
              </div>
              <div style={{ fontSize: 10, color: "#9FA8DA" }}>
                {nbCompletes}/{ETAPES.length} étapes complétées
              </div>
            </div>
            {/* Barre de progression */}
            <div style={{ width: 60, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${progression}%`, height: "100%", background: "#FFC107", transition: "width .4s" }}/>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={toggleReduit}
                style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                _
              </button>
              <button
                onClick={() => setVisible(false)}
                style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                ×
              </button>
            </div>
          </div>

          {/* Prochaine étape suggérée */}
          {prochaine && (
            <div style={{
              padding: "10px 14px",
              background: "#FFFDE7",
              borderBottom: "1px solid #FFF9C4",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <span style={{ fontSize: 14 }}>💡</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#F57F17", textTransform: "uppercase" as const, letterSpacing: ".06em" }}>Prochaine étape</div>
                <div style={{ fontSize: 11, color: "#424242", fontWeight: 500 }}>{prochaine.titre}</div>
              </div>
              <button
                onClick={() => handleCTA(prochaine.action)}
                style={{ padding: "5px 10px", background: "#F57F17", color: "#fff", border: "none", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                Go →
              </button>
            </div>
          )}

          {/* Liste des étapes */}
          <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column" as const, gap: 4 }}>
            {ETAPES.map(e => {
              const complete = etapesCompletees[e.id];
              const active = etapeActive === e.id;
              return (
                <div key={e.id}>
                  {/* Ligne étape */}
                  <div
                    onClick={() => setEtapeActive(active ? 0 : e.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 8,
                      cursor: "pointer",
                      background: active ? e.bg : "transparent",
                      transition: "background .1s",
                    }}>
                    {/* Indicateur */}
                    <div style={{
                      width: 22, height: 22,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: complete ? "#2E7D32" : active ? e.color : "#E0E0E0",
                      fontSize: 10, fontWeight: 700, color: "#fff",
                    }}>
                      {complete ? "✓" : e.id}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12, fontWeight: 600,
                        color: complete ? "#2E7D32" : active ? e.color : "#424242",
                        textDecoration: complete ? "line-through" : "none",
                      }}>
                        {e.titre}
                      </div>
                    </div>
                    <span style={{ fontSize: 9, color: "#BDBDBD" }}>{active ? "▲" : "▼"}</span>
                  </div>

                  {/* Détail déplié */}
                  {active && !complete && (
                    <div style={{
                      padding: "6px 10px 10px 42px",
                      background: e.bg,
                      borderRadius: "0 0 8px 8px",
                      marginTop: -4,
                    }}>
                      <div style={{ fontSize: 11, color: "#616161", lineHeight: 1.6, marginBottom: 8 }}>
                        {e.desc}
                      </div>
                      <button
                        onClick={() => handleCTA(e.action)}
                        style={{
                          padding: "6px 14px",
                          background: e.color, color: "#fff",
                          border: "none", borderRadius: 6,
                          fontSize: 11, fontWeight: 700, cursor: "pointer",
                        }}>
                        {e.cta}
                      </button>
                    </div>
                  )}
                  {active && complete && (
                    <div style={{ padding: "6px 10px 10px 42px", background: "#E8F5E9", borderRadius: "0 0 8px 8px", marginTop: -4 }}>
                      <div style={{ fontSize: 11, color: "#2E7D32", fontWeight: 500 }}>✓ Étape complétée</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {nbCompletes === ETAPES.length ? (
            <div style={{ padding: "12px 16px", background: "#E8F5E9", textAlign: "center" as const }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2E7D32" }}>🎉 Félicitations ! Toutes les étapes sont complétées.</div>
            </div>
          ) : (
            <div style={{ padding: "10px 14px", borderTop: "1px solid #F0F0F0", textAlign: "center" as const }}>
              <button
                onClick={() => setVisible(false)}
                style={{ fontSize: 10, color: "#BDBDBD", background: "none", border: "none", cursor: "pointer" }}>
                Masquer le guide
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
