import { INDICATORS } from "@/config/framework";
import { getApplicableIndicators } from "@/lib/scoring";
import type { AnswerMap, BusinessProfile } from "@/types/assessment";

export interface DemoScenario {
  key: string;
  label: string;
  profile: BusinessProfile;
  scores: Record<string, number>;
}

function buildAnswers(profile: BusinessProfile, scores: Record<string, number>): AnswerMap {
  const applicable = new Set(getApplicableIndicators(profile).map((indicator) => indicator.id));
  const answers: AnswerMap = {};
  for (const indicator of INDICATORS) {
    if (!applicable.has(indicator.id)) {
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
    const score = scores[indicator.id] ?? 2;
    const option = indicator.options[score] ?? indicator.options[0]!;
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

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    key: "makanan",
    label: "Usaha makanan — Sambal Roa Neng Sari",
    profile: {
      businessName: "Sambal Roa Neng Sari",
      ownerName: "Neng Sari",
      offeringType: "produk",
      category: "makanan_minuman",
      operatingYears: 3,
      employeeCount: 4,
      revenueRange: "20_50jt",
      hasInventory: true,
      repeatPurchaseApplicable: true,
      usesPaidAds: true,
      stage: "bertumbuh",
    },
    scores: {
      "FIN-01": 2, "FIN-02": 1, "FIN-03": 0, "FIN-04": 1, "FIN-05": 2, "FIN-06": 0,
      "SAL-01": 3, "SAL-02": 2, "SAL-03": 2, "SAL-04": 3,
      "CUS-01": 3, "CUS-02": 3, "CUS-03": 1, "CUS-04": 2,
      "PRO-01": 3, "PRO-02": 3, "PRO-03": 2, "PRO-04": 1,
      "MKT-01": 3, "MKT-02": 3, "MKT-03": 2, "MKT-04": 0,
      "OPS-01": 2, "OPS-02": 2, "OPS-03": 2, "OPS-04": 3, "OPS-05": 1,
      "GRW-01": 2, "GRW-02": 2, "GRW-03": 2, "GRW-04": 1,
    },
  },
  {
    key: "acara",
    label: "Jasa acara — Larasati Wedding Organizer",
    profile: {
      businessName: "Larasati Wedding Organizer",
      ownerName: "Bagas",
      offeringType: "jasa",
      category: "jasa_proyek",
      operatingYears: 5,
      employeeCount: 6,
      revenueRange: "50_200jt",
      hasInventory: false,
      repeatPurchaseApplicable: false,
      usesPaidAds: false,
      stage: "berkembang",
    },
    scores: {
      "FIN-01": 3, "FIN-02": 3, "FIN-03": 2, "FIN-04": 3, "FIN-05": 3, "FIN-06": 2,
      "SAL-01": 3, "SAL-02": 3, "SAL-03": 3, "SAL-04": 2,
      "CUS-01": 3, "CUS-03": 2, "CUS-04": 3,
      "PRO-01": 3, "PRO-02": 3, "PRO-03": 3, "PRO-04": 3,
      "MKT-01": 2, "MKT-02": 1, "MKT-03": 1, "MKT-04": 1,
      "OPS-01": 3, "OPS-02": 2, "OPS-04": 3, "OPS-05": 2,
      "GRW-01": 3, "GRW-02": 3, "GRW-03": 2, "GRW-04": 2,
    },
  },
  {
    key: "solo",
    label: "Jasa profesional solo — Studio Desain Adi",
    profile: {
      businessName: "Studio Desain Adi",
      ownerName: "Adi",
      offeringType: "jasa",
      category: "jasa_profesional",
      operatingYears: 2,
      employeeCount: 1,
      revenueRange: "5_20jt",
      hasInventory: false,
      repeatPurchaseApplicable: true,
      usesPaidAds: false,
      stage: "rintisan",
    },
    scores: {
      "FIN-01": 2, "FIN-02": 2, "FIN-03": 2, "FIN-04": 2, "FIN-05": 2, "FIN-06": 1,
      "SAL-01": 2, "SAL-02": 1, "SAL-03": 2, "SAL-04": 2,
      "CUS-01": 2, "CUS-02": 3, "CUS-03": 1, "CUS-04": 2,
      "PRO-01": 3, "PRO-02": 3, "PRO-03": 2, "PRO-04": 2,
      "MKT-01": 2, "MKT-02": 2, "MKT-03": 1, "MKT-04": 1,
      "OPS-01": 2, "OPS-02": 2, "OPS-04": 3, "OPS-05": 1,
      "GRW-01": 1, "GRW-02": 1, "GRW-03": 2, "GRW-04": 1,
    },
  },
];

export function demoAnswers(scenario: DemoScenario): AnswerMap {
  return buildAnswers(scenario.profile, scenario.scores);
}
