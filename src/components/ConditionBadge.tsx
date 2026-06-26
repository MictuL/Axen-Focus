import { conditionTone } from "../lib/evaluation";
import type { FocusTrendCondition, OperationalCondition } from "../types";

export function ConditionBadge({ condition }: { condition: OperationalCondition | FocusTrendCondition }) {
  const tone = condition === "Sin histórico suficiente" ? "neutral" : conditionTone(condition);
  return (
    <span className={`status-badge ${tone}`}>
      <span className="status-dot" />
      {condition}
    </span>
  );
}
