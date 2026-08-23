// Domain types untuk Business Health Check UMKM.
// Semua aturan berasal dari Measurement Framework v0.2; tipe ini hanya wadahnya.

export type RuleOperator =
  | "equals"
  | "not_equals"
  | "greater_than"
  | "less_than"
  | "greater_or_equal"
  | "less_or_equal"
  | "in"
  | "not_in"
  | "exists";

export interface RuleCondition {
  field: string;
  operator: RuleOperator;
  value?: unknown;
}

export interface RuleGroup {
  all?: RuleNode[];
  any?: RuleNode[];
}

export type RuleNode = RuleCondition | RuleGroup;
export type Rule = RuleGroup;

export type Severity = "critical" | "high" | "medium" | "low";
export type StatusTone = "critical" | "warning" | "fair" | "healthy" | "excellent";

export interface DimensionDef {
  id: string;
  code: string;
  name: string;
  shortName: string;
  /** 0–1 */
  weight: number;
  purpose: string;
  scope: string;
}

export interface AnswerOptionDef {
  id: string;
  label: string;
  /** backend score 0–4, tidak pernah ditampilkan ke pengguna */
  score: number;
  semanticValue: string;
}

export interface IndicatorDef {
  id: string;
  dimensionId: string;
  subdimension: string;
  name: string;
  /** bobot indikator di dalam dimensi (persen) */
  weightInDimension: number;
  question: string;
  helperText: string;
  answerType: "single_choice";
  options: AnswerOptionDef[];
  applicabilityRule?: Rule;
  notApplicableReason?: string;
  allowUserNotApplicable: boolean;
  diagnosisWhenLow: string;
  recommendation: string;
  /** 1–5, dipakai priority engine */
  urgency: number;
  /** 1–5, dipakai priority engine */
  actionability: number;
  actionSteps: string[];
  isRequired: boolean;
  version: string;
}

export interface CriticalFlagDef {
  id: string;
  code: string;
  dimensionId: string;
  name: string;
  severity: Severity;
  sourceIndicatorId: string;
  triggerExpression: string;
  triggerRule: Rule;
  userExplanation: string;
  recommendation: string;
  active: boolean;
  version: string;
}

export interface HealthStatusRule {
  id: string;
  min: number;
  max: number;
  label: string;
  tone: StatusTone;
  summary: string;
}

export interface CrossDimensionRule {
  id: string;
  conditions: Array<{
    dimensionId: string;
    operator: RuleOperator;
    value: number;
  }>;
  statement: string;
  possibleCauseIndicatorIds: string[];
}

export type OfferingType = "produk" | "jasa" | "keduanya";
export type BusinessStage = "rintisan" | "bertumbuh" | "berkembang" | "scale_up";

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  offeringType: OfferingType;
  category: string;
  operatingYears: number;
  employeeCount: number;
  revenueRange: string;
  hasInventory: boolean;
  repeatPurchaseApplicable: boolean;
  usesPaidAds: boolean;
  stage: BusinessStage;
}

export interface AnswerRecord {
  indicatorId: string;
  optionId: string | null;
  score: number | null;
  semanticValue: string | null;
  /** true bila indikator tidak berlaku untuk usaha ini (N/A, bukan skor 0) */
  notApplicable: boolean;
  answeredAt: string;
}

export type AnswerMap = Record<string, AnswerRecord>;

export interface ApplicabilityResult {
  indicatorId: string;
  applicable: boolean;
  reason?: string | undefined;
}

export interface IndicatorScore {
  indicatorId: string;
  dimensionId: string;
  applicable: boolean;
  rawScore: number | null;
  /** 0–100 */
  normalizedScore: number | null;
  semanticValue: string | null;
  weightInDimension: number;
}

export type DimensionStatus = "SCORED" | "INSUFFICIENT_DATA";

export interface DimensionScore {
  dimensionId: string;
  /** presisi penuh, 0–100 */
  score: number;
  displayScore: number;
  status: DimensionStatus;
  applicableIndicatorCount: number;
  totalIndicatorCount: number;
}

export interface TriggeredFlag {
  flagId: string;
  code: string;
  name: string;
  severity: Severity;
  dimensionId: string;
  sourceIndicatorId: string;
  userExplanation: string;
  recommendation: string;
  triggerData: Record<string, unknown>;
}

export interface Priority {
  rank: number;
  indicatorId?: string | undefined;
  dimensionId: string;
  title: string;
  why: string;
  whatToDo: string;
  priorityScore: number;
  components: {
    severity: number;
    impact: number;
    urgency: number;
    actionability: number;
  };
  linkedFlagId?: string | undefined;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priorityRank: number;
  weekNumber: 1 | 2 | 3 | 4;
  completionCriteria: string;
  status: "todo" | "doing" | "done";
}

export interface DiagnosisResult {
  summary: string;
  crossDimensionStatements: Array<{
    id: string;
    statement: string;
    possibleCauses: string[];
  }>;
  dimensionNotes: Array<{ dimensionId: string; note: string }>;
  semanticNotes: string[];
}

export interface AssessmentResult {
  id: string;
  createdAt: string;
  questionnaireVersion: string;
  scoringVersion: string;
  profile: BusinessProfile;
  answers: AnswerMap;
  indicatorScores: IndicatorScore[];
  dimensionScores: DimensionScore[];
  overallScore: number;
  displayScore: number;
  status: HealthStatusRule;
  flags: TriggeredFlag[];
  diagnosis: DiagnosisResult;
  strengths: Array<{ dimensionId: string; text: string }>;
  priorities: Priority[];
  actionPlan: ActionItem[];
  complete: boolean;
}
