import type { AnswerMap, BusinessProfile, IndicatorScore } from "@/types/assessment";
import type { RuleContext } from "./engine";

/** Context datar: profile.*, indicator.<ID>.score / .semanticValue / .applicable, dimension.<ID>.score */
export function buildRuleContext(input: {
  profile: BusinessProfile;
  answers?: AnswerMap;
  indicatorScores?: IndicatorScore[];
  dimensionScores?: Array<{ dimensionId: string; score: number }>;
}): RuleContext {
  const context: RuleContext = {};

  for (const [key, value] of Object.entries(input.profile)) {
    context[`profile.${key}`] = value;
  }

  for (const answer of Object.values(input.answers ?? {})) {
    context[`indicator.${answer.indicatorId}.score`] = answer.notApplicable ? null : answer.score;
    context[`indicator.${answer.indicatorId}.semanticValue`] = answer.semanticValue;
    context[`indicator.${answer.indicatorId}.applicable`] = !answer.notApplicable;
  }

  for (const indicator of input.indicatorScores ?? []) {
    context[`indicator.${indicator.indicatorId}.score`] = indicator.applicable ? indicator.rawScore : null;
    context[`indicator.${indicator.indicatorId}.applicable`] = indicator.applicable;
    context[`indicator.${indicator.indicatorId}.semanticValue`] = indicator.semanticValue;
  }

  for (const dimension of input.dimensionScores ?? []) {
    context[`dimension.${dimension.dimensionId}.score`] = dimension.score;
  }

  return context;
}
