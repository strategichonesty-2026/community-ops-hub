# Design decisions

## Multi-tenancy is not optional

Every domain table carries `organizationId`, and every page/action reads
or writes through `requireOrgAccess()` (`src/lib/org.ts`), which checks an
`OrgMembership` row before anything else runs. This is deliberate and
should not be "simplified away" later: the business model behind this app
is one codebase serving many client organizations, each customized by
config (niche, tags, terminology) rather than by forking the code. If a
future feature can't be built without giving up per-org scoping, that's a
sign to rethink the feature, not to relax the scoping.

## Access model: OrgMembership, not a global role

There is no site-wide "admin" flag on `User`. Access is per-organization
(`OrgMembership.role`: `OWNER` or `ADMIN`), because the intended operator
of this app manages many client organizations from one login, and each
organization's own staff may eventually get their own `ADMIN` membership
on just their org — never on anyone else's.

## What v1 deliberately does not include

Scoped out of this first slice, in priority order for what to add next:

1. **Dues/donations via Stripe** — payments, one-time + recurring,
   receipts. Needs a Stripe account and webhook handling; not something
   to half-build.
2. **Events & attendance** — create an event, RSVP, mark attendance.
3. **Email/SMS broadcast** — communication to a filtered member segment.
4. **Document storage** — bylaws, minutes, receipts.
5. **A public join/donate page per organization.**
6. **Per-niche field customization** (nonprofit tax-deductible flag,
   church attendance-by-service, HOA unit/violation tracking, etc.) —
   the `Niche` enum on `Organization` exists so this can be added without
   restructuring the schema, but no niche-specific fields exist yet.

This v1 is: auth, multi-tenant organizations, and a member directory
(add / edit status / remove, with free-form tags). That's the smallest
slice that's actually usable and actually proves the multi-tenant model
works end-to-end.
