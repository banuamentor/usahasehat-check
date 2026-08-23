import {
  CROSS_DIMENSION_RULES,
  DIMENSIONS,
  FIN06_SEMANTIC_DIAGNOSIS,
  INDICATORS,
} from "@/config/framework";
import type { DiagnosisResult, DimensionScore, IndicatorScore } from "@/types/assessment";

const STRONG_THRESHOLD = 70;
const WEAK_THRESHOLD = 55;

function dimensionName(dimensionId: string): string {
  return DIMENSIONS.find((dimension) => dimension.id === dimensionId)?.shortName ?? dimensionId;
}

function compareScore(score: number, operator: string, value: number): boolean {
  if (operator === "greater_or_equal") return score >= value;
  if (operator === "less_than") return score < value;
  if (operator === "greater_than") return score > value;
  if (operator === "less_or_equal") return score <= value;
  return false;
}

export function buildDiagnosis(
  dimensionScores: DimensionScore[],
  indicatorScores: IndicatorScore[],
): DiagnosisResult {
  const scored = dimensionScores.filter((item) => item.status === "SCORED");
  const strong = scored.filter((item) => item.score >= STRONG_THRESHOLD);
  const weak = scored.filter((item) => item.score < WEAK_THRESHOLD);

  const strongNames = strong.map((item) => dimensionName(item.dimensionId));
  const weakNames = weak.map((item) => dimensionName(item.dimensionId));

  let summary: string;
  if (strongNames.length > 0 && weakNames.length > 0) {
    summary = `Bagian ${strongNames.join(", ")} sudah berjalan cukup baik, sementara bagian ${weakNames.join(", ")} masih perlu diperkuat.`;
  } else if (weakNames.length > 0) {
    summary = `Sebagian besar bagian usaha masih perlu diperkuat, terutama ${weakNames.slice(0, 3).join(", ")}.`;
  } else if (strongNames.length > 0) {
    summary = `Sebagian besar bagian usaha sudah berjalan baik, terutama ${strongNames.slice(0, 3).join(", ")}. Fokus berikutnya adalah menjaga konsistensi.`;
  } else {
    summary = "Kondisi usaha berada pada tingkat menengah di hampir semua bagian dan masih bisa dinaikkan bertahap.";
  }

  const crossDimensionStatements = CROSS_DIMENSION_RULES.filter((rule) =>
    rule.conditions.every((condition) => {
      const dimension = scored.find((item) => item.dimensionId === condition.dimensionId);
      if (!dimension) return false;
      return compareScore(dimension.score, condition.operator, condition.value);
    }),
  ).map((rule) => ({
    id: rule.id,
    statement: rule.statement,
    possibleCauses: rule.possibleCauseIndicatorIds
      .filter((indicatorId) => {
        const score = indicatorScores.find((item) => item.indicatorId === indicatorId);
        return score?.applicable && score.rawScore !== null && score.rawScore <= 2;
      })
      .map((indicatorId) => INDICATORS.find((indicator) => indicator.id === indicatorId)?.diagnosisWhenLow ?? "")
      .filter(Boolean),
  }));

  const dimensionNotes = scored
    .filter((item) => item.score < WEAK_THRESHOLD)
    .map((item) => {
      const lowest = indicatorScores
        .filter((score) => score.dimensionId === item.dimensionId && score.applicable && score.rawScore !== null)
        .sort((a, b) => (a.rawScore as number) - (b.rawScore as number))[0];
      const indicator = INDICATORS.find((def) => def.id === lowest?.indicatorId);
      return {
        dimensionId: item.dimensionId,
        note: indicator ? indicator.diagnosisWhenLow : `Bagian ${dimensionName(item.dimensionId)} masih perlu diperkuat.`,
      };
    });

  const semanticNotes: string[] = [];
  const fin06 = indicatorScores.find((item) => item.indicatorId === "FIN-06");
  if (fin06?.applicable && fin06.semanticValue && FIN06_SEMANTIC_DIAGNOSIS[fin06.semanticValue]) {
    semanticNotes.push(FIN06_SEMANTIC_DIAGNOSIS[fin06.semanticValue]);
  }

  return { summary, crossDimensionStatements, dimensionNotes, semanticNotes };
}

export function buildStrengths(
  dimensionScores: DimensionScore[],
  indicatorScores: IndicatorScore[],
): Array<{ dimensionId: string; text: string }> {
  return dimensionScores
    .filter((item) => item.status === "SCORED")
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .filter((item) => item.score >= 55)
    .map((item) => {
      const best = indicatorScores
        .filter((score) => score.dimensionId === item.dimensionId && score.applicable && score.rawScore !== null)
        .sort((a, b) => (b.rawScore as number) - (a.rawScore as number))[0];
      const indicator = INDICATORS.find((def) => def.id === best?.indicatorId);
      return {
        dimensionId: item.dimensionId,
        text: indicator
          ? `${dimensionName(item.dimensionId)}: ${indicator.name.toLowerCase()} sudah berjalan cukup baik.`
          : `${dimensionName(item.dimensionId)} sudah berjalan cukup baik.`,
      };
    });
}
