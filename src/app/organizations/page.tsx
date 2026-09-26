import Link from "next/link";
import { requireSession } from "@/lib/session";
import { listMyOrganizations } from "@/lib/org";
import { createOrganization } from "./actions";

const NICHE_LABEL: Record<string, string> = {
  GENERIC: "Generic",
  NONPROFIT: "Nonprofit",
  CHURCH: "Church",
  HOA: "HOA",
  ASSOCIATION: "Association / union",
  YOUTH_LEAGUE: "Youth league",
};

export default async function OrganizationsPage() {
  const session = await requireSession();
  const organizations = await listMyOrganizations(session.user.id);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">
      <div>
        <h1 className="text-xl font-semibold">Your organizations</h1>
        <p className="text-sm text-neutral-500 mt-1">
          One login, many organizations — each one&apos;s members stay separate.
        </p>
      </div>

      {organizations.length > 0 && (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800">
          {organizations.map((org) => (
            <Link
              key={org.id}
              href={`/organizations/${org.id}`}
              className="flex items-center justify-between px-4 py-3 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              <span className="font-medium">{org.name}</span>
              <span className="text-xs text-neutral-500">
                {NICHE_LABEL[org.niche] ?? org.niche} · {org.role}
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-4">
        <h2 className="text-sm font-medium mb-3">Add an organization</h2>
        <form action={createOrganization} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Riverside Youth League"
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="niche">
              Type
            </label>
            <select
              id="niche"
              name="niche"
              defaultValue="GENERIC"
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            >
              {Object.entries(NICHE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-md bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white text-sm font-medium px-4 py-2"
          >
            Create organization
          </button>
        </form>
      </div>
    </div>
  );
}
