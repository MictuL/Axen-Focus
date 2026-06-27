import type { DocumentRecord, Evaluation, OperationalGoalAssignment, UnitConditionReview, WeeklyPositionIndicatorEvaluation } from "../types";

export type EvaluationResetScope = "all" | "week" | "month" | "year";

export type EvaluationResetRequest = {
  businessUnitId: string;
  scope: EvaluationResetScope;
  referenceDate: string;
};

export type EvaluationResetResult = {
  evaluations: number;
  documents: number;
  goals: number;
  indicatorRecords: number;
  reviews: number;
  total: number;
};

function atNoon(date: string) {
  return new Date(`${date}T12:00:00`);
}

function dateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getEvaluationResetRange(scope: EvaluationResetScope, referenceDate: string) {
  if (scope === "all") return { start: "", end: "", label: "Todo el histórico" };

  const reference = atNoon(referenceDate);
  if (Number.isNaN(reference.getTime())) return { start: "", end: "", label: "Periodo inválido" };

  if (scope === "week") {
    const day = reference.getDay() || 7;
    const start = new Date(reference);
    start.setDate(reference.getDate() - day + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: dateString(start), end: dateString(end), label: `${dateString(start)} al ${dateString(end)}` };
  }

  if (scope === "month") {
    const start = new Date(reference.getFullYear(), reference.getMonth(), 1, 12);
    const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 0, 12);
    const label = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(reference);
    return { start: dateString(start), end: dateString(end), label: label.replace(/^./, (letter) => letter.toUpperCase()) };
  }

  return {
    start: `${reference.getFullYear()}-01-01`,
    end: `${reference.getFullYear()}-12-31`,
    label: String(reference.getFullYear()),
  };
}

export function matchesEvaluationReset(evaluation: Evaluation, request: EvaluationResetRequest) {
  if (request.businessUnitId && evaluation.businessUnitId !== request.businessUnitId) return false;
  if (request.scope === "all") return true;
  const range = getEvaluationResetRange(request.scope, request.referenceDate);
  return Boolean(range.start && evaluation.date >= range.start && evaluation.date <= range.end);
}

function matchesResetDate(value: string | undefined, request: EvaluationResetRequest) {
  if (request.scope === "all") return true;
  const date = value?.slice(0, 10);
  if (!date) return false;
  const range = getEvaluationResetRange(request.scope, request.referenceDate);
  return Boolean(range.start && date >= range.start && date <= range.end);
}

export function matchesDocumentReset(document: DocumentRecord, request: EvaluationResetRequest, evaluationIds: Set<string> = new Set()) {
  if (document.linkedEvaluationId && evaluationIds.has(document.linkedEvaluationId)) return true;
  if (request.businessUnitId && document.businessUnitId !== request.businessUnitId) return false;
  return [
    document.values?.date,
    document.values?.["field::Fecha"],
    document.digitalCapturedAt,
    document.printedAt,
    document.createdAt,
    document.updatedAt,
  ].some((date) => matchesResetDate(date, request));
}

export function matchesUnitConditionReviewReset(review: UnitConditionReview, request: EvaluationResetRequest, evaluationIds: Set<string> = new Set()) {
  if (review.evaluationIds.some((id) => evaluationIds.has(id))) return true;
  if (request.businessUnitId && review.businessUnitId !== request.businessUnitId) return false;
  if (request.scope === "all") return true;
  return matchesResetDate(review.date, request) || matchesResetDate(review.createdAt, request);
}

export function matchesWeeklyIndicatorReset(record: WeeklyPositionIndicatorEvaluation, request: EvaluationResetRequest) {
  if (request.businessUnitId && record.businessUnitId !== request.businessUnitId) return false;
  if (request.scope === "all") return true;
  return [
    record.weekStartDate,
    record.weekEndDate,
    record.createdAt,
    record.updatedAt,
  ].some((date) => matchesResetDate(date, request));
}

export function matchesOperationalGoalReset(goal: OperationalGoalAssignment, request: EvaluationResetRequest) {
  if (request.businessUnitId && goal.businessUnitId !== request.businessUnitId) return false;
  if (request.scope === "all") return true;
  return [
    goal.effectiveDate,
    goal.periodStartDate,
    goal.periodEndDate,
    goal.createdAt,
    goal.updatedAt,
  ].some((date) => matchesResetDate(date, request));
}
