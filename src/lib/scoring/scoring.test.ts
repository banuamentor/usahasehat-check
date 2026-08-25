import { describe, expect, it } from "vitest";

import { DIMENSIONS, INDICATORS } from "@/config/framework";
import { buildAssessmentResult } from "@/lib/assessment/result-engine";
import {
  buildDimensionScores,
  buildIndicatorScores,
  calculateDimensionScore,
  calculateIndicatorScore,
  calculateOverallScore,
  evaluateApplicability,
  getApplicableIndicators,
  resolveHealthStatus,
} from "@/lib/scoring";
import type { AnswerMap, BusinessProfile, IndicatorScore } from "@/types/assessment";

const baseProfile: BusinessProfile = {
  businessName: "Warung Uji",
  ownerName: "Andi",
  offeringType: "produk",
  category: "makanan_minuman",
  operatingYears: 3,
  employeeCount: 4,
  revenueRange: "20_50jt",
  hasInventory: true,
  repeatPurchaseApplicable: true,
  usesPaidAds: true,
  stage: "bertumbuh",
};

function answerAll(profile: BusinessProfile, score: number | null, overrides: Record<string, number> = {}): AnswerMap {
  const applicable = new Set(getApplicableIndicators(profile).map((indicator) => indicator.id));
  const answers: AnswerMap = {};
  for (const indicator of INDICATORS) {
    const target = overrides[indicator.id] ?? score;
    if (!applicable.has(indicator.id) || target === null) {
      answers[indicator.id] = {
        indicatorId: indicator.id,
        optionId: null,
        score: null,
        semanticValue: null,
        notApplicable: true,
        answeredAt: new Date(0).toISOString(),
      };
      continue;
    }
    const option = indicator.options.find((item) => item.score === target) ?? indicator.options[0]!;
    answers[indicator.id] = {
      indicatorId: indicator.id,
      optionId: option.id,
      score: option.score,
      semanticValue: option.semanticValue,
      notApplicable: false,
      answeredAt: new Date(0).toISOString(),
    };
  }
  return answers;
}

function indicatorScore(partial: Partial<IndicatorScore> & { indicatorId: string }): IndicatorScore {
  return {
    dimensionId: "FIN",
    applicable: true,
    rawScore: 0,
    normalizedScore: 0,
    semanticValue: null,
    weightInDimension: 20,
    ...partial,
  };
}

describe("skor indikator", () => {
  it("memetakan raw 0–4 ke 0–100", () => {
    expect(calculateIndicatorScore(0)).toBe(0);
    expect(calculateIndicatorScore(1)).toBe(25);
    expect(calculateIndicatorScore(2)).toBe(50);
    expect(calculateIndicatorScore(4)).toBe(100);
  });
});

describe("skor dimensi", () => {
  it("semua jawaban terburuk menghasilkan 0", () => {
    const result = calculateDimensionScore([
      indicatorScore({ indicatorId: "A", rawScore: 0 }),
      indicatorScore({ indicatorId: "B", rawScore: 0, weightInDimension: 30 }),
    ]);
    expect(result.score).toBe(0);
    expect(result.status).toBe("SCORED");
  });

  it("semua jawaban terbaik menghasilkan 100", () => {
    const result = calculateDimensionScore([
      indicatorScore({ indicatorId: "A", rawScore: 4 }),
      indicatorScore({ indicatorId: "B", rawScore: 4, weightInDimension: 30 }),
    ]);
    expect(result.score).toBe(100);
  });

  it("menghitung rata-rata berbobot untuk jawaban campuran", () => {
    const result = calculateDimensionScore([
      indicatorScore({ indicatorId: "A", rawScore: 4, weightInDimension: 50 }),
      indicatorScore({ indicatorId: "B", rawScore: 0, weightInDimension: 50 }),
    ]);
    expect(result.score).toBe(50);
  });

  it("mengeluarkan indikator N/A dari denominator", () => {
    const result = calculateDimensionScore([
      indicatorScore({ indicatorId: "A", rawScore: 4, weightInDimension: 50 }),
      indicatorScore({ indicatorId: "B", rawScore: null, applicable: false, weightInDimension: 50 }),
    ]);
    expect(result.score).toBe(100);
    expect(result.applicableIndicatorCount).toBe(1);
  });

  it("semua N/A menghasilkan INSUFFICIENT_DATA, bukan 0", () => {
    const result = calculateDimensionScore([
      indicatorScore({ indicatorId: "A", rawScore: null, applicable: false }),
      indicatorScore({ indicatorId: "B", rawScore: null, applicable: false }),
    ]);
    expect(result.status).toBe("INSUFFICIENT_DATA");
    expect(result.applicableIndicatorCount).toBe(0);
  });
});

