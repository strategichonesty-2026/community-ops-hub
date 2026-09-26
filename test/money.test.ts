import { describe, it, expect } from "vitest";
import { formatCents, parseDollarsToCents } from "@/lib/money";

describe("formatCents", () => {
  it("formats whole dollars", () => {
    expect(formatCents(2500)).toBe("$25.00");
  });

  it("formats cents correctly", () => {
    expect(formatCents(105)).toBe("$1.05");
  });

  it("formats zero", () => {
    expect(formatCents(0)).toBe("$0.00");
  });
});

describe("parseDollarsToCents", () => {
  it("parses a plain dollar amount", () => {
    expect(parseDollarsToCents("25")).toBe(2500);
  });

  it("parses cents", () => {
    expect(parseDollarsToCents("25.50")).toBe(2550);
  });

  it("strips a leading dollar sign", () => {
    expect(parseDollarsToCents("$25.50")).toBe(2550);
  });

  it("rejects zero and negative amounts", () => {
    expect(parseDollarsToCents("0")).toBeNull();
    expect(parseDollarsToCents("-5")).toBeNull();
  });

  it("rejects garbage input", () => {
    expect(parseDollarsToCents("twenty")).toBeNull();
    expect(parseDollarsToCents("")).toBeNull();
    expect(parseDollarsToCents("25.999")).toBeNull();
  });
});
