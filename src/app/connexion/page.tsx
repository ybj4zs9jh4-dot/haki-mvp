"use client";
// src/app/connexion/page.tsx
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email, password, redirect: false,
      });
      if (result?.error) {
        setError("Email ou mot de passe incorrect.");
      } else {
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight:"100vh", background:"#1A237E", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui, sans-serif" }}>
      <div style={{ background:"#fff", borderRadius:16, padding:"48px 40px", width:"100%", maxWidth:420, boxShadow:"0 24px 80px rgba(0,0,0,0.3)" }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:36, fontWeight:600, color:"#1A237E", letterSpacing:4 }}>HAKI</div>
          <div style={{ fontSize:13, color:"#757575", marginTop:4 }}>Plateforme DEI · Côte d'Ivoire</div>
        </div>

        {error && (
          <div style={{ background:"#FFEBEE", color:"#B71C1C", padding:"10px 14px", borderRadius:8, fontSize:13, marginBottom:20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:18 }}>
            <label style={{ display:"block", fontSize:13, fontWeight:500, color:"#424242", marginBottom:6 }}>
              Email professionnel
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="drh@votre-entreprise.ci"
              style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #E0E0E0", borderRadius:8, fontSize:14, outline:"none", boxSizing:"border-box" }}
            />
          </div>

          <div style={{ marginBottom:24 }}>
            <label style={{ display:"block", fontSize:13, fontWeight:500, color:"#424242", marginBottom:6 }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #E0E0E0", borderRadius:8, fontSize:14, outline:"none", boxSizing:"border-box" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width:"100%", background: loading ? "#9FA8DA" : "#1A237E", color:"#fff", border:"none", borderRadius:8, padding:"12px 0", fontSize:15, fontWeight:500, cursor: loading ? "default" : "pointer" }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div style={{ marginTop:24, padding:"14px 16px", background:"#F5F5F5", borderRadius:8, fontSize:12, color:"#757575" }}>
          <div style={{ fontWeight:500, marginBottom:4, color:"#424242" }}>Comptes de démonstration</div>
          <div>DRH : drh@banqueatlantique.ci</div>
          <div>DG : dg@banqueatlantique.ci</div>
          <div style={{ marginTop:4, color:"#9E9E9E" }}>Mot de passe : Drh@Banque2026!</div>
        </div>

        <div style={{ textAlign:"center", marginTop:20, fontSize:11, color:"#BDBDBD" }}>
          contact@haki.ci · www.haki.ci · Abidjan, CI
        </div>
      </div>
    </div>
  );
}
