// ── Routing resolution unit tests (J5) ────────────────────────
// Tests for the pure resolveDestination() function.
import { describe, it, expect } from "vitest";
import { resolveDestination } from "@/lib/routing";

const makeUser = (id = "user-123") => ({ id });
const makeProfile = (overrides: Record<string, unknown> = {}) => ({
  id: "user-123",
  role: "student",
  onboarded_at: "2024-01-01",
  ...overrides,
});

describe("resolveDestination", () => {
  it("returns /offline when offline", () => {
    expect(resolveDestination({ user: null, profile: null, online: false })).toBe("/offline");
    expect(resolveDestination({ user: makeUser(), profile: makeProfile(), online: false })).toBe("/offline");
  });

  it("returns /student when unauthenticated", () => {
    expect(resolveDestination({ user: null, profile: null, online: true })).toBe("/student");
  });

  it("returns /student with redirect when unauthenticated + deep link", () => {
    const result = resolveDestination({ user: null, profile: null, online: true, deepLink: "/tutor/abc" });
    expect(result).toBe("/student?redirect=%2Ftutor%2Fabc");
  });

  it("returns /choose-role when no profile.role", () => {
    expect(resolveDestination({ user: makeUser(), profile: { id: "user-123" }, online: true })).toBe("/choose-role");
    expect(resolveDestination({ user: makeUser(), profile: { id: "user-123", role: null }, online: true })).toBe("/choose-role");
  });

  it("returns /onboarding/student when student not onboarded", () => {
    const profile = makeProfile({ onboarded_at: null });
    expect(resolveDestination({ user: makeUser(), profile, online: true })).toBe("/onboarding/student");
  });

  it("returns /onboarding/tutor when tutor not onboarded", () => {
    const profile = makeProfile({ role: "tutor", onboarded_at: null });
    expect(resolveDestination({ user: makeUser(), profile, online: true })).toBe("/onboarding/tutor");
  });

  it("returns /discover for fully onboarded student", () => {
    expect(resolveDestination({ user: makeUser(), profile: makeProfile(), online: true })).toBe("/discover");
  });

  it("returns deep link for fully onboarded student with pending route", () => {
    const result = resolveDestination({
      user: makeUser(),
      profile: makeProfile(),
      online: true,
      deepLink: "/tutor/xyz",
    });
    expect(result).toBe("/tutor/xyz");
  });

  it("returns /tutor/requests for fully onboarded tutor", () => {
    const profile = makeProfile({ role: "tutor" });
    expect(resolveDestination({ user: makeUser(), profile, online: true })).toBe("/tutor/requests");
  });

  it("returns deep link for fully onboarded tutor with pending route", () => {
    const profile = makeProfile({ role: "tutor" });
    const result = resolveDestination({
      user: makeUser(),
      profile,
      online: true,
      deepLink: "/tutor/abc",
    });
    expect(result).toBe("/tutor/abc");
  });
});
