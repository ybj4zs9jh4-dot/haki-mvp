import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "commande_document" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "organisationId" UUID NOT NULL,
        "sessionId" UUID NOT NULL,
        "typeDocument" VARCHAR(50) NOT NULL,
        "niveau" VARCHAR(20) NOT NULL DEFAULT 'standard',
        "taille" VARCHAR(20) NOT NULL,
        "statut" VARCHAR(20) NOT NULL DEFAULT 'en_attente',
        "montantFcfa" INTEGER NOT NULL,
        "contexte" JSONB NOT NULL DEFAULT '{}',
        "documentsUploads" JSONB NOT NULL DEFAULT '[]',
        "urlDocument" VARCHAR(500),
        "notesAdmin" TEXT,
        "notesClient" TEXT,
        "proformaRef" VARCHAR(50),
        "commandeeLe" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "valideeeLe" TIMESTAMPTZ,
        "livraisonPrevue" TIMESTAMPTZ,
        "livreeLe" TIMESTAMPTZ,
        CONSTRAINT "commande_document_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "commande_document_organisationId_fkey" 
          FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE CASCADE,
        CONSTRAINT "commande_document_sessionId_fkey"
          FOREIGN KEY ("sessionId") REFERENCES "session_diagnostic"("id") ON DELETE CASCADE
      );
    `);
    return NextResponse.json({ success: true, message: "Table commande_document créée" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
