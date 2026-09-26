import Link from "next/link";
import { MemberStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrgAccess } from "@/lib/org";
import { MemberStatusSelect } from "@/components/MemberStatusSelect";
import { addMember, updateMemberStatus, deleteMember } from "./actions";

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const { membership } = await requireOrgAccess(orgId);

  const [organization, members] = await Promise.all([
    prisma.organization.findUniqueOrThrow({ where: { id: orgId } }),
    prisma.member.findMany({ where: { organizationId: orgId }, orderBy: { name: "asc" } }),
  ]);

  const addMemberWithOrg = addMember.bind(null, orgId);

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
                  <form action={deleteMemberAction}>
                    <button
                      type="submit"
                      className="text-xs text-red-600 hover:underline shrink-0"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
