"use client";
// src/app/dashboard/page.tsx
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const DIM_CONFIG = [
  { key:"scoreDim1Genre",   label:"Genre & Égalité + VIH/Sida",     max:38, color:"#1A237E", bg:"#E8EAF6" },
  { key:"scoreDim2Handicap",label:"Handicap + Médecine du travail",  max:26, color:"#00695C", bg:"#E0F2F1" },
  { key:"scoreDim3Multicult",label:"Multiculturalité & Anti-tribalisme",max:25,color:"#E65100",bg:"#FFF3E0" },
  { key:"scoreDim4Intergen", label:"Intergénérationnel + QVT",       max:11, color:"#2E7D32", bg:"#E8F5E9" },
];

const NIVEAUX: Record<number, { label:string; color:string; bg:string }> = {
  1: { label:"Non-conforme",   color:"#B71C1C", bg:"#FFEBEE" },
  2: { label:"Conforme",       color:"#E65100", bg:"#FFF3E0" },
  3: { label:"Consciente",     color:"#F57F17", bg:"#FFFDE7" },
  4: { label:"Engagée",        color:"#00695C", bg:"#E0F2F1" },
  5: { label:"Transformatrice",color:"#1A237E", bg:"#E8EAF6" },
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/sessions")
        .then(r => r.json())
        .then(d => { setSessions(d.sessions ?? []); setLoading(false); });
    }
  }, [status]);

  if (status === "loading" || loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", fontFamily:"system-ui" }}>
      <div style={{ color:"#1A237E", fontSize:16 }}>Chargement...</div>
    </div>
  );

  const latestSession = sessions[0];
  const score = latestSession?.scoreMmiCi;
  const socle = latestSession?.socleDiagnostic;
  const niveau = score ? NIVEAUX[score.niveauMmi] : null;
  const user = session?.user as any;

  return (
    <div style={{ fontFamily:"system-ui, sans-serif", background:"#F5F5F5", minHeight:"100vh" }}>

      {/* Header */}
      <div style={{ background:"#1A237E", padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:20, fontWeight:600, color:"#FFC107", letterSpacing:2 }}>HAKI</span>
          <span style={{ fontSize:12, color:"#9FA8DA" }}>Plateforme DEI · Côte d'Ivoire</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16, fontSize:13, color:"#C5CAE9" }}>
          <span>{user?.organisationNom}</span>
          <span style={{ background:"#283593", padding:"4px 12px", borderRadius:99, fontSize:11, color:"#90CAF9" }}>
            {user?.role?.toUpperCase()}
          </span>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"28px 24px" }}>

        {/* Pas encore de diagnostic */}
        {!latestSession && (
          <div style={{ background:"#fff", borderRadius:12, padding:32, textAlign:"center", border:"2px dashed #E0E0E0" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🚀</div>
            <div style={{ fontSize:18, fontWeight:500, marginBottom:8, color:"#1A237E" }}>Lancer votre premier diagnostic Haki</div>
            <div style={{ fontSize:14, color:"#757575", marginBottom:24 }}>
              Commencez par le diagnostic SOCLE (conformité légale CI), puis passez aux 4 dimensions DEI.
            </div>
            <button
              onClick={() => fetch("/api/sessions", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ organisationId: user?.organisationId, type:"complet" }) }).then(()=> router.refresh())}
              style={{ background:"#1A237E", color:"#fff", border:"none", borderRadius:8, padding:"12px 28px", fontSize:14, fontWeight:500, cursor:"pointer" }}
            >
              Créer un diagnostic
            </button>
          </div>
        )}

        {latestSession && (
          <>
            {/* Synthèse — Score + SOCLE */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>

              {/* Score MMI-CI */}
              <div style={{ background:"#fff", borderRadius:12, padding:28 }}>
                <div style={{ fontSize:11, color:"#9E9E9E", letterSpacing:".05em", marginBottom:14 }}>SCORE MMI-CI GLOBAL</div>
                {score ? (
                  <>
                    <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:12 }}>
                      <span style={{ fontSize:56, fontWeight:500, color:"#1A237E", lineHeight:1 }}>{score.scoreGlobal}</span>
                      <span style={{ fontSize:18, color:"#9E9E9E" }}>/100</span>
                    </div>
                    {niveau && (
                      <span style={{ display:"inline-block", padding:"5px 14px", borderRadius:99, background:niveau.bg, color:niveau.color, fontSize:12, fontWeight:500 }}>
                        Niveau {score.niveauMmi} — {niveau.label}
                      </span>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize:14, color:"#9E9E9E", marginTop:8 }}>
                    Questionnaire en cours — score calculé après soumission complète
                  </div>
                )}
              </div>

              {/* Badge SOCLE */}
              <div style={{ background:"#fff", borderRadius:12, padding:28 }}>
                <div style={{ fontSize:11, color:"#9E9E9E", letterSpacing:".05em", marginBottom:14 }}>BADGE SOCLE — CONFORMITÉ LÉGALE</div>
                {socle ? (
                  <>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                      <span style={{ fontSize:22 }}>
                        {socle.badgeGlobal === "conforme" ? "✅" : socle.badgeGlobal === "en_cours" ? "⏳" : "⚠️"}
                      </span>
                      <span style={{ fontSize:15, fontWeight:500, color: socle.badgeGlobal === "conforme" ? "#2E7D32" : socle.badgeGlobal === "en_cours" ? "#E65100" : "#B71C1C" }}>
                        {socle.badgeGlobal === "conforme" ? "Conforme" : socle.badgeGlobal === "en_cours" ? "En cours de conformité" : "Non conforme"}
                      </span>
                    </div>
                    {Array.isArray(socle.alertes) && (socle.alertes as any[]).slice(0, 2).map((a: any, i: number) => (
                      <div key={i} style={{ display:"flex", gap:8, padding:"8px 10px", borderRadius:6, background: a.niveau === "rouge" ? "#FFEBEE" : "#FFF3E0", marginBottom:6, fontSize:12, color: a.niveau === "rouge" ? "#B71C1C" : "#E65100" }}>
                        <div style={{ width:7, height:7, borderRadius:"50%", background: a.niveau === "rouge" ? "#B71C1C" : "#E65100", flexShrink:0, marginTop:3 }}/>
                        <div><strong>{a.composante}</strong> — {a.message}</div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div style={{ fontSize:14, color:"#9E9E9E" }}>SOCLE non encore évalué</div>
                )}
              </div>
            </div>

            {/* Scores par dimension */}
            {score && (
              <div style={{ background:"#fff", borderRadius:12, padding:24, marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:500, color:"#424242", marginBottom:18 }}>Scores par dimension MMI-CI</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  {DIM_CONFIG.map(dim => {
                    const s = score[dim.key] ?? 0;
                    const pct = Math.round((s / dim.max) * 100);
                    return (
                      <div key={dim.key}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
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

            {/* Actions rapides */}
            <div style={{ background:"#fff", borderRadius:12, padding:24 }}>
              <div style={{ fontSize:13, fontWeight:500, color:"#424242", marginBottom:16 }}>Actions</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <button
                  onClick={() => router.push(`/diagnostic/${latestSession.id}/socle`)}
                  style={{ padding:"9px 18px", background:"#E8EAF6", color:"#1A237E", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer" }}
                >
                  {socle ? "Voir SOCLE" : "Compléter le SOCLE"}
                </button>
                <button
                  onClick={() => router.push(`/diagnostic/${latestSession.id}/organisation`)}
                  style={{ padding:"9px 18px", background:"#1A237E", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer" }}
                >
                  {score ? "Voir le questionnaire" : "Questionnaire ORGANISATION"}
                </button>
                {score && (
                  <button
                    onClick={() => fetch(`/api/sessions/${latestSession.id}/rapports`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ type:"executif" }) })}
                    style={{ padding:"9px 18px", background:"#E0F2F1", color:"#00695C", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer" }}
                  >
                    Générer rapport PDF
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
