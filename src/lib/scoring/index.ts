import {
  CRITICAL_FLAGS,
  DIMENSIONS,
  HEALTH_STATUS_RULES,
  INDICATORS,
  MAX_RAW_SCORE,
} from "@/config/framework";
import { buildRuleContext } from "@/lib/rules/context";
import { evaluateRule } from "@/lib/rules/engine";
import type {
  AnswerMap,
  ApplicabilityResult,
  BusinessProfile,
  DimensionScore,
  HealthStatusRule,
  IndicatorDef,
  IndicatorScore,
  TriggeredFlag,
} from "@/types/assessment";

export function getIndicator(indicatorId: string): IndicatorDef | undefined {
  return INDICATORS.find((indicator) => indicator.id === indicatorId);
}

/** Indikator N/A karena profil usaha, bukan karena jawaban buruk. */
export function evaluateApplicability(
  profile: BusinessProfile,
  indicators: IndicatorDef[] = INDICATORS,
): ApplicabilityResult[] {
  const context = buildRuleContext({ profile });
  return indicators.map((indicator) => {
    const applicable = evaluateRule(indicator.applicabilityRule, context);
    return {
      indicatorId: indicator.id,
      applicable,
      reason: applicable ? undefined : indicator.notApplicableReason,
    };
  });
}

export function getApplicableIndicators(profile: BusinessProfile): IndicatorDef[] {
  const applicability = evaluateApplicability(profile);
  const applicableIds = new Set(applicability.filter((item) => item.applicable).map((item) => item.indicatorId));
  return INDICATORS.filter((indicator) => applicableIds.has(indicator.id));
}

/** Skor indikator 0–100 dari raw score 0–4. */
export function calculateIndicatorScore(rawScore: number): number {
  return (rawScore / MAX_RAW_SCORE) * 100;
}

export function buildIndicatorScores(profile: BusinessProfile, answers: AnswerMap): IndicatorScore[] {
  const applicability = new Map(evaluateApplicability(profile).map((item) => [item.indicatorId, item.applicable]));

  return INDICATORS.map((indicator) => {
    const answer = answers[indicator.id];
    const profileApplicable = applicability.get(indicator.id) ?? true;
    const applicable = profileApplicable && !(answer?.notApplicable ?? false);
    const rawScore = applicable && answer && answer.score !== null ? answer.score : null;

    return {
      indicatorId: indicator.id,
      dimensionId: indicator.dimensionId,
      applicable,
      rawScore,
      normalizedScore: rawScore === null ? null : calculateIndicatorScore(rawScore),
      semanticValue: answer?.semanticValue ?? null,
      weightInDimension: indicator.weightInDimension,
    };
  });
}

/**
 * Dimension Score = Σ(raw × bobot) / Σ(4 × bobot indikator applicable) × 100.
 * Indikator N/A dikeluarkan dari denominator sehingga tidak menurunkan skor.
 */
export function calculateDimensionScore(scores: IndicatorScore[]): {
  score: number;
  status: DimensionScore["status"];
  applicableIndicatorCount: number;
} {
  const scored = scores.filter((item) => item.applicable && item.rawScore !== null);
  if (scored.length === 0) {
    return { score: 0, status: "INSUFFICIENT_DATA", applicableIndicatorCount: 0 };
  }
  const obtained = scored.reduce((sum, item) => sum + (item.rawScore as number) * item.weightInDimension, 0);
  const maximum = scored.reduce((sum, item) => sum + MAX_RAW_SCORE * item.weightInDimension, 0);
  return {
    score: (obtained / maximum) * 100,
    status: "SCORED",
    applicableIndicatorCount: scored.length,
  };
}

export function buildDimensionScores(indicatorScores: IndicatorScore[]): DimensionScore[] {
  return DIMENSIONS.map((dimension) => {
    const scores = indicatorScores.filter((item) => item.dimensionId === dimension.id);
    const result = calculateDimensionScore(scores);
    return {
      dimensionId: dimension.id,
      score: result.score,
      displayScore: Math.round(result.score),
      status: result.status,
      applicableIndicatorCount: result.applicableIndicatorCount,
      totalIndicatorCount: scores.length,
    };
  });
}

/** Overall = Σ(dimension score × bobot dimensi), bobot dinormalisasi bila ada dimensi tanpa data. */
export function calculateOverallScore(dimensionScores: DimensionScore[]): number {
  const usable = dimensionScores.filter((item) => item.status === "SCORED");
  if (usable.length === 0) return 0;
  const weightSum = usable.reduce((sum, item) => {
    const dimension = DIMENSIONS.find((d) => d.id === item.dimensionId);
    return sum + (dimension?.weight ?? 0);
  }, 0);
  const weighted = usable.reduce((sum, item) => {
    const dimension = DIMENSIONS.find((d) => d.id === item.dimensionId);
    return sum + item.score * (dimension?.weight ?? 0);
  }, 0);
  return weightSum === 0 ? 0 : weighted / weightSum;
}

export function resolveHealthStatus(score: number): HealthStatusRule {
  const rounded = Math.round(score);
  const match = HEALTH_STATUS_RULES.find((rule) => rounded >= rule.min && rounded <= rule.max);
  if (match) return match;
  return rounded > 100 ? HEALTH_STATUS_RULES[HEALTH_STATUS_RULES.length - 1]! : HEALTH_STATUS_RULES[0]!;
}

/** Critical flags adalah lapisan terpisah: tidak mengubah skor. */
export function evaluateCriticalFlags(
  profile: BusinessProfile,
  answers: AnswerMap,
  indicatorScores: IndicatorScore[],
): TriggeredFlag[] {
  const context = buildRuleContext({ profile, answers, indicatorScores });
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 } as const;

  return CRITICAL_FLAGS.filter((flag) => flag.active)
    .filter((flag) => {
      const source = indicatorScores.find((item) => item.indicatorId === flag.sourceIndicatorId);
      if (!source || !source.applicable || source.rawScore === null) return false;
      return evaluateRule(flag.triggerRule, context);
    })
    .map((flag) => ({
      flagId: flag.id,
      code: flag.code,
      name: flag.name,
      severity: flag.severity,
      dimensionId: flag.dimensionId,
      sourceIndicatorId: flag.sourceIndicatorId,
      userExplanation: flag.userExplanation,
      recommendation: flag.recommendation,
      triggerData: {
        expression: flag.triggerExpression,
        indicatorId: flag.sourceIndicatorId,
        rawScore: indicatorScores.find((item) => item.indicatorId === flag.sourceIndicatorId)?.rawScore ?? null,
        semanticValue:
          indicatorScores.find((item) => item.indicatorId === flag.sourceIndicatorId)?.semanticValue ?? null,
      },
    }))
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
