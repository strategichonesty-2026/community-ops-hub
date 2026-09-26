"use server";

import { redirect } from "next/navigation";
import { Niche } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { slugify } from "@/lib/text";

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "organization";
  let candidate = base;
  let suffix = 2;
  while (await prisma.organization.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function createOrganization(formData: FormData) {
  const session = await requireSession();
  const name = String(formData.get("name") ?? "").trim();
  const requestedNiche = String(formData.get("niche") ?? "GENERIC");
  const niche = (Object.values(Niche) as string[]).includes(requestedNiche)
    ? (requestedNiche as Niche)
    : Niche.GENERIC;
  if (!name) return;

  const slug = await uniqueSlug(name);

  const organization = await prisma.organization.create({
    data: {
      name,
      slug,
      niche,
      memberships: {
        create: { userId: session.user.id, role: "OWNER" },
      },
    },
  });

  redirect(`/organizations/${organization.id}`);
}
