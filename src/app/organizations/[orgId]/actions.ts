"use server";

import { revalidatePath } from "next/cache";
import { MemberStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrgAccess } from "@/lib/org";
import { parseTags } from "@/lib/members";

export async function addMember(organizationId: string, formData: FormData) {
  await requireOrgAccess(organizationId);

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const email = String(formData.get("email") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const tags = parseTags(String(formData.get("tags") ?? ""));

  await prisma.member.create({
    data: { organizationId, name, email, phone, tags },
  });

  revalidatePath(`/organizations/${organizationId}`);
}

export async function updateMemberStatus(
  organizationId: string,
  memberId: string,
  status: MemberStatus
) {
  await requireOrgAccess(organizationId);

  await prisma.member.update({
    where: { id: memberId, organizationId },
    data: { status },
  });

  revalidatePath(`/organizations/${organizationId}`);
}

export async function deleteMember(organizationId: string, memberId: string) {
  await requireOrgAccess(organizationId);

  await prisma.member.delete({
    where: { id: memberId, organizationId },
  });

  revalidatePath(`/organizations/${organizationId}`);
}
