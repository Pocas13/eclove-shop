import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/entrar",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;

        const passwordValida = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!passwordValida) return null;

        if (user.role !== "ADMIN" && user.profissionalEstado !== "APROVADO") {
          throw new Error("A tua conta ainda está a aguardar validação pela Eclove.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.nome,
          role: user.role,
          profissionalEstado: user.profissionalEstado,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
        token.profissionalEstado = (user as any).profissionalEstado;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).profissionalEstado = token.profissionalEstado;
      }
      return session;
    },
  },
};
