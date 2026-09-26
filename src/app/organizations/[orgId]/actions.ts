"use server";

import { revalidatePath } from "next/cache";
import { MemberStatus, PaymentMethod } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrgAccess } from "@/lib/org";
import { parseTags } from "@/lib/members";
import { parseDollarsToCents } from "@/lib/money";

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

  // The UI hides "Remove" once a member has payment history, but the FK
  // (Payment.member onDelete: Restrict) is the real guarantee — this
  // can't silently take payment history down with it even if that check
  // is ever bypassed.
  await prisma.member.delete({
    where: { id: memberId, organizationId },
  });

  revalidatePath(`/organizations/${organizationId}`);
}

export async function recordPayment(organizationId: string, formData: FormData) {
  await requireOrgAccess(organizationId);

  const memberId = String(formData.get("memberId") ?? "");
  const amountCents = parseDollarsToCents(String(formData.get("amount") ?? ""));
  if (!memberId || amountCents === null) return;

  const requestedMethod = String(formData.get("method") ?? "CASH");
  const method = (Object.values(PaymentMethod) as string[]).includes(requestedMethod)
    ? (requestedMethod as PaymentMethod)
    : PaymentMethod.CASH;
  const note = String(formData.get("note") ?? "").trim() || null;

  // Confirms the member actually belongs to this org, not just that some
  // member with this id exists somewhere — the <select> only lists this
  // org's members, but a forged request could name any id.
  const member = await prisma.member.findFirst({
    where: { id: memberId, organizationId },
    select: { id: true },
  });
  if (!member) return;

  await prisma.payment.create({
    data: { organizationId, memberId, amountCents, method, note },
  });

  revalidatePath(`/organizations/${organizationId}`);
}
