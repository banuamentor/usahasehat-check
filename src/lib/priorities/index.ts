import { DIMENSIONS, INDICATORS } from "@/config/framework";
import type {
  ActionItem,
  DimensionScore,
  IndicatorScore,
  Priority,
  Severity,
  TriggeredFlag,
} from "@/types/assessment";

const SEVERITY_VALUE: Record<Severity, number> = { critical: 5, high: 4, medium: 3, low: 2 };

const WEIGHTS = { severity: 0.35, impact: 0.3, urgency: 0.2, actionability: 0.15 } as const;

interface Candidate {
  indicatorId: string;
  dimensionId: string;
  severity: number;
  impact: number;
  urgency: number;
  actionability: number;
  linkedFlagId?: string;
  why: string;
}

/** Severity dari skor mentah indikator bila tidak ada flag terkait. */
function severityFromRawScore(rawScore: number): number {
  if (rawScore <= 0) return 5;
  if (rawScore === 1) return 4;
  if (rawScore === 2) return 3;
  return 2;
}

/** Impact 1–5 dari bobot dimensi (20% → 5, 10% → ~2.5) dan kelemahan dimensinya. */
function impactFromDimension(dimensionId: string, dimensionScores: DimensionScore[]): number {
  const dimension = DIMENSIONS.find((item) => item.id === dimensionId);
  const weightPart = ((dimension?.weight ?? 0.1) / 0.2) * 5;
  const score = dimensionScores.find((item) => item.dimensionId === dimensionId);
  const gapPart = score && score.status === "SCORED" ? ((100 - score.score) / 100) * 5 : 3;
  return Math.min(5, (weightPart + gapPart) / 2);
}

export function rankPriorities(
  indicatorScores: IndicatorScore[],
  dimensionScores: DimensionScore[],
  flags: TriggeredFlag[],
  limit = 3,
): Priority[] {
  const candidates = new Map<string, Candidate>();

  const addCandidate = (indicatorId: string, options: { flag?: TriggeredFlag }) => {
    const indicator = INDICATORS.find((item) => item.id === indicatorId);
    const score = indicatorScores.find((item) => item.indicatorId === indicatorId);
    if (!indicator || !score || !score.applicable || score.rawScore === null) return;
    if (!options.flag && score.rawScore > 2) return;

    const severity = options.flag
      ? SEVERITY_VALUE[options.flag.severity]
      : severityFromRawScore(score.rawScore);
    const existing = candidates.get(indicatorId);
    const candidate: Candidate = {
      indicatorId,
      dimensionId: indicator.dimensionId,
      severity: Math.max(severity, existing?.severity ?? 0),
      impact: impactFromDimension(indicator.dimensionId, dimensionScores),
      urgency: indicator.urgency,
      actionability: indicator.actionability,
      why: options.flag ? options.flag.userExplanation : indicator.diagnosisWhenLow,
      ...(options.flag ? { linkedFlagId: options.flag.flagId } : {}),
    };
    candidates.set(indicatorId, candidate);
  };

  for (const flag of flags) addCandidate(flag.sourceIndicatorId ?? "", { flag });
  for (const score of indicatorScores) {
    if (score.applicable && score.rawScore !== null && score.rawScore <= 2) {
      addCandidate(score.indicatorId, {});
    }
  }

  return [...candidates.values()]
    .map((candidate) => ({
      candidate,
      priorityScore:
        candidate.severity * WEIGHTS.severity +
        candidate.impact * WEIGHTS.impact +
        candidate.urgency * WEIGHTS.urgency +
        candidate.actionability * WEIGHTS.actionability,
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, limit)
    .map(({ candidate, priorityScore }, index) => {
      const indicator = INDICATORS.find((item) => item.id === candidate.indicatorId);
      return {
        rank: index + 1,
        indicatorId: candidate.indicatorId,
        dimensionId: candidate.dimensionId,
        title: indicator?.recommendation.split(";")[0]?.trim() ?? indicator?.name ?? candidate.indicatorId,
        why: candidate.why,
        whatToDo: indicator?.actionSteps[0] ?? indicator?.recommendation ?? "",
        priorityScore: Number(priorityScore.toFixed(4)),
        components: {
          severity: candidate.severity,
          impact: Number(candidate.impact.toFixed(2)),
          urgency: candidate.urgency,
          actionability: candidate.actionability,
        },
        ...(candidate.linkedFlagId ? { linkedFlagId: candidate.linkedFlagId } : {}),
      };
    });
}

/** Rencana 30 hari: tiap prioritas menyumbang satu langkah per minggu. */
export function buildActionPlan(priorities: Priority[]): ActionItem[] {
  const items: ActionItem[] = [];
  for (const priority of priorities) {
    const indicator = INDICATORS.find((item) => item.id === priority.indicatorId);
    if (!indicator) continue;
    indicator.actionSteps.slice(0, 4).forEach((step, index) => {
      const week = (index + 1) as 1 | 2 | 3 | 4;
      items.push({
        id: `${indicator.id}-W${week}`,
        title: step,
        description: `Terkait Prioritas #${priority.rank}: ${priority.title}`,
        priorityRank: priority.rank,
        weekNumber: week,
        completionCriteria: "Selesai bila langkah ini benar-benar dikerjakan dan hasilnya tercatat.",
        status: "todo",
      });
    });
  }
  return items.sort((a, b) => a.weekNumber - b.weekNumber || a.priorityRank - b.priorityRank);
}
