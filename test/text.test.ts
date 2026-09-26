import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/text";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Riverside Youth League")).toBe("riverside-youth-league");
  });

  it("strips punctuation and collapses whitespace runs", () => {
    expect(slugify("St. Mary's  Church!")).toBe("st-mary-s-church");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  -Oakview HOA- ")).toBe("oakview-hoa");
  });
});
