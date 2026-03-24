"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  async function handleLogin() {
    if (!password.trim()) { setErreur("Mot de passe requis."); return; }
    setLoading(true); setErreur("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        sessionStorage.setItem("haki_admin_auth", "1");
sessionStorage.setItem("haki_admin_auth_pwd", password);
        router.push("/admin");
      } else {
        setErreur("Mot de passe incorrect.");
      }
    } catch {
      setErreur("Erreur réseau. Réessaie.");
    }
    setLoading(false);
  }

  return (
    <div style={{ fontFamily:"system-ui,-apple-system,sans-serif", background:"#0D0D2B", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:"100%", maxWidth:400, padding:"0 20px" }}>

        {/* Logo */}
        <div style={{ textAlign:"center" as const, marginBottom:40 }}>
          <div style={{ fontSize:32, fontWeight:700, color:"#FFC107", letterSpacing:6, marginBottom:4 }}>HAKI</div>
          <div style={{ fontSize:12, color:"#4A5568", letterSpacing:".15em", textTransform:"uppercase" as const }}>Espace Administration</div>
        </div>

        {/* Card */}
        <div style={{ background:"#1A1A3E", borderRadius:16, padding:32, border:"1px solid #2D2D5E", boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
          <div style={{ fontSize:16, fontWeight:600, color:"#fff", marginBottom:6 }}>Connexion sécurisée</div>
          <div style={{ fontSize:12, color:"#4A5568", marginBottom:24 }}>Accès réservé à l'équipe Haki</div>

          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:11, fontWeight:700, color:"#6B7280", letterSpacing:".08em", textTransform:"uppercase" as const, display:"block", marginBottom:6 }}>
              Mot de passe Admin
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key==="Enter" && handleLogin()}
              placeholder="••••••••••••"
              style={{ width:"100%", padding:"12px 16px", background:"#0D0D2B", border:"1px solid #2D2D5E", borderRadius:8, fontSize:14, color:"#fff", outline:"none", boxSizing:"border-box" as const }}
              autoFocus
            />
          </div>

          {erreur && (
            <div style={{ padding:"8px 12px", background:"rgba(185,28,28,0.2)", border:"1px solid #B91C1C", borderRadius:7, color:"#FCA5A5", fontSize:12, marginBottom:14 }}>
              ⚠️ {erreur}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width:"100%", padding:"13px", background:loading?"#283593":"#1A237E", color:"#FFC107", border:"none", borderRadius:8, fontSize:14, fontWeight:700, cursor:loading?"default":"pointer", transition:"all .15s", letterSpacing:".05em" }}>
            {loading ? "Vérification..." : "Accéder à l'Admin →"}
          </button>
        </div>

        <div style={{ textAlign:"center" as const, marginTop:20, fontSize:11, color:"#2D2D5E" }}>
          Haki · Plateforme DEI Côte d'Ivoire
        </div>
      </div>
    </div>
  );
}
