import type { GoalCadence, IndicatorMeasurementKind, IndicatorValueKind, OperationalGoalAssignment, Position } from "../types";

export type UnitGoalIndicatorOption = {
  id: string;
  name: string;
  description?: string;
  measurementKind?: IndicatorMeasurementKind;
  valueKind: IndicatorValueKind;
};

const insignificantTokens = new Set([
  "cantidad",
  "porcentaje",
  "meta",
  "metas",
  "cumplimiento",
  "realizadas",
  "realizados",
  "realizada",
  "realizado",
  "ejecutadas",
  "ejecutados",
  "colocados",
  "colocadas",
  "nivel",
  "total",
]);

function dateAtNoon(value: string) {
  return new Date(`${value.slice(0, 10)}T12:00:00`);
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

function periodEndAfterCalendarMonths(start: Date, months: number) {
  const targetMonthIndex = start.getMonth() + months;
  const targetYear = start.getFullYear() + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const lastTargetDay = new Date(targetYear, targetMonth + 1, 0, 12).getDate();
  if (start.getDate() > lastTargetDay) return new Date(targetYear, targetMonth, lastTargetDay, 12);
  if (start.getDate() === 1) return new Date(targetYear, targetMonth, 0, 12);
  return new Date(targetYear, targetMonth, start.getDate() - 1, 12);
}

export function normalizeGoalText(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-MX")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function goalTokens(value = "") {
  return normalizeGoalText(value)
    .split(" ")
    .filter((token) => token.length > 3 && !insignificantTokens.has(token));
}

export function inferGoalValueKind(name = "", measurementKind?: IndicatorMeasurementKind): IndicatorValueKind {
  if (measurementKind === "quantity") return "quantity";
  return normalizeGoalText(name).startsWith("cantidad") ? "quantity" : "percentage";
}

export function resolveIndicatorValueKind(input: {
  goalValueKind?: IndicatorValueKind;
  indicatorName?: string;
  measurementKind?: IndicatorMeasurementKind;
  valueKind?: IndicatorValueKind;
}): IndicatorValueKind {
  if (input.goalValueKind) return input.goalValueKind;
  if (input.valueKind) return input.valueKind;
  return inferGoalValueKind(input.indicatorName, input.measurementKind);
}

export function getGoalPeriodBounds(effectiveDate: string, cadence: GoalCadence = "week") {
  const start = dateAtNoon(effectiveDate);
  if (cadence === "year") return { startDate: isoDate(start), endDate: isoDate(periodEndAfterCalendarMonths(start, 12)) };
  if (cadence === "month") return { startDate: isoDate(start), endDate: isoDate(periodEndAfterCalendarMonths(start, 1)) };
  return { startDate: isoDate(start), endDate: isoDate(addDays(start, 6)) };
}

function storedGoalPeriodBounds(goal: Pick<OperationalGoalAssignment, "cadence" | "effectiveDate" | "periodStartDate" | "periodEndDate">) {
  const fallback = getGoalPeriodBounds(goal.effectiveDate, goal.cadence ?? "week");
  return {
    startDate: goal.periodStartDate ?? fallback.startDate,
    endDate: goal.periodEndDate ?? fallback.endDate,
  };
}

export function goalIsActiveOnDate(goal: Pick<OperationalGoalAssignment, "cadence" | "effectiveDate" | "periodStartDate" | "periodEndDate">, date: string) {
  const bounds = storedGoalPeriodBounds(goal);
  const value = isoDate(dateAtNoon(date));
  return value >= bounds.startDate && value <= bounds.endDate;
}

export function isSameGoalPeriod(goal: Pick<OperationalGoalAssignment, "cadence" | "effectiveDate" | "periodStartDate" | "periodEndDate">, date: string) {
  const goalBounds = storedGoalPeriodBounds(goal);
  const dateBounds = getGoalPeriodBounds(date, goal.cadence ?? "week");
  return goalIsActiveOnDate(goal, date)
    || (goalBounds.startDate === dateBounds.startDate && goalBounds.endDate === dateBounds.endDate);
}

function inclusiveDays(startDate: string, endDate: string) {
  const start = dateAtNoon(startDate).getTime();
  const end = dateAtNoon(endDate).getTime();
  return Math.max(1, Math.round((end - start) / 86400000) + 1);
}

function roundGoalValue(value: number) {
  return Math.round(value * 100) / 100;
}

export function normalizeGoalAllocationPercent(value: number | string | undefined) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 100;
  return Math.min(100, Math.max(0, roundGoalValue(parsed)));
}

