import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { buildAssessmentResult } from "@/lib/assessment/result-engine";
import { buildActionPlan } from "@/lib/priorities";
import { resolveHealthStatus } from "@/lib/scoring";
import type {
  ActionItem,
  AnswerMap,
  AssessmentResult,
  BusinessProfile,
  DiagnosisResult,
  DimensionScore,
  IndicatorScore,
  Priority,
  TriggeredFlag,
} from "@/types/assessment";

export interface SavedAssessmentSummary {
  id: string;
  businessName: string;
  displayScore: number;
  statusLabel: string;
  statusId: string;
  createdAt: string;
  questionnaireVersion: string;
  scoringVersion: string;
}

export interface StoredActionItem {
  id: string;
  itemKey: string;
  status: "todo" | "doing" | "done";
}

/** Simpan hasil sebagai baris baru — pemeriksaan lama tidak pernah ditimpa. */
export async function saveAssessment(userId: string, result: AssessmentResult): Promise<string> {
  const { data, error } = await supabase
    .from("assessments")
    .insert({
      user_id: userId,
      business_name: result.profile.businessName,
      questionnaire_version: result.questionnaireVersion,
      scoring_version: result.scoringVersion,
      overall_score: result.overallScore,
      display_score: result.displayScore,
      status_id: result.status.id,
      status_label: result.status.label,
      business_profile: result.profile as unknown as Json,
      answers: result.answers as unknown as Json,
      indicator_scores: result.indicatorScores as unknown as Json,
      dimension_scores: result.dimensionScores as unknown as Json,
      flags: result.flags as unknown as Json,
      diagnosis: result.diagnosis as unknown as Json,
      strengths: result.strengths as unknown as Json,
      priorities: result.priorities as unknown as Json,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  const assessmentId = data.id as string;

  if (result.actionPlan.length > 0) {
    const { error: itemError } = await supabase.from("action_items").insert(
      result.actionPlan.map((item: ActionItem) => ({
        assessment_id: assessmentId,
        user_id: userId,
        item_key: item.id,
        title: item.title,
        description: item.description,
        completion_criteria: item.completionCriteria,
        week_number: item.weekNumber,
        priority_rank: item.priorityRank,
        status: item.status,
      })),
    );
    if (itemError) throw new Error(itemError.message);
  }

  return assessmentId;
}

export async function listAssessments(): Promise<SavedAssessmentSummary[]> {
  const { data, error } = await supabase
    .from("assessments")
    .select("id, business_name, display_score, status_label, status_id, created_at, questionnaire_version, scoring_version")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    businessName: row.business_name,
    displayScore: row.display_score,
    statusLabel: row.status_label,
    statusId: row.status_id,
    createdAt: row.created_at,
    questionnaireVersion: row.questionnaire_version,
    scoringVersion: row.scoring_version,
  }));
}

export interface LoadedAssessment {
  result: AssessmentResult;
  storedDisplayScore: number;
  versionMatches: boolean;
  actionItems: StoredActionItem[];
}

export async function loadAssessment(id: string): Promise<LoadedAssessment | null> {
  const { data, error } = await supabase.from("assessments").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const hasStoredSnapshots =
    Boolean(data.dimension_scores) &&
    Boolean(data.indicator_scores) &&
    Boolean(data.diagnosis) &&
    typeof data.diagnosis === "object";

  let result: AssessmentResult;

  if (hasStoredSnapshots) {
    const rawPriorities = Array.isArray(data.priorities)
      ? (data.priorities as unknown as Priority[])
      : [];

    result = {
      id: data.id,
      createdAt: data.created_at,
      questionnaireVersion: data.questionnaire_version,
      scoringVersion: data.scoring_version,
      profile: data.business_profile as unknown as BusinessProfile,
      answers: data.answers as unknown as AnswerMap,
      indicatorScores: (data.indicator_scores as unknown as IndicatorScore[]) ?? [],
      dimensionScores: (data.dimension_scores as unknown as DimensionScore[]) ?? [],
      overallScore: Number(data.overall_score),
      displayScore: data.display_score,
      status: resolveHealthStatus(Number(data.overall_score)),
      flags: (Array.isArray(data.flags) ? data.flags : []) as unknown as TriggeredFlag[],
      diagnosis: data.diagnosis as unknown as DiagnosisResult,
      strengths: (Array.isArray(data.strengths) ? data.strengths : []) as unknown as Array<{
        dimensionId: string;
        text: string;
      }>,
      priorities: rawPriorities,
      actionPlan: buildActionPlan(rawPriorities),
      complete: true,
    };
  } else {
    result = buildAssessmentResult(
      data.business_profile as unknown as BusinessProfile,
      data.answers as unknown as AnswerMap,
      { id: data.id, createdAt: data.created_at },
    );
  }

  const { data: items, error: itemError } = await supabase
    .from("action_items")
    .select("id, item_key, status")
    .eq("assessment_id", id);
  if (itemError) throw new Error(itemError.message);

  return {
    result,
    storedDisplayScore: data.display_score,
    versionMatches:
      data.questionnaire_version === result.questionnaireVersion && data.scoring_version === result.scoringVersion,
    actionItems: (items ?? []).map((item) => ({
      id: item.id,
      itemKey: item.item_key,
      status: item.status as StoredActionItem["status"],
    })),
  };
}

export async function updateActionItemStatus(id: string, status: StoredActionItem["status"]): Promise<void> {
  const { error } = await supabase.from("action_items").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteAssessment(id: string): Promise<void> {
  const { error } = await supabase.from("assessments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function countActionProgress(assessmentIds: string[]): Promise<Record<string, { done: number; total: number }>> {
  if (assessmentIds.length === 0) return {};
  const { data, error } = await supabase
    .from("action_items")
    .select("assessment_id, status")
    .in("assessment_id", assessmentIds);
  if (error) throw new Error(error.message);
  const progress: Record<string, { done: number; total: number }> = {};
  for (const row of data ?? []) {
    const entry = (progress[row.assessment_id] ??= { done: 0, total: 0 });
    entry.total += 1;
    if (row.status === "done") entry.done += 1;
  }
  return progress;
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
