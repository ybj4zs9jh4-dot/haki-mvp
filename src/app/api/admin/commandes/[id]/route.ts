import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = req.headers.get("x-admin-auth");
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error:"Non autorisé" }, { status:401 });
  }
  try {
    const body = await req.json();
    const updated = await prisma.commandeDocument.update({
      where: { id: params.id },
      data: {
        ...(body.statut && { statut: body.statut }),
        ...(body.notesAdmin !== undefined && { notesAdmin: body.notesAdmin }),
        ...(body.montantFcfa && { montantFcfa: body.montantFcfa }),
        ...(body.statut === "livre" && { livreeLe: new Date() }),
        ...(body.statut === "validee" && { valideeeLe: new Date() }),
      },
    });
    return NextResponse.json({ ok:true, commande: updated });
  } catch (e) {
    console.error("PATCH commande error:", e);
    return NextResponse.json({ error:"Erreur serveur" }, { status:500 });
  }
}
