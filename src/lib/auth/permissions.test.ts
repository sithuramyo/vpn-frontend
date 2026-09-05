import { describe, expect, it } from "vitest";

import { canWrite, isAdmin } from "@/lib/auth/permissions";

describe("canWrite", () => {
  it("allows ADMIN and OPERATOR", () => {
    expect(canWrite("ADMIN")).toBe(true);
    expect(canWrite("OPERATOR")).toBe(true);
  });

  it("denies VIEWER and undefined", () => {
    expect(canWrite("VIEWER")).toBe(false);
    expect(canWrite(undefined)).toBe(false);
  });
});

describe("isAdmin", () => {
  it("is true only for ADMIN", () => {
    expect(isAdmin("ADMIN")).toBe(true);
    expect(isAdmin("OPERATOR")).toBe(false);
    expect(isAdmin("VIEWER")).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });
});
