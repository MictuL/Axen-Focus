import { cx } from "../lib/classNames";
import { conditionTone } from "../lib/evaluation";
import type { FocusTrendCondition, OperationalCondition } from "../types";

type BadgeTone = "critical" | "risk" | "watch" | "good" | "excellent" | "power" | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  critical: "border-[#f2c7c2] bg-[#ffebe9] text-[#b43c33]",
  risk: "border-[#f1d1b4] bg-[#fff0e2] text-[#bc5c2a]",
  watch: "border-[#f0dfaa] bg-[#fff6db] text-[#96732e]",
  good: "border-[#c3e2d8] bg-[#e3f3ee] text-[#35726b]",
  excellent: "border-[#dbe8a8] bg-[#eff7d6] text-[#4f792a]",
  power: "border-[#a9d9f5] bg-[#e3f4ff] text-[#075d98] shadow-[0_0_0_2px_rgba(0,113,206,0.08)]",
  neutral: "border-[#d4e2ec] bg-[#eef4f8] text-[#536b82]",
};

export function ConditionBadge({ condition }: { condition: OperationalCondition | FocusTrendCondition }) {
  const tone = (condition === "Sin histórico suficiente" ? "neutral" : conditionTone(condition)) as BadgeTone;

  return (
    <span
      className={cx(
        "condition-badge inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-[5px] text-[10px] font-extrabold",
        toneClasses[tone],
      )}
    >
      <span aria-hidden="true" className="h-[7px] w-[7px] rounded-full bg-current" />
      {condition}
    </span>
  );
}
