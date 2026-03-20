// src/lib/prisma.ts
// Client Prisma singleton — évite les connexions multiples en dev

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.APP_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  });

if (process.env.APP_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
