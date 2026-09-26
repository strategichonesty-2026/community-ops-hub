// Money is stored in integer cents everywhere (Payment.amountCents) to
// avoid floating-point drift — these are the only two places a dollar
// string and a cents integer meet.

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

// Returns null for anything that isn't a positive dollar amount, so the
// caller can reject the form submission instead of recording garbage.
export function parseDollarsToCents(input: string): number | null {
  const trimmed = input.trim().replace(/^\$/, "");
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const cents = Math.round(parseFloat(trimmed) * 100);
  return cents > 0 ? cents : null;
}
