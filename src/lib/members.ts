export const MEMBER_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  LAPSED: "Lapsed",
};

// Forms submit tags as one comma-separated input, not a repeated field —
// simplest thing that works for a handful of free-form tags per member.
export function parseTags(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    )
  );
}
