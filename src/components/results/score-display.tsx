import { cn } from "@/lib/utils";
import type { Severity, StatusTone } from "@/types/assessment";

const toneClass: Record<StatusTone, string> = {
  critical: "bg-critical-soft text-critical border-critical/30",
  warning: "bg-warning-soft text-warning border-warning/30",
  fair: "bg-fair-soft text-fair-foreground border-fair/40",
  healthy: "bg-healthy-soft text-healthy border-healthy/30",
  excellent: "bg-excellent-soft text-excellent border-excellent/30",
};

export function toneForScore(score: number): StatusTone {
  if (score < 40) return "critical";
  if (score < 55) return "warning";
  if (score < 70) return "fair";
  if (score < 85) return "healthy";
  return "excellent";
}

export function StatusBadge({ tone, label, className }: { tone: StatusTone; label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold",
        toneClass[tone],
        className,
      )}
    >
      <span aria-hidden="true" className="size-2 rounded-full bg-current" />
      {label}
    </span>
  );
}

const severityLabel: Record<Severity, string> = {
  critical: "Risiko kritis",
  high: "Risiko tinggi",
  medium: "Perlu perhatian",
  low: "Catatan",
};

const severityTone: Record<Severity, StatusTone> = {
  critical: "critical",
  high: "warning",
  medium: "fair",
  low: "healthy",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <StatusBadge tone={severityTone[severity]} label={severityLabel[severity]} />;
}

export function ScoreBar({ score, label }: { score: number; label: string }) {
  const tone = toneForScore(score);
  const barColor: Record<StatusTone, string> = {
    critical: "bg-critical",
    warning: "bg-warning",
    fair: "bg-fair",
    healthy: "bg-healthy",
    excellent: "bg-excellent",
  };
  return (
    <div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`${label}: ${score} dari 100`}
      >
        <div className={cn("h-full rounded-full", barColor[tone])} style={{ width: `${Math.max(2, score)}%` }} />
      </div>
    </div>
  );
}
