import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.utilisateur.findUnique({
          where: { email: credentials.email },
          include: { organisation: true },
        });
        if (!user || !user.passwordHash || !user.actif) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: `${user.prenom ?? ""} ${user.nom ?? ""}`.trim(),
          role: user.role,
          organisationId: user.organisationId,
          organisationNom: user.organisation.nom,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.organisationId = (user as any).organisationId;
        token.organisationNom = (user as any).organisationNom;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      (session.user as any).role = token.role;
      (session.user as any).organisationId = token.organisationId;
      (session.user as any).organisationNom = token.organisationNom;
      return session;
    },
  },
  pages: { signIn: "/connexion" },
};

export default authOptions;
