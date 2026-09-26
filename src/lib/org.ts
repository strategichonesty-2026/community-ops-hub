import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

// The one gate every organization-scoped page/action must go through.
// Multi-tenancy only holds if nothing ever reads or writes a Member (or
// any future org-scoped table) without first proving the signed-in user
// has an OrgMembership row for that organizationId — see /docs/DESIGN.md.
export async function requireOrgAccess(organizationId: string) {
  const session = await requireSession();

  const membership = await prisma.orgMembership.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId } },
  });

  // notFound(), not a "you don't have access" message — an org a user
  // can't see shouldn't confirm it exists either.
  if (!membership) notFound();

  return { session, membership };
}

export async function listMyOrganizations(userId: string) {
  const memberships = await prisma.orgMembership.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { organization: { name: "asc" } },
  });
  return memberships.map((m) => ({ ...m.organization, role: m.role }));
}
