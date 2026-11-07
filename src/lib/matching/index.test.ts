import { describe, it, expect } from "vitest";
import { matchScholarship } from "./index";
import type { Scholarship, StudentProfile } from "@/types";

const baseProfile: StudentProfile = {
  id: "p1",
  name: "Test",
  educationLevel: "undergrad",
  field: "computer science",
  country: "IN",
  gpa: 3.5,
  gpaScale: "4",
  needLevel: "medium",
  background: ["women"],
  interests: [],
  goals: "",
  createdAt: "",
  updatedAt: "",
};

function sch(overrides: Partial<Scholarship> = {}): Scholarship {
  const now = new Date();
  const dl = new Date(now);
  dl.setDate(dl.getDate() + 30);
  return {
    id: "s1",
    title: "Test Sch",
    provider: "P",
    country: "IN",
    level: ["undergrad"],
    fields: ["computer science"],
    minGpa: 3.0,
    needBased: false,
    meritBased: true,
    type: "merit",
    amount: 1000,
    currency: "USD",
    deadline: dl.toISOString().slice(0, 10),
    effort: { essays: 1, recommendations: 1, hours: 3 },
    requirements: [],
    documents: [],
    description: "",
    tips: [],
    source: "sample",
    officialUrl: "https://example.com",
    tags: [],
    demographics: [],
    createdAt: "",
    ...overrides,
  };
}

describe("matchScholarship", () => {
  it("high score for perfect match", () => {
    const r = matchScholarship(baseProfile, sch());
    expect(r.score).toBeGreaterThanOrEqual(90);
    expect(r.tier).toBe("high");
    expect(r.notEligible).toHaveLength(0);
  });

  it("level mismatch makes ineligible", () => {
    const r = matchScholarship(baseProfile, sch({ level: ["postgrad"] }));
    expect(r.notEligible.some((n) => /postgrad/.test(n))).toBe(true);
    expect(r.score).toBeLessThanOrEqual(80);
  });

  it("field mismatch not eligible", () => {
    const r = matchScholarship(baseProfile, sch({ fields: ["arts"] }));
    expect(r.notEligible.some((n) => n.includes("arts"))).toBe(true);
  });

  it("location mismatch not eligible", () => {
    const r = matchScholarship(baseProfile, sch({ country: "US" }));
    expect(r.notEligible.some((n) => n.includes("US"))).toBe(true);
  });

  it("global location matches", () => {
    const r = matchScholarship(baseProfile, sch({ country: "GLOBAL" }));
    expect(r.whyMatch.some((w) => w.includes("worldwide"))).toBe(true);
  });

  it("missing GPA triggers needs attention", () => {
    const p = { ...baseProfile, gpa: undefined, gpaScale: "none" as const };
    const r = matchScholarship(p, sch());
    expect(r.needsAttention.some((n) => n.includes("GPA"))).toBe(true);
  });

  it("low GPA not eligible", () => {
    const p = { ...baseProfile, gpa: 2.5 };
    const r = matchScholarship(p, sch({ minGpa: 3.0 }));
    expect(r.notEligible.some((n) => n.includes("3") && n.includes("2.5"))).toBe(true);
  });

  it("GPA boundary exact qualifies", () => {
    const p = { ...baseProfile, gpa: 3.0 };
    const r = matchScholarship(p, sch({ minGpa: 3.0 }));
    expect(r.whyMatch.some((w) => w.includes("meets"))).toBe(true);
  });

  it("percentage GPA converted", () => {
    const p = { ...baseProfile, gpa: 87.5, gpaScale: "percentage" as const };
    const r = matchScholarship(p, sch({ minGpa: 3.0 }));
    expect(r.whyMatch.some((w) => w.includes("meets"))).toBe(true);
  });

  it("expired deadline not eligible", () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);
    const r = matchScholarship(baseProfile, sch({ deadline: past.toISOString().slice(0, 10) }));
    expect(r.notEligible.some((n) => n.includes("deadline"))).toBe(true);
  });

  it("no minGpa means no GPA requirement", () => {
    const r = matchScholarship(baseProfile, sch({ minGpa: undefined }));
    expect(r.whyMatch.some((w) => w.includes("No minimum GPA"))).toBe(true);
  });

  it("need-based with low need attention", () => {
    const p = { ...baseProfile, needLevel: "none" as const };
    const r = matchScholarship(p, sch({ needBased: true }));
    expect(r.needsAttention.some((n) => n.includes("need-based"))).toBe(true);
  });

  it("demographics mismatch attention", () => {
    const p = { ...baseProfile, background: [] };
    const r = matchScholarship(p, sch({ demographics: ["first-gen"] }));
    expect(r.needsAttention.some((n) => n.includes("first-gen"))).toBe(true);
  });

  it("demographics match why", () => {
    const r = matchScholarship(baseProfile, sch({ demographics: ["women"] }));
    expect(r.whyMatch.some((w) => w.includes("women"))).toBe(true);
  });

  it("any field matches", () => {
    const r = matchScholarship(baseProfile, sch({ fields: ["any"] }));
    expect(r.whyMatch.some((w) => w.includes("Open to all fields"))).toBe(true);
  });

  it("deadline soon needs attention", () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 3);
    const r = matchScholarship(baseProfile, sch({ deadline: soon.toISOString().slice(0, 10) }));
    expect(r.needsAttention.some((n) => n.includes("very soon"))).toBe(true);
  });

  it("fields multiple: field included qualifies", () => {
    const r = matchScholarship(baseProfile, sch({ fields: ["arts", "computer science"] }));
    expect(r.whyMatch.some((w) => w.includes("supported"))).toBe(true);
  });

  it("score is 0-100", () => {
    const r = matchScholarship(baseProfile, sch());
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });
});
