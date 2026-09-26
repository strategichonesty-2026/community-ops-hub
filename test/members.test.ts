import { describe, it, expect } from "vitest";
import { parseTags } from "@/lib/members";

describe("parseTags", () => {
  it("splits on commas and trims whitespace", () => {
    expect(parseTags("volunteer,  board member ,donor")).toEqual([
      "volunteer",
      "board member",
      "donor",
    ]);
  });

  it("drops empty entries from stray commas", () => {
    expect(parseTags("volunteer,, ,donor,")).toEqual(["volunteer", "donor"]);
  });

  it("de-duplicates repeated tags", () => {
    expect(parseTags("board member, board member")).toEqual(["board member"]);
  });

  it("returns an empty array for blank input", () => {
    expect(parseTags("")).toEqual([]);
    expect(parseTags("   ")).toEqual([]);
  });
});
