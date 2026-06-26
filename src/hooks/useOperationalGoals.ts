import { useState } from "react";
import { matchesOperationalGoalReset, type EvaluationResetRequest } from "../lib/evaluationReset";
import { getGoalPeriodBounds, inferGoalValueKind, normalizeGoalAllocationPercent } from "../lib/goals";
import type { OperationalGoalAssignment } from "../types";

const STORAGE_KEY = "axen-operational-goals-v1";

function loadGoals() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as OperationalGoalAssignment[];
  } catch {
    return [];
  }
}

function createGoalId() {
  return `GOAL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function normalizeGoal(input: OperationalGoalAssignment) {
  const cadence = input.cadence ?? "week";
  const bounds = getGoalPeriodBounds(input.effectiveDate, cadence);
  const valueKind = input.valueKind ?? inferGoalValueKind(input.unitIndicatorName ?? input.goalLabel);
  const targetValue = valueKind === "percentage" ? 100 : Math.max(0, Math.round(Number(input.targetValue) || 0));
  const allocationPercent = input.allocationPercent === undefined
    ? undefined
    : normalizeGoalAllocationPercent(input.allocationPercent);
  const sourceTargetValue = input.sourceTargetValue === undefined
    ? undefined
    : Math.max(0, Math.round(Number(input.sourceTargetValue) || 0));
  return {
    ...input,
    allocationPercent,
    cadence,
    periodStartDate: input.periodStartDate ?? bounds.startDate,
    periodEndDate: input.periodEndDate ?? bounds.endDate,
    sourceTargetValue,
    targetValue,
    goalLabel: input.goalLabel.trim() || "Meta de cumplimiento",
    unitIndicatorName: input.unitIndicatorName?.trim() || input.goalLabel.trim() || undefined,
    valueKind,
    notes: input.notes.trim(),
    revision: input.revision ?? 0,
  };
}

export function useOperationalGoals() {
  const [goals, setGoals] = useState<OperationalGoalAssignment[]>(() => loadGoals().map(normalizeGoal));

  function save(next: OperationalGoalAssignment[]) {
    const ordered = [...next]
      .map(normalizeGoal)
      .sort((left, right) =>
        right.effectiveDate.localeCompare(left.effectiveDate)
        || right.updatedAt.localeCompare(left.updatedAt)
      );
    setGoals(ordered);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ordered));
    return ordered;
  }

  function upsertGoal(input: Omit<OperationalGoalAssignment, "id" | "createdAt" | "updatedAt"> & { id?: string; createdAt?: string }) {
    const now = new Date().toISOString();
    const existingGoal = input.id ? goals.find((item) => item.id === input.id) : undefined;
    const goal = normalizeGoal({
      ...input,
      id: input.id || createGoalId(),
      createdAt: input.createdAt || now,
      revision: existingGoal ? (existingGoal.revision ?? 0) + 1 : input.revision ?? 0,
      updatedAt: now,
    });
    const exists = goals.some((item) => item.id === goal.id);
    return save(exists
      ? goals.map((item) => item.id === goal.id ? goal : item)
      : [goal, ...goals]);
  }

  function upsertGoals(inputs: Array<Omit<OperationalGoalAssignment, "id" | "createdAt" | "updatedAt"> & { id?: string; createdAt?: string }>) {
    const now = new Date().toISOString();
    const next = [...goals];
    inputs.forEach((input) => {
      const existingIndex = input.id ? next.findIndex((item) => item.id === input.id) : -1;
      const existingGoal = existingIndex >= 0 ? next[existingIndex] : undefined;
      const goal = normalizeGoal({
        ...input,
        id: input.id || createGoalId(),
        createdAt: input.createdAt || now,
        revision: existingGoal ? (existingGoal.revision ?? 0) + 1 : input.revision ?? 0,
        updatedAt: now,
      });
      if (existingIndex >= 0) {
        next[existingIndex] = goal;
      } else {
        next.unshift(goal);
      }
    });
    return save(next);
  }

  function deactivateGoal(id: string) {
    return save(goals.map((item) => item.id === id ? { ...item, status: "inactive", updatedAt: new Date().toISOString() } : item));
  }

  function removeGoalsByReset(request: EvaluationResetRequest) {
    const removed = goals.filter((goal) => matchesOperationalGoalReset(goal, request));
    if (removed.length) {
      const removedIds = new Set(removed.map((goal) => goal.id));
      save(goals.filter((goal) => !removedIds.has(goal.id)));
    }
    return removed.length;
  }

  function clearGoals() {
    save([]);
  }

  return { clearGoals, deactivateGoal, goals, removeGoalsByReset, upsertGoal, upsertGoals };
}
