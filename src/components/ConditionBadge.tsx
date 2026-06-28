import { cx } from "../lib/classNames";
import { conditionTone } from "../lib/evaluation";
import type { FocusTrendCondition, OperationalCondition } from "../types";

type BadgeTone = "critical" | "risk" | "watch" | "good" | "excellent" | "power" | "neutral";

const toneClasses: Record<BadgeTone, { chip: string; dot: string }> = {
  critical: { chip: "border-[#f2c7c2] bg-[#fbe3e1] text-[#a82f26]", dot: "bg-[#c94b4b]" },
  risk: { chip: "border-[#f1d1b4] bg-[#fff0e2] text-[#9f4d20]", dot: "bg-[#c56a2c]" },
  watch: { chip: "border-[#efd58f] bg-[#fff6e0] text-[#8a6812]", dot: "bg-[#b88418]" },
  good: { chip: "border-[#c7def2] bg-[#eef6ff] text-[#0a4d82]", dot: "bg-[#0071ce]" },
  excellent: { chip: "border-[#dbe8a8] bg-[#eff7d6] text-[#4f792a]", dot: "bg-[#6c9332]" },
  power: { chip: "border-[#bfe3ce] bg-[#eaf6ef] text-[#1f7656]", dot: "bg-[#1f8a5b]" },
  neutral: { chip: "border-[#d4e2ec] bg-[#eef4f8] text-[#4c5d73]", dot: "bg-[#7d90a3]" },
};

export function ConditionBadge({ condition }: { condition: OperationalCondition | FocusTrendCondition }) {
  const tone = (condition === "Sin histórico suficiente" ? "neutral" : conditionTone(condition)) as BadgeTone;

  return (
    <span
      className={cx(
        "condition-badge inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-[5px] text-[10px] font-extrabold uppercase tracking-[0.08em]",
        toneClasses[tone].chip,
      )}
    >
      <span aria-hidden="true" className={cx("h-[7px] w-[7px] rounded-full", toneClasses[tone].dot)} />
      {condition.toLocaleUpperCase("es-MX")}
    </span>
  );
}