describe("skor keseluruhan", () => {
  it("semua indikator terbaik menghasilkan 100 dan status tertinggi", () => {
    const answers = answerAll(baseProfile, 4);
    const dimensionScores = buildDimensionScores(buildIndicatorScores(baseProfile, answers));
    const overall = calculateOverallScore(dimensionScores);
    expect(Math.round(overall)).toBe(100);
    expect(resolveHealthStatus(overall).min).toBe(85);
  });

  it("semua indikator terburuk menghasilkan 0 dan status kritis", () => {
    const answers = answerAll(baseProfile, 0);
    const dimensionScores = buildDimensionScores(buildIndicatorScores(baseProfile, answers));
    const overall = calculateOverallScore(dimensionScores);
    expect(overall).toBe(0);
    expect(resolveHealthStatus(overall).max).toBe(39);
  });

  it("menormalisasi bobot ketika satu dimensi tanpa data", () => {
    const scored = DIMENSIONS.map((dimension, index) => ({
      dimensionId: dimension.id,
      score: index === 0 ? 0 : 80,
      displayScore: index === 0 ? 0 : 80,
      status: (index === 0 ? "INSUFFICIENT_DATA" : "SCORED") as const,
      applicableIndicatorCount: index === 0 ? 0 : 3,
      totalIndicatorCount: 3,
    }));
    expect(calculateOverallScore(scored)).toBeCloseTo(80, 6);
  });

  it("ambang status mengikuti framework", () => {
    expect(resolveHealthStatus(39).max).toBe(39);
    expect(resolveHealthStatus(40).min).toBe(40);
    expect(resolveHealthStatus(55).min).toBe(55);
    expect(resolveHealthStatus(70).min).toBe(70);
    expect(resolveHealthStatus(85).min).toBe(85);
  });
});

describe("applicability profil", () => {
  it("CUS-02 tidak berlaku bila repeat purchase tidak relevan", () => {
    const profile = { ...baseProfile, repeatPurchaseApplicable: false };
    const result = evaluateApplicability(profile).find((item) => item.indicatorId === "CUS-02");
    expect(result?.applicable).toBe(false);
  });

  it("OPS-03 tidak berlaku bila usaha tanpa stok", () => {
    const profile = { ...baseProfile, hasInventory: false };
    const result = evaluateApplicability(profile).find((item) => item.indicatorId === "OPS-03");
    expect(result?.applicable).toBe(false);
  });

  it("indikator N/A tidak menghukum skor akhir", () => {
    const withInventory = buildAssessmentResult(baseProfile, answerAll(baseProfile, 3));
    const noInventory = { ...baseProfile, hasInventory: false, repeatPurchaseApplicable: false };
    const withoutInventory = buildAssessmentResult(noInventory, answerAll(noInventory, 3));
    expect(withoutInventory.displayScore).toBe(withInventory.displayScore);
  });
});

describe("critical flags dan prioritas", () => {
  it("jawaban terburuk memicu flag kritis dan maksimal 3 prioritas", () => {
    const result = buildAssessmentResult(baseProfile, answerAll(baseProfile, 0));
    expect(result.flags.length).toBeGreaterThan(0);
    expect(result.flags[0]!.severity).toBe("critical");
    expect(result.priorities.length).toBeLessThanOrEqual(3);
    expect(result.actionPlan.length).toBeGreaterThan(0);
  });

  it("jawaban terbaik tidak memicu flag", () => {
    const result = buildAssessmentResult(baseProfile, answerAll(baseProfile, 4));
    expect(result.flags).toHaveLength(0);
    expect(result.priorities).toHaveLength(0);
  });
});

describe("semantik FIN-06", () => {
  it("membedakan 'belum tahu' dari 'kurang dari 2 minggu'", () => {
    const unknown = buildAssessmentResult(baseProfile, answerAll(baseProfile, 2, { "FIN-06": 0 }));
    const lessThanTwoWeeks = buildAssessmentResult(baseProfile, answerAll(baseProfile, 2, { "FIN-06": 1 }));

    const unknownScore = unknown.indicatorScores.find((item) => item.indicatorId === "FIN-06");
    const lessScore = lessThanTwoWeeks.indicatorScores.find((item) => item.indicatorId === "FIN-06");
    expect(unknownScore?.semanticValue).toBe("unknown");
    expect(lessScore?.semanticValue).toBe("less_than_2_weeks");
    expect(unknown.diagnosis.semanticNotes[0]).not.toBe(lessThanTwoWeeks.diagnosis.semanticNotes[0]);
  });
});
