import type { Scholarship, StudentProfile, MatchResult, MatchBreakdown } from "@/types";

function normalizeGpa(profile: StudentProfile): number | null {
  if (profile.gpa === undefined || profile.gpa === null) return null;
  if (profile.gpaScale === "percentage") return (profile.gpa / 100) * 4;
  if (profile.gpaScale === "4") return profile.gpa;
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

  // 1. Level (20)
  {
    const ok = scholarship.level.includes(profile.educationLevel);
    const score = ok ? 1 : 0;
    const status = ok ? "match" : "ineligible";
    if (ok) whyMatch.push(`Your education level (${profile.educationLevel.replace("_", " ")}) is eligible.`);
    else notEligible.push(`This scholarship is for ${scholarship.level.join(", ").replace(/_/g, " ")} students; you're ${profile.educationLevel.replace("_", " ")}.`);
    breakdown.push({ criterion: "Education level", score, max: 1, note: ok ? "Level matches." : "Level mismatch.", status });
  }

  // 2. Field (15)
  {
    const fieldLower = (profile.field || "").toLowerCase();
    const any = scholarship.fields.includes("any");
    const fieldMatch = any || scholarship.fields.some((f) => fieldLower.includes(f.toLowerCase()) || f.toLowerCase().includes(fieldLower));
    const score = fieldMatch ? 1 : 0;
    const status = fieldMatch ? "match" : "ineligible";
    if (fieldMatch) {
      whyMatch.push(any ? "Open to all fields of study." : `Your field (${profile.field}) is supported.`);
    } else {
      notEligible.push(`This scholarship is for ${scholarship.fields.join(", ")}; your field is ${profile.field || "not set"}.`);
    }
    breakdown.push({ criterion: "Field of study", score, max: 1, note: fieldMatch ? "Field matches." : "Field mismatch.", status });
  }

  // 3. Location (10)
  {
    const ok = scholarship.country === "GLOBAL" || scholarship.country === profile.country;
    const score = ok ? 1 : 0;
    const status = ok ? "match" : "ineligible";
    if (ok) whyMatch.push(scholarship.country === "GLOBAL" ? "Open to students worldwide." : `Available in your country (${profile.country}).`);
    else notEligible.push(`This scholarship is for ${scholarship.country} residents; you're in ${profile.country}.`);
    breakdown.push({ criterion: "Location", score, max: 1, note: ok ? "Location matches." : "Location mismatch.", status });
  }

  // 4. GPA (15)
  {
    const gpa = normalizeGpa(profile);
    if (scholarship.minGpa === undefined) {
      breakdown.push({ criterion: "GPA", score: 1, max: 1, note: "No GPA requirement.", status: "match" });
      whyMatch.push("No minimum GPA required.");
    } else if (gpa === null) {
      breakdown.push({ criterion: "GPA", score: 0, max: 1, note: "GPA not provided.", status: "attention" });
      needsAttention.push(`A GPA of ${scholarship.minGpa} is required, but you haven't added your GPA yet.`);
    } else if (gpa >= scholarship.minGpa) {
      breakdown.push({ criterion: "GPA", score: 1, max: 1, note: `Your GPA ${gpa.toFixed(2)} meets ${scholarship.minGpa}.`, status: "match" });
      whyMatch.push(`Your GPA (${gpa.toFixed(2)}) meets the ${scholarship.minGpa} requirement.`);
    } else {
      breakdown.push({ criterion: "GPA", score: 0, max: 1, note: `Your GPA ${gpa.toFixed(2)} below ${scholarship.minGpa}.`, status: "ineligible" });
      notEligible.push(`You need a ${scholarship.minGpa} GPA, and you're at ${gpa.toFixed(2)}.`);
    }
  }

  // 5. Need (15)
  {
    if (scholarship.needBased) {
      const highNeed = profile.needLevel === "high" || profile.needLevel === "medium";
      if (highNeed) {
        breakdown.push({ criterion: "Financial need", score: 1, max: 1, note: "Need level qualifies.", status: "match" });
        whyMatch.push("Your financial need level qualifies for this need-based award.");
      } else {
        breakdown.push({ criterion: "Financial need", score: 0, max: 1, note: "Need level too low.", status: "attention" });
        needsAttention.push("This is need-based; your need level may be too low to qualify.");
      }
    } else {
      breakdown.push({ criterion: "Financial need", score: 1, max: 1, note: "Not need-based.", status: "match" });
    }
  }

  // 6. Demographics (10)
  {
    if (scholarship.demographics.length > 0) {
      const match = scholarship.demographics.some((d) => profile.background.map((b) => b.toLowerCase()).includes(d.toLowerCase()));
      if (match) {
        breakdown.push({ criterion: "Background", score: 1, max: 1, note: "Background matches.", status: "match" });
        whyMatch.push(`Your background matches: ${scholarship.demographics.join(", ")}.`);
      } else {
        breakdown.push({ criterion: "Background", score: 0, max: 1, note: "Background not matched.", status: "attention" });
        needsAttention.push(`This targets ${scholarship.demographics.join(", ")} applicants; not listed in your profile.`);
      }
    } else {
      breakdown.push({ criterion: "Background", score: 1, max: 1, note: "Open to all backgrounds.", status: "match" });
    }
  }

  // 7. Deadline feasibility (15)
  {
    const days = daysUntil(scholarship.deadline);
    if (days < 0) {
      breakdown.push({ criterion: "Deadline", score: 0, max: 1, note: "Deadline passed.", status: "ineligible" });
      notEligible.push("The application deadline has passed.");
    } else if (days <= 7) {
      breakdown.push({ criterion: "Deadline", score: 0.6, max: 1, note: "Closing soon.", status: "attention" });
      needsAttention.push("Deadline is very soon — apply quickly.");
    } else {
      breakdown.push({ criterion: "Deadline", score: 1, max: 1, note: `${days} days left.`, status: "match" });
      whyMatch.push(`You have ${days} days before the deadline.`);
    }
  }

  // Weighted sum
  const weights = [20, 15, 10, 15, 15, 10, 15];
  let total = 0;
  let maxTotal = 0;
  breakdown.forEach((b, i) => {
    total += b.score * weights[i];
    maxTotal += 1 * weights[i];
  });
  const score = Math.round((total / maxTotal) * 100);

  let tier: MatchResult["tier"] = "low";
  if (notEligible.length > 0 && score < 50) tier = "ineligible";
  else if (score >= 75) tier = "high";
  else if (score >= 50) tier = "medium";
  else if (score >= 25) tier = "low";
  else tier = "ineligible";

  return { scholarshipId: scholarship.id, score, tier, whyMatch, needsAttention, notEligible, breakdown };
}

export function matchAll(profile: StudentProfile, scholarships: Scholarship[]): (Scholarship & { match: MatchResult })[] {
  return scholarships
    .map((s) => ({ ...s, match: matchScholarship(profile, s) }))
    .sort((a, b) => b.match.score - a.match.score);
}
