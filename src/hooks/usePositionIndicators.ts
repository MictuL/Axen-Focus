import { useState } from "react";
import { matchesWeeklyIndicatorReset, type EvaluationResetRequest } from "../lib/evaluationReset";
import { getEvaluationPeriod } from "../lib/evaluationSchedule";
import { calculateWeeklyIndicatorCondition, calculateWeeklyPositionIndicatorScore, normalizeIndicatorResult, normalizeWeeklyPositionIndicatorRecord } from "../lib/positionIndicators";
import type {
  PlatformRole,
  PositionIndicatorActivation,
  WeeklyPositionIndicatorEvaluation,
  WeeklyPositionIndicatorResult,
} from "../types";

const ACTIVATIONS_KEY = "axen-position-indicator-activations-v1";
const RECORDS_KEY = "axen-position-indicator-records-v1";

function load<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback)) as T;
  } catch {
    return fallback;
  }
}

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function getWeekBounds(date: string) {
  const base = new Date(`${date}T00:00:00`);
  const day = base.getDay() || 7;
  const start = new Date(base);
  start.setDate(base.getDate() - day + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export function usePositionIndicators() {
  const [activations, setActivations] = useState<PositionIndicatorActivation[]>(() => load(ACTIVATIONS_KEY, []));
  const [records, setRecords] = useState<WeeklyPositionIndicatorEvaluation[]>(() => load<WeeklyPositionIndicatorEvaluation[]>(RECORDS_KEY, []).map(normalizeWeeklyPositionIndicatorRecord));

  function saveActivations(next: PositionIndicatorActivation[]) {
    setActivations(next);
    localStorage.setItem(ACTIVATIONS_KEY, JSON.stringify(next));
  }

  function saveRecords(next: WeeklyPositionIndicatorEvaluation[]) {
    const ordered = [...next]
      .map(normalizeWeeklyPositionIndicatorRecord)
      .sort((left, right) => right.weekStartDate.localeCompare(left.weekStartDate) || right.createdAt.localeCompare(left.createdAt));
    setRecords(ordered);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(ordered));
    return ordered;
  }

  function setActivation(input: {
    businessUnitId: string;
    collaboratorProfileId: string;
    enabled: boolean;
    evaluatorRole?: PlatformRole;
    positionId: string;
  }) {
    const now = new Date().toISOString();
    const existing = activations.find((item) => item.collaboratorProfileId === input.collaboratorProfileId && item.positionId === input.positionId);
    const activation: PositionIndicatorActivation = {
      id: existing?.id ?? createId("PIA"),
      businessUnitId: input.businessUnitId,
      collaboratorProfileId: input.collaboratorProfileId,
      positionId: input.positionId,
      enabled: input.enabled,
      evaluatorRole: input.evaluatorRole ?? existing?.evaluatorRole ?? "Director de Unidad",
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    saveActivations(existing
      ? activations.map((item) => item.id === activation.id ? activation : item)
      : [...activations, activation]);
    return activation;
  }

  function saveWeeklyEvaluation(input: {
    businessUnitId: string;
    collaboratorProfileId: string;
    date: string;
    evaluatorName?: string;
    goalAssignmentId?: string;
    goalEffectiveDate?: string;
    goalLabel?: string;
    goalTargetValue?: number;
    indicators: Array<Omit<WeeklyPositionIndicatorResult, "semaphore" | "result"> & { result?: unknown }>;
    positionId: string;
  }) {
    const indicators = input.indicators.map(normalizeIndicatorResult);
    if (!indicators.length) throw new Error("El puesto necesita al menos un indicador.");
    if (indicators.some((indicator) => !indicator.indicatorName.trim())) throw new Error("Cada indicador necesita nombre.");
    const period = getEvaluationPeriod(input.date);
    const weekBounds = getWeekBounds(input.date);
    const duplicate = records.find((record) =>
      record.collaboratorProfileId === input.collaboratorProfileId
      && record.positionId === input.positionId
      && record.week === period.period
    );
    if (duplicate) throw new Error(`Este colaborador ya tiene indicadores guardados en ${period.period}.`);
    const weightedScore = calculateWeeklyPositionIndicatorScore(indicators);
    const previous = records
      .filter((record) => record.collaboratorProfileId === input.collaboratorProfileId && record.positionId === input.positionId && record.weekStartDate < weekBounds.start)
      .sort((left, right) => left.weekStartDate.localeCompare(right.weekStartDate))
      .map((record) => ({ date: record.weekStartDate, weightedScore: record.weightedScore }));
    const condition = calculateWeeklyIndicatorCondition(weightedScore, previous, indicators.length);
    const now = new Date().toISOString();
    const record: WeeklyPositionIndicatorEvaluation = {
      id: createId("WPI"),
      businessUnitId: input.businessUnitId,
      collaboratorProfileId: input.collaboratorProfileId,
      evaluatorName: input.evaluatorName?.trim() || "Evaluación directiva",
      positionId: input.positionId,
      goalAssignmentId: input.goalAssignmentId,
      goalEffectiveDate: input.goalEffectiveDate,
      goalLabel: input.goalLabel,
      goalTargetValue: input.goalTargetValue,
      week: period.period,
      weekStartDate: weekBounds.start,
      weekEndDate: weekBounds.end,
      indicators,
      weightedScore,
      weeklyCondition: condition.weeklyCondition,
      weeklyConditionColor: condition.weeklyConditionColor,
      weeklyConditionDescription: condition.weeklyConditionDescription,
      source: "position-indicators",
      createdAt: now,
      updatedAt: now,
    };
    saveRecords([record, ...records]);
    return record;
  }

  function removeRecordsByReset(request: EvaluationResetRequest) {
    const removed = records.filter((record) => matchesWeeklyIndicatorReset(record, request));
    if (removed.length) {
      const removedIds = new Set(removed.map((record) => record.id));
      saveRecords(records.filter((record) => !removedIds.has(record.id)));
    }
    return removed.length;
  }

  function clearRecords() {
    saveRecords([]);
  }

  return { activations, records, clearRecords, removeRecordsByReset, saveWeeklyEvaluation, setActivation };
}