export function calculateAllocatedGoalTarget(
  parentGoal: Pick<OperationalGoalAssignment, "targetValue" | "valueKind">,
  allocationPercent: number | string | undefined,
) {
  if (parentGoal.valueKind === "percentage") return parentGoal.targetValue;
  return Math.max(0, roundGoalValue(parentGoal.targetValue * (normalizeGoalAllocationPercent(allocationPercent) / 100)));
}

export function getGoalTargetBreakdown(goal: Pick<OperationalGoalAssignment, "cadence" | "effectiveDate" | "periodStartDate" | "periodEndDate" | "targetValue">) {
  const cadence = goal.cadence ?? "week";
  const fallback = getGoalPeriodBounds(goal.effectiveDate, cadence);
  const startDate = goal.periodStartDate ?? fallback.startDate;
  const endDate = goal.periodEndDate ?? fallback.endDate;
  const days = inclusiveDays(startDate, endDate);
  const weeks = Math.max(1, Math.ceil(days / 7));
  const months = cadence === "year" ? 12 : cadence === "month" ? 1 : Math.max(1, Math.round(days / 30));
  return {
    cadence,
    startDate,
    endDate,
    days,
    weeks,
    months,
    dailyTarget: roundGoalValue(goal.targetValue / days),
    weeklyTarget: roundGoalValue(goal.targetValue / weeks),
    monthlyTarget: roundGoalValue(goal.targetValue / months),
  };
}

export function formatGoalCadence(cadence: GoalCadence = "week") {
  if (cadence === "year") return "Anual";
  if (cadence === "month") return "Mensual";
  return "Semanal";
}

export function goalAppliesToPosition(goal: OperationalGoalAssignment, position?: Position) {
  if (!goal.unitIndicatorName) return true;
  if (!position) return true;
  const explicitLinks = position.unitIndicatorLinks?.map(normalizeGoalText).filter(Boolean) ?? [];
  if (explicitLinks.length) {
    return explicitLinks.includes(normalizeGoalText(goal.unitIndicatorName));
  }
  const tokens = goalTokens(goal.unitIndicatorName);
  if (!tokens.length) return true;
  const positionText = normalizeGoalText([
    position.name,
    position.area,
    position.rep,
    ...(position.unitIndicatorLinks ?? []),
    ...position.kpis.map((kpi) => `${kpi.name} ${kpi.description}`),
  ].join(" "));
  return tokens.some((token) => positionText.includes(token));
}

export function buildUnitGoalIndicators(position?: Position): UnitGoalIndicatorOption[] {
  return (position?.kpis ?? [])
    .map((kpi, index) => ({
      description: kpi.description,
      id: `${position?.id ?? "unit"}::${index}`,
      measurementKind: kpi.measurementKind,
      name: kpi.name,
      valueKind: inferGoalValueKind(kpi.name, kpi.measurementKind),
    }))
    .filter((indicator) => ["unit-indicator", "quantity"].includes(indicator.measurementKind ?? "") || normalizeGoalText(indicator.name).startsWith("porcentaje"));
}

export function periodLabelForGoal(goal: Pick<OperationalGoalAssignment, "cadence" | "effectiveDate" | "periodStartDate" | "periodEndDate">) {
  const bounds = storedGoalPeriodBounds(goal);
  return `${dateAtNoon(bounds.startDate).toLocaleDateString("es-MX")} - ${dateAtNoon(bounds.endDate).toLocaleDateString("es-MX")}`;
}
