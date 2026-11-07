import type { Scholarship, StudentProfile, MatchResult, MatchBreakdown } from "@/types";

function normalizeGpa(profile: StudentProfile): number | null {
  if (profile.gpa === undefined || profile.gpa === null) return null;
  if (profile.gpaScale === "percentage") return (profile.gpa / 100) * 4;
  if (profile.gpaScale === "4") return profile.gpa;
  return null;
}

function countryAlias(c: string): string {
  const map: Record<string, string> = { IN: "India", US: "United States", UK: "United Kingdom", GLOBAL: "GLOBAL" };
  return map[c] ?? c;
}

function getMinGpa(s: Scholarship): number | null {
  if (s.minGpa != null) return s.minGpa;
  if (s.eligibility?.minGpaPercent != null) return s.eligibility.minGpaPercent / 25;
  return null;
}

function daysUntil(isoDate: string): number {
  const d = new Date(isoDate + "T00:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function matchScholarship(profile: StudentProfile, scholarship: Scholarship): MatchResult {
  const whyMatch: string[] = [];
  const needsAttention: string[] = [];
  const notEligible: string[] = [];
  const breakdown: MatchBreakdown[] = [];

  const weights = [20, 15, 10, 15, 15, 10, 15];
  const scores: number[] = [];
  const known: boolean[] = [];
  let nullCount = 0;

  // 1. Level
  {
    const levels = scholarship.level ?? [];
    const knownLevel = levels.length > 0;
    if (!knownLevel) {
      nullCount++;
      needsAttention.push("We couldn't confirm the eligible education levels. Check the official site.");
      scores.push(0); known.push(false);
      breakdown.push({ criterion: "Education level", score: 0, max: 1, note: "Unconfirmed.", status: "attention" });
    } else {
      const ok = levels.includes(profile.educationLevel) || levels.length === 0;
      // map real levels (school/undergraduate) to our enum loosely
      const ok2 = ok || levels.some((l) => l.toLowerCase().includes(profile.educationLevel.replace("_", "")));
      const match = ok || ok2;
      scores.push(match ? 1 : 0); known.push(true);
      if (match) {
        whyMatch.push(`Your education level (${profile.educationLevel.replace("_", " ")}) is eligible.`);
      } else {
        notEligible.push(`This scholarship is for ${levels.join(", ").replace(/_/g, " ")} students; you're ${profile.educationLevel.replace("_", " ")}.`);
      }
      breakdown.push({ criterion: "Education level", score: match ? 1 : 0, max: 1, note: match ? "Level matches." : "Level mismatch.", status: match ? "match" : "ineligible" });
    }
  }

  // 2. Field
  {
    const fields = scholarship.fields ?? [];
    const knownField = fields.length > 0;
    if (!knownField) {
      nullCount++;
      needsAttention.push("We couldn't confirm the eligible fields. Check the official site.");
      scores.push(0); known.push(false);
      breakdown.push({ criterion: "Field of study", score: 0, max: 1, note: "Unconfirmed.", status: "attention" });
    } else {
      const any = fields.some((f) => f.toLowerCase() === "any" || f.toLowerCase().includes("varies"));
      const fieldLower = (profile.field || "").toLowerCase();
      const fieldMatch = any || fields.some((f) => fieldLower.includes(f.toLowerCase()) || f.toLowerCase().includes(fieldLower));
      scores.push(fieldMatch ? 1 : 0); known.push(true);
      if (fieldMatch) {
        whyMatch.push(any ? "Open to all fields of study." : `Your field (${profile.field}) is supported.`);
      } else {
        notEligible.push(`This scholarship is for ${fields.join(", ")}; your field is ${profile.field || "not set"}.`);
      }
      breakdown.push({ criterion: "Field of study", score: fieldMatch ? 1 : 0, max: 1, note: fieldMatch ? "Field matches." : "Field mismatch.", status: fieldMatch ? "match" : "ineligible" });
    }
  }

  // 3. Location
  {
    const country = scholarship.country ?? "";
    const knownLoc = country.length > 0;
    if (!knownLoc) {
      nullCount++;
      needsAttention.push("We couldn't confirm the eligible location. Check the official site.");
      scores.push(0); known.push(false);
      breakdown.push({ criterion: "Location", score: 0, max: 1, note: "Unconfirmed.", status: "attention" });
    } else {
      const pa = countryAlias(profile.country);
      const ok = country === "GLOBAL" || country === "Europe" || country === profile.country || country === pa || scholarship.applicantCountry === pa || scholarship.studyCountry === pa;
      scores.push(ok ? 1 : 0); known.push(true);
      if (ok) {
        whyMatch.push(country === "GLOBAL" || country === "Europe" ? "Open to students worldwide." : `Available in your country (${profile.country}).`);
      } else {
        notEligible.push(`This scholarship is for ${country} residents; you're in ${profile.country}.`);
      }
      breakdown.push({ criterion: "Location", score: ok ? 1 : 0, max: 1, note: ok ? "Location matches." : "Location mismatch.", status: ok ? "match" : "ineligible" });
    }
  }

  // 4. GPA
  {
    const minGpa = getMinGpa(scholarship);
    const gpa = normalizeGpa(profile);
    if (minGpa == null) {
      if (scholarship.isReal) {
        nullCount++;
        needsAttention.push("We couldn't confirm the GPA requirement. Check the official site.");
        scores.push(0); known.push(false);
        breakdown.push({ criterion: "GPA", score: 0, max: 1, note: "Unconfirmed.", status: "attention" });
      } else {
        scores.push(1); known.push(true);
        whyMatch.push("No minimum GPA required.");
        breakdown.push({ criterion: "GPA", score: 1, max: 1, note: "No GPA requirement.", status: "match" });
      }
    } else if (gpa === null) {
      scores.push(0); known.push(true);
      needsAttention.push(`A GPA of ${minGpa} is required, but you haven't added your GPA yet.`);
      breakdown.push({ criterion: "GPA", score: 0, max: 1, note: "GPA not provided.", status: "attention" });
    } else if (gpa >= minGpa) {
      scores.push(1); known.push(true);
      whyMatch.push(`Your GPA (${gpa.toFixed(2)}) meets the ${minGpa} requirement.`);
      breakdown.push({ criterion: "GPA", score: 1, max: 1, note: `Your GPA ${gpa.toFixed(2)} meets ${minGpa}.`, status: "match" });
    } else {
      scores.push(0); known.push(true);
      notEligible.push(`You need a ${minGpa} GPA, and you're at ${gpa.toFixed(2)}.`);
      breakdown.push({ criterion: "GPA", score: 0, max: 1, note: `Your GPA ${gpa.toFixed(2)} below ${minGpa}.`, status: "ineligible" });
    }
  }

  // 5. Need
  {
    const needBased = scholarship.needBased;
    if (needBased === undefined || needBased === null) {
      nullCount++;
      needsAttention.push("We couldn't confirm the financial-need requirement. Check the official site.");
      scores.push(0); known.push(false);
      breakdown.push({ criterion: "Financial need", score: 0, max: 1, note: "Unconfirmed.", status: "attention" });
    } else if (needBased) {
      const highNeed = profile.needLevel === "high" || profile.needLevel === "medium";
      scores.push(highNeed ? 1 : 0); known.push(true);
      if (highNeed) {
        whyMatch.push("Your financial need level qualifies for this need-based award.");
      } else {
        needsAttention.push("This is need-based; your need level may be too low to qualify.");
      }
      breakdown.push({ criterion: "Financial need", score: highNeed ? 1 : 0, max: 1, note: highNeed ? "Need level qualifies." : "Need level too low.", status: highNeed ? "match" : "attention" });
    } else {
      scores.push(1); known.push(true);
      breakdown.push({ criterion: "Financial need", score: 1, max: 1, note: "Not need-based.", status: "match" });
    }
  }

  // 6. Demographics
  {
    const demos = scholarship.demographics ?? [];
    // if demographics unknown (null-ish), treat as open to all
    const hasDemos = Array.isArray(demos);
    if (!hasDemos) {
      nullCount++;
      needsAttention.push("We couldn't confirm the target background. Check the official site.");
      scores.push(0); known.push(false);
      breakdown.push({ criterion: "Background", score: 0, max: 1, note: "Unconfirmed.", status: "attention" });
    } else if (demos.length > 0) {
      const match = demos.some((d) => profile.background.map((b) => b.toLowerCase()).includes(d.toLowerCase()));
      scores.push(match ? 1 : 0); known.push(true);
      if (match) {
        whyMatch.push(`Your background matches: ${demos.join(", ")}.`);
      } else {
        needsAttention.push(`This targets ${demos.join(", ")} applicants; not listed in your profile.`);
      }
      breakdown.push({ criterion: "Background", score: match ? 1 : 0, max: 1, note: match ? "Background matches." : "Background not matched.", status: match ? "match" : "attention" });
    } else {
      scores.push(1); known.push(true);
      breakdown.push({ criterion: "Background", score: 1, max: 1, note: "Open to all backgrounds.", status: "match" });
    }
  }

  // 7. Deadline feasibility
  {
    const dl = scholarship.deadline ?? scholarship.lastKnownDeadline;
    if (!dl) {
      nullCount++;
      needsAttention.push("We couldn't confirm the deadline. Check the official site.");
      scores.push(0); known.push(false);
      breakdown.push({ criterion: "Deadline", score: 0, max: 1, note: "Unconfirmed.", status: "attention" });
    } else {
      const days = daysUntil(dl);
      if (days < 0) {
        scores.push(0); known.push(true);
        notEligible.push("The application deadline has passed.");
        breakdown.push({ criterion: "Deadline", score: 0, max: 1, note: "Deadline passed.", status: "ineligible" });
      } else if (days <= 7) {
        scores.push(0.6); known.push(true);
        needsAttention.push("Deadline is very soon — apply quickly.");
        breakdown.push({ criterion: "Deadline", score: 0.6, max: 1, note: "Closing soon.", status: "attention" });
      } else {
        scores.push(1); known.push(true);
        whyMatch.push(`You have ${days} days before the deadline.`);
        breakdown.push({ criterion: "Deadline", score: 1, max: 1, note: `${days} days left.`, status: "match" });
      }
    }
  }

  // Score normalisation
  let totalW = 0;
  let totalS = 0;
  scores.forEach((sc, i) => {
    if (known[i]) {
      totalW += weights[i];
      totalS += sc * weights[i];
    }
  });
  const score = totalW > 0 ? Math.round((totalS / totalW) * 100) : 50;

  let tier: MatchResult["tier"] = "low";
  if (notEligible.length > 0 && score < 50) tier = "ineligible";
  else if (score >= 75) tier = "high";
  else if (score >= 50) tier = "medium";
  else if (score >= 25) tier = "low";
  else tier = "ineligible";

  if (nullCount > 3) {
    needsAttention.push("Based on limited information.");
  }

  return { scholarshipId: scholarship.id, score, tier, whyMatch, needsAttention, notEligible, breakdown };
}

export function matchAll(profile: StudentProfile, scholarships: Scholarship[]): (Scholarship & { match: MatchResult })[] {
  return scholarships
    .map((s) => ({ ...s, match: matchScholarship(profile, s) }))
    .sort((a, b) => {
      // rank lower confidence last on tie
      const sa = a.match.score, sb = b.match.score;
      if (sb !== sa) return sb - sa;
      const ca = a.confidence === "LOW" ? 0 : 1;
      const cb = b.confidence === "LOW" ? 0 : 1;
      return cb - ca;
    });
}