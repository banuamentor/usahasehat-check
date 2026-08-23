import { QUESTIONNAIRE_VERSION, SCORING_VERSION } from "@/config/framework";
import { buildDiagnosis, buildStrengths } from "@/lib/diagnosis";
import { buildActionPlan, rankPriorities } from "@/lib/priorities";
import {
  buildDimensionScores,
  buildIndicatorScores,
  calculateOverallScore,
  evaluateCriticalFlags,
  getApplicableIndicators,
  resolveHealthStatus,
} from "@/lib/scoring";
import type { AnswerMap, AssessmentResult, BusinessProfile } from "@/types/assessment";

export function isAssessmentComplete(profile: BusinessProfile, answers: AnswerMap): boolean {
  return getApplicableIndicators(profile).every((indicator) => {
    const answer = answers[indicator.id];
    return Boolean(answer && (answer.notApplicable || answer.score !== null));
  });
}

/**
 * Pipeline deterministik:
 * jawaban → applicability → skor indikator → skor dimensi → overall → flags →
 * diagnosis → prioritas → rencana aksi.
 */
export function buildAssessmentResult(
  profile: BusinessProfile,
  answers: AnswerMap,
  meta?: { id?: string; createdAt?: string },
): AssessmentResult {
  const indicatorScores = buildIndicatorScores(profile, answers);
  const dimensionScores = buildDimensionScores(indicatorScores);
  const overallScore = calculateOverallScore(dimensionScores);
  const flags = evaluateCriticalFlags(profile, answers, indicatorScores);
  const diagnosis = buildDiagnosis(dimensionScores, indicatorScores);
  const priorities = rankPriorities(indicatorScores, dimensionScores, flags);

  return {
    id: meta?.id ?? `bhc-${Date.now()}`,
    createdAt: meta?.createdAt ?? new Date().toISOString(),
    questionnaireVersion: QUESTIONNAIRE_VERSION,
    scoringVersion: SCORING_VERSION,
    profile,
    answers,
    indicatorScores,
    dimensionScores,
    overallScore: Number(overallScore.toFixed(4)),
    displayScore: Math.round(overallScore),
    status: resolveHealthStatus(overallScore),
    flags,
    diagnosis,
    strengths: buildStrengths(dimensionScores, indicatorScores),
    priorities,
    actionPlan: buildActionPlan(priorities),
    complete: isAssessmentComplete(profile, answers),
  };
}
