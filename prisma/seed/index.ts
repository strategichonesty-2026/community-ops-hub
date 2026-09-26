import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const DEMO_EMAIL = "demo@communityops.local";
const DEMO_PASSWORD = "CommunityOps-Demo-2026!";

async function ensureDemoUser() {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) return existing;

  // Goes through Better Auth's own sign-up path rather than inserting a
  // User row by hand, so the demo account's password is hashed exactly
  // the way a real sign-up hashes it — no separate seed-only auth path.
  await auth.api.signUpEmail({
    body: { name: "Demo Admin", email: DEMO_EMAIL, password: DEMO_PASSWORD },
  });

  return prisma.user.findUniqueOrThrow({ where: { email: DEMO_EMAIL } });
}

async function ensureOrganization(
  userId: string,
  input: { name: string; slug: string; niche: "NONPROFIT" | "CHURCH" | "HOA" | "YOUTH_LEAGUE" }
) {
  const existing = await prisma.organization.findUnique({ where: { slug: input.slug } });
  if (existing) return existing;

  return prisma.organization.create({
    data: {
      name: input.name,
      slug: input.slug,
      niche: input.niche,
      memberships: { create: { userId, role: "OWNER" } },
    },
  });
}

async function main() {
  const user = await ensureDemoUser();

  const riverside = await ensureOrganization(user.id, {
    name: "Riverside Youth League",
    slug: "riverside-youth-league",
    niche: "YOUTH_LEAGUE",
  });

  const existingMembers = await prisma.member.count({
    where: { organizationId: riverside.id },
  });
  if (existingMembers === 0) {
    await prisma.member.createMany({
      data: [
        {
          organizationId: riverside.id,
          name: "Priya Nair",
          email: "priya@example.com",
          tags: ["board member"],
        },
        {
          organizationId: riverside.id,
          name: "Marcus Webb",
          phone: "555-0142",
          tags: ["volunteer coach"],
        },
        {
          organizationId: riverside.id,
          name: "Dana Ostrowski",
          email: "dana@example.com",
          status: "LAPSED",
        },
      ],
    });
  }

  console.log(`Seeded. Sign in as ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
