export type ScholarshipStatus = "OPEN" | "OPENING_SOON" | "CLOSED_REOPENS" | "CLOSED_DISCONTINUED" | "ROLLING";
export type Confidence = "HIGH" | "MEDIUM" | "LOW";

export type EducationLevel = "high_school" | "undergrad" | "postgrad" | "phd" | "other" | "school";

export type NeedLevel = "high" | "medium" | "low" | "none";

export type Country = "IN" | "US" | "UK" | "GLOBAL" | string;

export interface StudentProfile {
  id: string;
  name: string;
  educationLevel: EducationLevel;
  field: string;
  country: Country;
  gpa?: number; // 0-4 scale or percentage; we store as 0-4 normalized? We'll store raw + scale
  gpaScale: "4" | "percentage" | "none";
  needLevel: NeedLevel;
  background: string[]; // categories
  interests: string[];
  goals: string;
  createdAt: string;
  updatedAt: string;
}

export type MatchTier = "high" | "medium" | "low" | "ineligible";

export interface MatchBreakdown {
  criterion: string;
  score: number; // 0-1
  max: number;
  note: string; // plain language
  status: "match" | "attention" | "ineligible";
}

export interface MatchResult {
  scholarshipId: string;
  score: number; // 0-100
  tier: MatchTier;
  whyMatch: string[];
  needsAttention: string[];
  notEligible: string[];
  breakdown: MatchBreakdown[];
}

export type ScholarshipType = "merit" | "need" | "merit_need" | "identity" | "research" | "other";

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  country: string;
  applicantCountry?: string | null;
  studyCountry?: string | null;
  status?: ScholarshipStatus;
  type: string;
  level: EducationLevel[];
  levels?: string[] | null;
  fields: string[];
  minGpa?: number | null;
  needBased: boolean;
  meritBased: boolean;
  amount: number | null;
  amountText?: string | null;
  amountValue?: number | null;
  amountCurrency?: string | null;
  currency: string;
  awardsCount?: number | null;
  eligibility?: {
    citizenship?: string | null;
    maxFamilyIncomeINR?: number | null;
    minGpaPercent?: number | null;
    gender?: string | null;
    category?: string | null;
    minWorkYears?: number | null;
    notes?: string | null;
  } | null;
  requiredDocuments?: string[] | null;
  documents: string[];
  essaysRequired?: number | null;
  recommendationsRequired?: number | null;
  applicationFee?: string | null;
  lastKnownDeadline?: string | null;
  deadline: string | null;
  opensMonth?: number | null;
  closesMonth?: number | null;
  officialUrl?: string | null;
  officialLink?: string;
  sourceUrls?: string[];
  confidence?: Confidence;
  hasConflict?: boolean;
  isReal?: boolean;
  description: string;
  tips: string[];
  tags: string[];
  demographics: string[];
  notes?: string | null;
  effort: { essays: number; recommendations: number; hours: number };
  requirements: string[];
  source: "verified" | "sample";
  createdAt: string;
}

export type ApplicationStatus = "saved" | "preparing" | "submitted" | "awaiting" | "won" | "not_selected";

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface Application {
  id: string;
  scholarshipId: string;
  status: ApplicationStatus;
  checklist: ChecklistItem[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type DocStatus = "ready" | "in_progress" | "missing";

export interface VaultDocument {
  id: string;
  type: string;
  label: string;
  status: DocStatus;
  fileName?: string;
  fileSize?: number;
  updatedAt: string;
}

export interface Essay {
  id: string;
  title: string;
  body: string;
  tags: string[];
  linkedScholarshipIds: string[];
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  scholarshipId?: string;
  title: string;
  date: string;
  read: boolean;
  createdAt: string;
}
