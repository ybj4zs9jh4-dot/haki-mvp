import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function envoyerLienBarometre(
  email: string,
  lienUrl: string,
  orgNom: string
): Promise<boolean> {
  try {
    await resend.emails.send({
      from: "Haki DEI <onboarding@resend.dev>",
      to: email,
      subject: `${orgNom} — Votre lien baromètre d'inclusion Haki`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;">
          <div style="background:#1A237E;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
            <div style="font-size:28px;font-weight:600;color:#FFC107;letter-spacing:4px;">HAKI</div>
            <div style="font-size:13px;color:#9FA8DA;margin-top:4px;">Plateforme DEI · Côte d'Ivoire</div>
          </div>
          <div style="background:#fff;border:1px solid #E0E0E0;border-top:none;border-radius:0 0 12px 12px;padding:32px 24px;">
            <div style="font-size:16px;font-weight:500;color:#212121;margin-bottom:16px;">Bonjour,</div>
            <div style="font-size:14px;color:#424242;line-height:1.7;margin-bottom:24px;">
              <strong>${orgNom}</strong> vous invite à participer au baromètre d'inclusion Haki.<br><br>
              Ce questionnaire anonyme et confidentiel mesure votre sentiment d'inclusion au travail. Il prend environ <strong>10 à 15 minutes</strong>.
            </div>
            <div style="background:#E8EAF6;border-radius:8px;padding:16px;margin-bottom:24px;font-size:13px;color:#1A237E;">
              ✓ Vos réponses sont strictement anonymes<br>
              ✓ Aucune donnée individuelle ne sera transmise à votre employeur<br>
              ✓ Les résultats sont agrégés (minimum 5 répondants)<br>
              ✓ Ce lien est à usage unique
            </div>
            <div style="text-align:center;margin-bottom:24px;">
              <a href="${lienUrl}" style="display:inline-block;background:#1A237E;color:#fff;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:500;text-decoration:none;">
                Accéder au baromètre →
              </a>
            </div>
            <div style="font-size:11px;color:#9E9E9E;line-height:1.6;">
              Ce lien expire dans 30 jours.<br>
              Lien direct : <a href="${lienUrl}" style="color:#1A237E;">${lienUrl}</a>
            </div>
          </div>
          <div style="text-align:center;margin-top:16px;font-size:11px;color:#BDBDBD;">
            Haki · Plateforme DEI Côte d'Ivoire · contact@haki.ci
          </div>
        </div>
      `,
    });
    return true;
  } catch (e) {
    console.error("Erreur envoi email barometre:", e);
    return false;
  }
}

export async function envoyerLienManager(
  email: string,
  lienUrl: string,
  orgNom: string
): Promise<boolean> {
  try {
    await resend.emails.send({
      from: "Haki DEI <onboarding@resend.dev>",
      to: email,
      subject: `${orgNom} — Votre auto-diagnostic Manager Inclusif CI`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;">
          <div style="background:#E65100;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
            <div style="font-size:28px;font-weight:600;color:#FFC107;letter-spacing:4px;">HAKI</div>
            <div style="font-size:13px;color:#FFCCBC;margin-top:4px;">Auto-diagnostic Manager Inclusif CI</div>
          </div>
          <div style="background:#fff;border:1px solid #E0E0E0;border-top:none;border-radius:0 0 12px 12px;padding:32px 24px;">
            <div style="font-size:16px;font-weight:500;color:#212121;margin-bottom:16px;">Bonjour,</div>
            <div style="font-size:14px;color:#424242;line-height:1.7;margin-bottom:24px;">
              <strong>${orgNom}</strong> vous invite à réaliser votre auto-diagnostic de management inclusif.<br><br>
              Ce questionnaire personnel et <strong>strictement confidentiel</strong> évalue vos pratiques managériales inclusives. Il prend environ <strong>12 minutes</strong> · 28 questions · 3 modules.
            </div>
            <div style="background:#FFF3E0;border-radius:8px;padding:16px;margin-bottom:24px;font-size:13px;color:#E65100;">
              🔒 Vos réponses et votre score sont strictement personnels<br>
              🔒 Ils ne seront jamais transmis à votre organisation<br>
              🔒 Seul vous pouvez accéder à vos résultats via ce lien
            </div>
            <div style="text-align:center;margin-bottom:24px;">
              <a href="${lienUrl}" style="display:inline-block;background:#E65100;color:#fff;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:500;text-decoration:none;">
                Commencer mon auto-diagnostic →
              </a>
            </div>
            <div style="font-size:11px;color:#9E9E9E;line-height:1.6;">
              Ce lien est personnel et expire dans 30 jours.<br>
              Lien direct : <a href="${lienUrl}" style="color:#E65100;">${lienUrl}</a>
            </div>
          </div>
          <div style="text-align:center;margin-top:16px;font-size:11px;color:#BDBDBD;">
            Haki · Plateforme DEI Côte d'Ivoire · contact@haki.ci
          </div>
        </div>
      `,
    });
    return true;
  } catch (e) {
    console.error("Erreur envoi email manager:", e);
    return false;
  }
}
