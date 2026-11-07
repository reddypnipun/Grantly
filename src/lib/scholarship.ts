import type { Scholarship } from "@/types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function getDisplayDeadline(s: Scholarship, today: Date = new Date()): string {
  const status = s.status ?? "CLOSED_REOPENS";
  if (status === "OPEN" || status === "ROLLING") {
    // generated demo deadline 1-6 months out (use lastKnownDeadline if present and future else generate)
    if (s.lastKnownDeadline) {
      const d = new Date(s.lastKnownDeadline);
      if (d.getTime() >= today.getTime()) return `${s.lastKnownDeadline} (sample deadline — check the official site)`;
    }
    const d = new Date(today);
    d.setMonth(d.getMonth() + 2);
    return `${d.toISOString().slice(0, 10)} (sample deadline — check the official site)`;
  }
  if (status === "OPENING_SOON") {
    const m = s.opensMonth ?? s.closesMonth;
    return m ? `Opens around ${MONTHS[m - 1]}` : "Opening soon";
  }
  if (status === "CLOSED_REOPENS") {
    if (s.opensMonth) return `Closed. Usually opens around ${MONTHS[s.opensMonth - 1]}.`;
    if (s.closesMonth) return `Closed. Usually reopens around ${MONTHS[s.closesMonth - 1]}.`;
    return "Closed. Reopens next cycle.";
  }
  if (status === "CLOSED_DISCONTINUED") return "No longer running";
  return "Check the official site";
}

export function getMissingFields(s: Scholarship): string[] {
  const missing: string[] = [];
  if (s.amountValue == null && s.amount == null) missing.push("amount");
  if (!s.lastKnownDeadline && !s.deadline) missing.push("deadline");
  if (!s.officialUrl) missing.push("officialUrl");
  if (!s.requiredDocuments || s.requiredDocuments.length === 0) missing.push("requiredDocuments");
  if (s.essaysRequired == null) missing.push("essays");
  if (s.recommendationsRequired == null) missing.push("recommendations");
  if (s.awardsCount == null) missing.push("awardsCount");
  if (!s.eligibility) missing.push("eligibility");
  if (s.applicationFee == null) missing.push("applicationFee");
  return missing;
}