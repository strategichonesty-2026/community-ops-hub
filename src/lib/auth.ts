import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

// Better Auth against our own `users` table, same reasoning as
// ProblemSignal's auth.ts: OrgMembership holds a normal foreign key to it
// rather than to a table Better Auth owns exclusively. No global "first
// user is admin" role here on purpose — access is per-organization
// (OrgMembership), not a single platform-wide role, because one login is
// meant to operate many client organizations.
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
  },
});

export type Session = typeof auth.$Infer.Session;
