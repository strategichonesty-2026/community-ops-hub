import Link from "next/link";
import { MemberStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrgAccess } from "@/lib/org";
import { formatCents } from "@/lib/money";
import { MemberStatusSelect } from "@/components/MemberStatusSelect";
import { addMember, updateMemberStatus, deleteMember, recordPayment } from "./actions";

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  CASH: "Cash",
  CHECK: "Check",
  ONLINE: "Online",
  OTHER: "Other",
};

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const { membership } = await requireOrgAccess(orgId);

  const [organization, members, payments] = await Promise.all([
    prisma.organization.findUniqueOrThrow({ where: { id: orgId } }),
    prisma.member.findMany({
      where: { organizationId: orgId },
      orderBy: { name: "asc" },
      include: { _count: { select: { payments: true } } },
    }),
    prisma.payment.findMany({
      where: { organizationId: orgId },
      orderBy: { paidAt: "desc" },
      take: 50,
      include: { member: { select: { name: true } } },
    }),
  ]);

  const addMemberWithOrg = addMember.bind(null, orgId);
  const recordPaymentForOrg = recordPayment.bind(null, orgId);
  const totalCollectedCents = payments.reduce((sum, p) => sum + p.amountCents, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      <div>
        <Link href="/organizations" className="text-sm text-neutral-500 hover:underline">
          ← Your organizations
        </Link>
        <h1 className="text-xl font-semibold mt-2">{organization.name}</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {members.length} member{members.length === 1 ? "" : "s"} · your role: {membership.role}
        </p>
      </div>

      <section className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-4">
        <h2 className="text-sm font-medium mb-3">Add a member</h2>
        <form action={addMemberWithOrg} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            name="name"
            type="text"
            required
            placeholder="Name"
            className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            name="email"
            type="email"
            placeholder="Email (optional)"
            className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
          <input
            name="phone"
            type="tel"
            placeholder="Phone (optional)"
            className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
          <input
            name="tags"
            type="text"
            placeholder="Tags, comma separated (optional)"
            className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm sm:col-span-2"
          />
          <button
            type="submit"
            className="rounded-md bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white text-sm font-medium px-4 py-2 sm:col-span-2 sm:w-fit"
          >
            Add member
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
          Members
        </h2>
        {members.length === 0 ? (
          <p className="text-sm text-neutral-500">No members yet — add the first one above.</p>
        ) : (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800">
            {members.map((member) => {
              const updateStatusForMember = updateMemberStatus.bind(null, orgId, member.id);
              const deleteMemberAction = deleteMember.bind(null, orgId, member.id);
              const hasPayments = member._count.payments > 0;
              return (
                <div key={member.id} className="px-4 py-3 text-sm flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{member.name}</p>
                    <p className="text-xs text-neutral-500 truncate">
                      {[member.email, member.phone].filter(Boolean).join(" · ") || "No contact info"}
                    </p>
                    {member.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {member.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] rounded-full border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 text-neutral-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <MemberStatusSelect
                    status={member.status}
                    action={async (formData: FormData) => {
                      "use server";
                      const status = String(formData.get("status")) as MemberStatus;
                      await updateStatusForMember(status);
                    }}
                  />
                  {hasPayments ? (
                    <span
                      className="text-xs text-neutral-400 shrink-0"
                      title="Members with recorded payments can't be removed — their payment history has to stay."
                    >
                      Has payments
                    </span>
                  ) : (
                    <form action={deleteMemberAction}>
                      <button type="submit" className="text-xs text-red-600 hover:underline shrink-0">
                        Remove
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
          Dues &amp; Payments
        </h2>
        <p className="text-sm mb-4">
          Total collected: <span className="font-medium">{formatCents(totalCollectedCents)}</span>
        </p>

        {members.length > 0 && (
          <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-4 mb-4">
            <h3 className="text-sm font-medium mb-3">Record a payment</h3>
            <p className="text-xs text-neutral-500 mb-3">
              However the money actually came in — cash, check, Venmo, Zelle — record it here.
              This is a ledger, not a payment processor.
            </p>
            <form
              action={recordPaymentForOrg}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <select
                name="memberId"
                required
                defaultValue=""
                className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm sm:col-span-2"
              >
                <option value="" disabled>
                  Select a member
                </option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <input
                name="amount"
                type="text"
                inputMode="decimal"
                required
                placeholder="Amount (e.g. 25.00)"
                className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              />
              <select
                name="method"
                defaultValue="CASH"
                className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              >
                {Object.entries(PAYMENT_METHOD_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                name="note"
                type="text"
                placeholder="Note (optional)"
                className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm sm:col-span-2"
              />
              <button
                type="submit"
                className="rounded-md bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white text-sm font-medium px-4 py-2 sm:col-span-2 sm:w-fit"
              >
                Record payment
              </button>
            </form>
          </div>
        )}

        {payments.length === 0 ? (
          <p className="text-sm text-neutral-500">No payments recorded yet.</p>
        ) : (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800">
            {payments.map((payment) => (
              <div key={payment.id} className="px-4 py-2.5 text-sm flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-medium">{payment.member.name}</span>{" "}
                  <span className="text-neutral-500">
                    · {PAYMENT_METHOD_LABEL[payment.method]} ·{" "}
                    {payment.paidAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {payment.note && <p className="text-xs text-neutral-500 truncate">{payment.note}</p>}
                </div>
                <span className="shrink-0 tabular-nums font-medium">
                  {formatCents(payment.amountCents)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
