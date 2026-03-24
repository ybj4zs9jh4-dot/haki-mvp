import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error:"Non authentifié" }, { status:401 });

  try {
    const user = await prisma.utilisateur.findUnique({
      where: { email: session.user.email! },
      include: {
        organisation: {
          include: {
            sessions: {
              orderBy: { creeLe:"desc" },
              select: { id:true, creeLe:true, statut:true, scoreMmiCi:true },
            }
          }
        }
      }
    });
    if (!user) return NextResponse.json({ error:"Utilisateur introuvable" }, { status:404 });
    return NextResponse.json({ user, organisation: user.organisation });
  } catch (e) {
    return NextResponse.json({ error:"Erreur serveur" }, { status:500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error:"Non authentifié" }, { status:401 });

  try {
    const body = await req.json();
    const user = await prisma.utilisateur.findUnique({ where:{ email: session.user.email! } });
    if (!user) return NextResponse.json({ error:"Utilisateur introuvable" }, { status:404 });

    // Mettre à jour l'utilisateur
    if (body.type === "utilisateur") {
      await prisma.utilisateur.update({
        where: { id: user.id },
        data: {
          ...(body.prenom && { prenom: body.prenom }),
          ...(body.nom && { nom: body.nom }),
          ...(body.role && { role: body.role }),
        }
      });
    }

    // Changer email
    if (body.type === "email") {
      const existe = await prisma.utilisateur.findUnique({ where:{ email: body.email } });
      if (existe && existe.id !== user.id) return NextResponse.json({ error:"Cet email est déjà utilisé." }, { status:400 });
      await prisma.utilisateur.update({ where:{ id: user.id }, data:{ email: body.email } });
    }

    // Changer mot de passe
    if (body.type === "password") {
      const valide = await bcrypt.compare(body.ancienPassword, user.passwordHash);
      if (!valide) return NextResponse.json({ error:"Mot de passe actuel incorrect." }, { status:400 });
      const hash = await bcrypt.hash(body.nouveauPassword, 12);
      await prisma.utilisateur.update({ where:{ id: user.id }, data:{ passwordHash: hash } });
    }

    // Mettre à jour l'organisation
    if (body.type === "organisation") {
      await prisma.organisation.update({
        where: { id: user.organisationId },
        data: {
          ...(body.nom && { nom: body.nom }),
          ...(body.secteur && { secteur: body.secteur }),
          ...(body.taille && { taille: body.taille }),
          ...(body.ville && { ville: body.ville }),
        }
      });
    }

    return NextResponse.json({ ok:true });
  } catch (e) {
    console.error("PATCH profil error:", e);
    return NextResponse.json({ error:"Erreur serveur" }, { status:500 });
  }
}
