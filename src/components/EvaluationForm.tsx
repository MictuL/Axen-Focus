import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  calculateStatistic,
  conditionFormula,
  getCollaboratorEvaluationHistory,
  getEvaluationProfileKey,
  getEvaluationTrendScore,
  normalizeName,
} from "../lib/evaluation";
import {
  calculateFocusDailyScore,
  FOCUS_DAILY_PRIORITIES,
  FOCUS_DAILY_STATUSES,
  focusDailyActivityRequiresReason,
  getFocusDailyActivitySemaphore,
  getFocusFormula,
  normalizeFocusDailyPriority,
  normalizeFocusDailyStatus,
} from "../lib/focusDaily";
import { chartAxisMaximum, withZeroBaseline } from "../lib/chartSeries";
import { getOperationalLevel, groupByOperationalLevel, isPositionReady } from "../lib/catalog";
import { formatChartPointDate } from "../lib/dateLabels";
import { getEvaluationPeriod } from "../lib/evaluationSchedule";
import { getPositionProfileId } from "../lib/fundacionAccess";
import { formatGoalCadence, getGoalTargetBreakdown, goalAppliesToPosition, goalIsActiveOnDate, periodLabelForGoal } from "../lib/goals";
import type {
  BusinessUnit,
  CollaboratorProfile,
  Evaluation,
  EvaluationDraft,
  EvaluationMeasurementMode,
  EvaluationStatistic,
  EvaluationStatisticDraft,
  FocusSettings,
  FocusTrendCondition,
  OperationalGoalAssignment,
  OperationalCondition,
  Position,
} from "../types";
import { ConditionBadge } from "./ConditionBadge";
import { Icon } from "./Icon";

interface Props {
  units: BusinessUnit[];
  positions: Position[];
  evaluations: Evaluation[];
  goalAssignments: OperationalGoalAssignment[];
  profiles: CollaboratorProfile[];
  lockedUnitId?: string;
  lockedPositionId?: string;
  lockedProfileId?: string;
  lockedProfileName?: string;
  focusSettings: FocusSettings;
  onSubmit: (draft: EvaluationDraft) => Evaluation;
}

const today = new Date().toISOString().slice(0, 10);
const currentPeriod = getEvaluationPeriod(today);
const steps = [
  { number: "01", title: "Perfil", helper: "Fecha y contexto" },
  { number: "02", title: "Actividades", helper: "Qué ocurrió" },
  { number: "03", title: "Condición", helper: "Qué haremos" },
];
const activityStatusOptions = FOCUS_DAILY_STATUSES;
const activityPriorityOptions = [
  { value: FOCUS_DAILY_PRIORITIES[0], label: "Crítica" },
  { value: FOCUS_DAILY_PRIORITIES[1], label: "Alta" },
  { value: FOCUS_DAILY_PRIORITIES[2], label: "Media" },
  { value: FOCUS_DAILY_PRIORITIES[3], label: "Baja" },
];
const focusTrendToOperationalCondition = (condition: FocusTrendCondition): OperationalCondition =>
  condition === "Sin histórico suficiente" ? "Inexistencia" : condition;

const isPositionIndicatorReference = (kpi: Position["kpis"][number]) => {
  const sourceNote = kpi.sourceNote?.toLocaleLowerCase("es-MX") ?? "";
  return Boolean(kpi.name.trim())
    && !sourceNote.includes("indicador general de la unidad")
    && kpi.measurementKind !== "unit-indicator";
};

type PositionIndicatorReference = Pick<Position["kpis"][number], "name" | "description">;

const DEFAULT_REP_INDICATOR_REFERENCE: PositionIndicatorReference = {
  name: "Cumplimiento del REP",
  description: "% de cumplimiento del REP basado en el Focus del puesto.",
};

type ValidationTarget = {
  field: string;
  index?: number;
};

type StepValidation = {
  message: string;
  target?: ValidationTarget;
};

const blankStatistic = (name = "", description = ""): EvaluationStatisticDraft => ({
  name,
  description,
  measurementUnit: "%",
  measurementMode: "percentage",
  activityStatus: "No iniciado",
  activityPriority: "Importante – urgente",
  deadline: "",
  currentSelection: "No iniciado",
  previousValue: 0,
  currentValue: 0,
  targetValue: 100,
});

function statisticsForPosition(): EvaluationStatisticDraft[] {
  return [blankStatistic()];
}

function createDraft(units: BusinessUnit[], positions: Position[], preferredUnitId?: string): EvaluationDraft {
  const unitId = preferredUnitId || units.find((item) => item.status === "active")?.id || "";
  const firstPosition = positions.find((item) => item.businessUnitId === unitId && isPositionReady(item));
  return {
    collaboratorProfileId: firstPosition ? getPositionProfileId(firstPosition.id) : "",
    documentFolio: "",
    subjectType: "collaborator",
    businessUnitId: unitId,
    area: firstPosition?.area ?? "",
    positionId: firstPosition?.id ?? "",
    evaluatedPersonName: firstPosition?.name ?? "",
    evaluatorName: "",
    date: today,
    period: currentPeriod.period,
    week: currentPeriod.week,
    month: currentPeriod.month,
    season: currentPeriod.season,
    captureSource: "Digital",
    physicalFormatId: "",
    physicalFormatCode: "",
    physicalFormatTitle: "",
    productDefinition: firstPosition?.rep ?? "",
    statistics: statisticsForPosition(),
    problemStatement: "",
    dataAnalysis: "",
    solutionPlan: "",
    nextTarget: 0,
    observations: "",
    followUpDate: "",
  };
}

function numberValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function percentageValue(value: string) {
  return Math.min(100, numberValue(value.replace(/^0+(?=\d)/, "")));
}

function measurementValueLabel(
  measurementMode: EvaluationMeasurementMode | undefined,
  value: number,
  selection?: string,
  measurementUnit?: string,
) {
  if (selection && measurementMode === "percentage") return `${value}% · ${selection}`;
  if (selection) return selection;
  if (measurementMode === "scale-1-5") return `${value} de 5`;
  if (measurementMode === "percentage") return `${value}%`;
  if ((measurementMode ?? "numeric") === "numeric") return `${value} ${measurementUnit || "unidades"}`;
  return String(value);
}

function getActivityStatus(item: Pick<EvaluationStatisticDraft, "activityStatus" | "currentValue">) {
  return normalizeFocusDailyStatus(item.activityStatus || (item.currentValue >= 100 ? "Completado" : item.currentValue > 0 ? "En proceso" : "No iniciado"));
}

function getActivitySemaphore(item: EvaluationStatisticDraft) {
  return getFocusDailyActivitySemaphore(item);
}

function isCompletedFocusActivity(item: Pick<EvaluationStatisticDraft, "activityStatus" | "currentValue">) {
  return getActivityStatus(item) === "Completado";
}

function getActivityHistoryTone(item: Pick<EvaluationStatisticDraft, "activityStatus" | "currentValue">) {
  const status = getActivityStatus(item);
  if (status === "Completado") return "green";
  if (status === "No iniciado") return "red";
  return "yellow";
}

function getActivityHistoryLabel(item: Pick<EvaluationStatisticDraft, "activityStatus" | "currentValue">) {
  const status = getActivityStatus(item);
  if (status === "Completado") return "Cerrada";
  if (status === "No iniciado") return "No iniciada";
  return "En proceso";
}

function buildFollowUpActivityDraft(item: EvaluationStatistic): EvaluationStatisticDraft {
  const activityStatus = getActivityStatus(item);
  return {
    name: item.name,
    description: item.description ?? "",
    measurementMode: "percentage",
    measurementUnit: "%",
    activityStatus,
    activityPriority: normalizeFocusDailyPriority(item.activityPriority),
    deadline: item.deadline ?? "",
    previousValue: item.currentValue,
    previousSelection: item.activityStatus ?? item.currentSelection,
    currentValue: item.currentValue,
    currentSelection: activityStatus,
    targetValue: 100,
    targetSelection: "",
  };
}

function goalDisplayText(goal?: OperationalGoalAssignment) {
  if (!goal) return "Meta pendiente de asignar";
  const suffix = goal.valueKind === "quantity" ? "" : "%";
  return `${goal.goalLabel} · ${goal.targetValue}${suffix} · ${formatGoalCadence(goal.cadence)}`;
}

function goalTargetText(goal: OperationalGoalAssignment) {
  const suffix = goal.valueKind === "quantity" ? "" : "%";
  return `${goal.targetValue}${suffix}`;
}

function goalComparisonReadout(goal: OperationalGoalAssignment) {
  const breakdown = getGoalTargetBreakdown(goal);
  if (goal.valueKind === "quantity") {
    return {
      daily: `${breakdown.dailyTarget} al cierre del día`,
      total: `${goal.targetValue} en el periodo`,
    };
  }
  return {
    daily: `${goal.targetValue}% como referencia diaria`,
    total: `${goal.targetValue}% esperado en el periodo`,
  };
}

export function EvaluationForm({ units, positions, evaluations, goalAssignments, profiles, lockedUnitId, lockedPositionId, lockedProfileId, lockedProfileName, focusSettings, onSubmit }: Props) {
  const [draft, setDraft] = useState(() => createDraft(units, positions, lockedUnitId));
  const [currentStep, setCurrentStep] = useState(0);
  const [notice, setNotice] = useState("");
  const [validationTarget, setValidationTarget] = useState<ValidationTarget | null>(null);
  const [lastResult, setLastResult] = useState<Evaluation | null>(null);
  const [loadedHistoryId, setLoadedHistoryId] = useState("");
  const selectedUnit = units.find((item) => item.id === draft.businessUnitId);
  const activeUnitOptions = units.filter((item) => item.status === "active");
  const showUnitSelector = activeUnitOptions.length > 1 && !lockedProfileId;
  const unitPositions = positions.filter((item) => item.businessUnitId === draft.businessUnitId && isPositionReady(item));
  const positionLevelGroups = groupByOperationalLevel(unitPositions, (item) => item.name);
  const selectedPosition = positions.find((item) => item.id === draft.positionId && item.businessUnitId === draft.businessUnitId);
  const selectedPositionIndicators: PositionIndicatorReference[] = (() => {
    const indicators = selectedPosition?.kpis.filter(isPositionIndicatorReference) ?? [];
    if (indicators.length > 0) return indicators;
    if (selectedPosition && getOperationalLevel(selectedPosition) === "Planeación") {
      return [DEFAULT_REP_INDICATOR_REFERENCE];
    }
    return indicators;
  })();
  const knownProfiles = useMemo(() => {
    return profiles
      .filter((profile) =>
        profile.status === "active"
        && profile.businessUnitId === draft.businessUnitId
        && profile.positionId === draft.positionId
      )
      .map((profile) => {
        const history = evaluations
          .filter((evaluation) => getEvaluationProfileKey(evaluation) === profile.id)
          .sort((left, right) => left.date.localeCompare(right.date));
        return { ...profile, count: history.length, latest: history.at(-1) };
      })
      .sort((left, right) => (right.latest?.date ?? "").localeCompare(left.latest?.date ?? "") || left.name.localeCompare(right.name, "es"));
  }, [draft.businessUnitId, draft.positionId, evaluations, profiles]);
  const selectedProfileId = draft.collaboratorProfileId
    || knownProfiles[0]?.id
    || (draft.positionId ? getPositionProfileId(draft.positionId) : "");
  const activeFocusGoals = useMemo(() => goalAssignments
    .filter((goal) =>
      goal.status === "active"
      && goal.businessUnitId === draft.businessUnitId
      && (!goal.effectiveDate || goalIsActiveOnDate(goal, draft.date))
      && (
        (goal.scope === "unit" && goalAppliesToPosition(goal, selectedPosition))
        || (selectedProfileId && goal.targetProfileId === selectedProfileId)
      )
    )
    .sort((left, right) => {
      const leftDirect = left.targetProfileId === selectedProfileId ? 0 : 1;
      const rightDirect = right.targetProfileId === selectedProfileId ? 0 : 1;
      return leftDirect - rightDirect
        || right.effectiveDate.localeCompare(left.effectiveDate)
        || right.updatedAt.localeCompare(left.updatedAt);
    }), [draft.businessUnitId, draft.date, goalAssignments, selectedPosition, selectedProfileId]);
  const selectedOperationalLevel = selectedPosition ? getOperationalLevel(selectedPosition) : "";
  const requiresAssignedFocusGoal = selectedOperationalLevel === "Ejecución";
  const directFocusGoals = useMemo(
    () => activeFocusGoals.filter((goal) => goal.targetProfileId === selectedProfileId),
    [activeFocusGoals, selectedProfileId],
  );
  const inheritedUnitFocusGoals = useMemo(
    () => activeFocusGoals.filter((goal) => goal.scope === "unit"),
    [activeFocusGoals],
  );
  const activityFocusGoals = requiresAssignedFocusGoal
    ? directFocusGoals.length ? directFocusGoals : inheritedUnitFocusGoals
    : activeFocusGoals;
  const primaryFocusGoal = activityFocusGoals[0];
  const goalComparisonCards = useMemo(() => activityFocusGoals.map((goal) => ({
    goal,
    readout: goalComparisonReadout(goal),
  })), [activityFocusGoals]);
  const subjectEvaluations = useMemo(() => getCollaboratorEvaluationHistory(
    evaluations,
    draft.businessUnitId,
    draft.positionId,
    draft.evaluatedPersonName,
    draft.date,
    selectedProfileId,
  ), [draft.businessUnitId, draft.date, draft.evaluatedPersonName, draft.positionId, evaluations, selectedProfileId]);
  const allSubjectEvaluations = useMemo(() => getCollaboratorEvaluationHistory(
    evaluations,
    draft.businessUnitId,
    draft.positionId,
    draft.evaluatedPersonName,
    undefined,
    selectedProfileId,
  ), [draft.businessUnitId, draft.evaluatedPersonName, draft.positionId, evaluations, selectedProfileId]);
  const comparableEvaluations = useMemo(
    () => subjectEvaluations.filter((item) => item.date !== draft.date),
    [draft.date, subjectEvaluations],
  );
  const hasProfileHistoryOutsideSelectedDate = allSubjectEvaluations.some((item) => item.date !== draft.date);
  const currentPeriodEvaluation = evaluations.find((item) =>
    item.subjectType !== "unit"
    && getEvaluationProfileKey(item) === (selectedProfileId || getEvaluationProfileKey({
      businessUnitId: draft.businessUnitId,
      positionId: draft.positionId,
      evaluatedPersonName: draft.evaluatedPersonName,
    }))
    && item.date === draft.date
  );
  const previousEvaluation = comparableEvaluations.at(-1);
  const latestActivitySnapshots = useMemo(() => {
    const latestByActivity = new Map<string, { statistic: EvaluationStatistic; evaluation: Evaluation; index: number }>();
    [...comparableEvaluations]
      .sort((left, right) => left.date.localeCompare(right.date) || left.id.localeCompare(right.id))
      .forEach((evaluation) => {
        evaluation.statistics?.forEach((statistic, index) => {
          const key = normalizeName(statistic.name);
          if (!key) return;
          latestByActivity.set(key, { statistic, evaluation, index });
        });
      });
    return [...latestByActivity.values()].sort((left, right) =>
      right.evaluation.date.localeCompare(left.evaluation.date) || left.index - right.index
    );
  }, [comparableEvaluations]);
  const followUpActivitySnapshots = useMemo(
    () => latestActivitySnapshots.filter(({ statistic }) => !isCompletedFocusActivity(statistic)),
    [latestActivitySnapshots],
  );
  const followUpActivityCount = followUpActivitySnapshots.length;
  const closedActivityCount = Math.max(0, latestActivitySnapshots.length - followUpActivityCount);

  function findPreviousStatistic(item: EvaluationStatisticDraft) {
    const key = normalizeName(item.name);
    if (!key) return undefined;
    return latestActivitySnapshots.find((snapshot) => normalizeName(snapshot.statistic.name) === key)?.statistic;
  }

  const effectiveStatistics = useMemo(() => draft.statistics.map((item) => {
    const previousStatistic = findPreviousStatistic(item);
    return previousStatistic ? {
      ...item,
      activityStatus: getActivityStatus(item),
      activityPriority: normalizeFocusDailyPriority(item.activityPriority),
      previousValue: previousStatistic.currentValue,
      previousSelection: previousStatistic.currentSelection ?? previousStatistic.activityStatus,
    } : {
      ...item,
      activityStatus: getActivityStatus(item),
      activityPriority: normalizeFocusDailyPriority(item.activityPriority),
      previousValue: item.currentValue,
      previousSelection: item.currentSelection,
    };
  }), [draft.statistics, latestActivitySnapshots]);

  const previousFocusEvaluations = useMemo(() => comparableEvaluations.map((evaluation) => ({
    date: evaluation.date,
    finalScore: getEvaluationTrendScore(evaluation),
    focusDaily: evaluation.focusDaily,
  })), [comparableEvaluations]);
  const focusDailyResult = useMemo(
    () => calculateFocusDailyScore(effectiveStatistics, previousFocusEvaluations),
    [effectiveStatistics, previousFocusEvaluations],
  );
  const previewRows = useMemo(() => focusDailyResult.activitiesWithCalculatedFields.map((item) => {
    try {
      const statistic = calculateStatistic({
        ...item,
        description: item.description ?? "",
        measurementMode: "percentage",
        measurementUnit: "%",
        activityStatus: item.activityStatus,
        activityPriority: item.activityPriority,
        activitySemaphore: item.calculatedSemaphore,
        internalPriorityWeight: item.internalPriorityWeight,
        internalWeightedValue: item.internalWeightedValue,
        currentSelection: item.activityStatus,
        currentValue: item.currentValue,
        targetValue: 100,
        previousValue: item.previousValue ?? 0,
      });
      return {
        ...statistic,
        activitySemaphore: item.calculatedSemaphore,
        internalPriorityWeight: item.internalPriorityWeight,
        internalWeightedValue: item.internalWeightedValue,
      };
    } catch {
      return null;
    }
  }), [focusDailyResult]);
  const previewStatistics = previewRows.filter((item): item is NonNullable<typeof item> => Boolean(item));
  const previewScore = focusDailyResult.weightedScore;
  const previewPerformanceIndex = focusDailyResult.weightedScore;
  const previousPerformanceIndex = previousEvaluation ? getEvaluationTrendScore(previousEvaluation) : undefined;
  const previewTrendCondition = focusDailyResult.trendCondition;
  const previewCondition = focusTrendToOperationalCondition(previewTrendCondition);
  const configuredPreviewFormulaSteps = getFocusFormula(previewCondition, focusSettings.formulas);
  const previewFormulaSteps = configuredPreviewFormulaSteps.length
    ? configuredPreviewFormulaSteps
    : conditionFormula[previewCondition];
  const peakStreakCount = focusDailyResult.peakStreakCount ?? 0;
  const submissionStatistics = focusDailyResult.activitiesWithCalculatedFields.map((item) => ({
    ...item,
    description: item.description ?? "",
    measurementMode: "percentage" as const,
    measurementUnit: "%",
    activityStatus: item.activityStatus,
    activityPriority: item.activityPriority,
    activitySemaphore: item.calculatedSemaphore,
    currentSelection: item.activityStatus,
    previousValue: item.previousValue ?? 0,
    currentValue: item.currentValue,
    targetValue: 100,
    internalPriorityWeight: item.internalPriorityWeight,
    internalWeightedValue: item.internalWeightedValue,
  }));
  const subjectLabel = draft.evaluatedPersonName || "Colaborador por definir";
  const historyChartData = useMemo(() => {
    const history: Array<{ period: string; date: string; score: number; condition: FocusTrendCondition; source: string; peakStreakCount?: number }> = comparableEvaluations.slice(-8).map((evaluation) => ({
      period: evaluation.date,
      date: evaluation.date,
      score: getEvaluationTrendScore(evaluation),
      condition: evaluation.focusDaily?.trendCondition ?? evaluation.condition ?? "Inexistencia",
      source: "Guardada",
      peakStreakCount: evaluation.focusDaily?.peakStreakCount,
    }));
    if (previewStatistics.length === draft.statistics.length && previewStatistics.length > 0) {
      history.push({
        period: draft.date,
        date: draft.date,
        score: previewPerformanceIndex,
        condition: previewTrendCondition,
        source: "Vista previa",
        peakStreakCount,
      });
    }
    return history;
  }, [comparableEvaluations, draft.date, draft.statistics.length, draft.week, peakStreakCount, previewPerformanceIndex, previewStatistics.length, previewTrendCondition]);
  const chartHistoryData = withZeroBaseline(historyChartData, ["score"]);
  const historyAxisMaximum = chartAxisMaximum(chartHistoryData, ["score"]);
  const required = <sup className="required-mark" aria-label="obligatorio">*</sup>;

  function targetId(target: ValidationTarget) {
    return target.index === undefined ? target.field : `${target.field}-${target.index}`;
  }

  function validationClass(field: string, index?: number) {
    if (!validationTarget || validationTarget.field !== field) return "";
    if (validationTarget.index !== index) return "";
    return "is-validation-error";
  }

  function focusValidationTarget(target?: ValidationTarget) {
    if (!target) return;
    window.requestAnimationFrame(() => {
      const element = document.querySelector<HTMLElement>(`[data-validation-target="${targetId(target)}"]`);
      const focusable = element?.matches("input, textarea, select, button")
        ? element
        : element?.querySelector<HTMLElement>("input, textarea, select, button");
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      focusable?.focus({ preventScroll: true });
      if (focusable instanceof HTMLInputElement || focusable instanceof HTMLTextAreaElement) focusable.select();
    });
  }

  function showValidationError(validation: StepValidation) {
    setLastResult(null);
    setNotice(validation.message);
    setValidationTarget(validation.target ?? null);
    focusValidationTarget(validation.target);
  }

  function clearValidationFeedback() {
    setNotice("");
    setValidationTarget(null);
  }

  useEffect(() => {
    if (!previousEvaluation) {
      if (loadedHistoryId) setLoadedHistoryId("");
      return;
    }
    if (loadedHistoryId === previousEvaluation.id) return;
    const followUpStatistics = followUpActivitySnapshots.map(({ statistic }) => buildFollowUpActivityDraft(statistic));
    setDraft((current) => ({
      ...current,
      productDefinition: previousEvaluation.productDefinition || current.productDefinition,
      statistics: followUpStatistics.length ? followUpStatistics : statisticsForPosition(),
    }));
    setLoadedHistoryId(previousEvaluation.id);
  }, [followUpActivitySnapshots, loadedHistoryId, previousEvaluation]);

  useEffect(() => {
    if (lockedUnitId && lockedUnitId !== draft.businessUnitId) selectUnit(lockedUnitId);
  }, [lockedUnitId]);

  useEffect(() => {
    if (!lockedPositionId && !lockedProfileId) return;
    const lockedPosition = positions.find((item) => item.id === lockedPositionId);
    setLoadedHistoryId("");
    setDraft((current) => ({
      ...current,
      businessUnitId: lockedPosition?.businessUnitId ?? lockedUnitId ?? current.businessUnitId,
      area: lockedPosition?.area ?? current.area,
      positionId: lockedPositionId ?? current.positionId,
      collaboratorProfileId: lockedProfileId ?? current.collaboratorProfileId,
      evaluatedPersonName: lockedProfileName ?? current.evaluatedPersonName,
      productDefinition: lockedPosition?.rep ?? current.productDefinition,
      statistics: statisticsForPosition(),
    }));
  }, [lockedPositionId, lockedProfileId, lockedProfileName, lockedUnitId, positions]);

  function update<K extends keyof EvaluationDraft>(key: K, value: EvaluationDraft[K]) {
    clearValidationFeedback();
    setLastResult(null);
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function selectUnit(businessUnitId: string) {
    const nextPosition = positions.find((item) => item.businessUnitId === businessUnitId && isPositionReady(item));
    clearValidationFeedback();
    setLastResult(null);
    setLoadedHistoryId("");
    setDraft((current) => ({
      ...current,
      businessUnitId,
      area: nextPosition?.area ?? "",
      positionId: nextPosition?.id ?? "",
      collaboratorProfileId: nextPosition ? getPositionProfileId(nextPosition.id) : "",
      evaluatedPersonName: nextPosition?.name ?? "",
      productDefinition: nextPosition?.rep ?? "",
      statistics: statisticsForPosition(),
    }));
  }

  function selectPosition(positionId: string) {
    const nextPosition = positions.find((item) => item.id === positionId && item.businessUnitId === draft.businessUnitId);
    clearValidationFeedback();
    setLastResult(null);
    setLoadedHistoryId("");
    setDraft((current) => ({
      ...current,
      positionId,
      area: nextPosition?.area ?? current.area,
      collaboratorProfileId: nextPosition ? getPositionProfileId(nextPosition.id) : "",
      evaluatedPersonName: nextPosition?.name ?? "",
      productDefinition: nextPosition?.rep ?? "",
      statistics: statisticsForPosition(),
    }));
  }

  function updateDate(date: string) {
    const period = getEvaluationPeriod(date);
    clearValidationFeedback();
    setLastResult(null);
    setDraft((current) => ({ ...current, date, ...period }));
  }

  function updateStatistic(index: number, patch: Partial<EvaluationStatisticDraft>) {
    clearValidationFeedback();
    setLastResult(null);
    setDraft((current) => ({
      ...current,
      statistics: current.statistics.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
  }

  function updateActivityStatus(index: number, activityStatus: string) {
    const currentValue = draft.statistics[index]?.currentValue ?? 0;
    const normalizedStatus = normalizeFocusDailyStatus(activityStatus);
    let nextValue = currentValue;
    if (normalizedStatus === "Completado") nextValue = 100;
    else if (normalizedStatus === "No iniciado") nextValue = Math.min(currentValue >= 100 ? 0 : currentValue, 99);
    else if (normalizedStatus === "En proceso") nextValue = currentValue > 0 && currentValue < 100 ? currentValue : 50;
    updateStatistic(index, {
      activityStatus: normalizedStatus,
      measurementMode: "percentage",
      measurementUnit: "%",
      currentSelection: normalizedStatus,
      currentValue: nextValue,
      targetValue: 100,
    });
  }

  function updateActivityProgress(index: number, value: string) {
    const currentStatus = getActivityStatus(draft.statistics[index]);
    const currentValue = Math.min(currentStatus === "No iniciado" ? 99 : 100, percentageValue(value));
    const activityStatus = currentStatus === "No iniciado"
      ? "No iniciado"
      : currentValue >= 100
        ? "Completado"
        : currentValue > 0
          ? "En proceso"
          : "No iniciado";
    updateStatistic(index, {
      activityStatus,
      measurementMode: "percentage",
      measurementUnit: "%",
      currentSelection: activityStatus,
      currentValue,
      targetValue: 100,
    });
  }

  function addStatistic() {
    update("statistics", [...draft.statistics, blankStatistic()]);
  }

  function removeStatistic(index: number) {
    if (draft.statistics.length <= 1) return;
    update("statistics", draft.statistics.filter((_, itemIndex) => itemIndex !== index));
  }

  function validateStep(step: number): StepValidation | null {
    if (step === 0) {
      if (!draft.businessUnitId) return { message: "Selecciona una unidad de negocio.", target: { field: "businessUnitId" } };
      if (!selectedPosition || !isPositionReady(selectedPosition)) return { message: "Selecciona un puesto listo para evaluar.", target: { field: "positionId" } };
      if (!draft.date) return { message: "Selecciona la fecha de evaluación.", target: { field: "date" } };
      if (currentPeriodEvaluation) return { message: `Este perfil ya tiene Focus Diario registrado el ${draft.date}. Cambia la fecha o consulta el registro existente.`, target: { field: "date" } };
    }
    if (step === 1) {
      if (!draft.statistics.length) return { message: "Agrega al menos una actividad.", target: { field: "activityName", index: 0 } };
      const missingNameIndex = draft.statistics.findIndex((statistic) => !statistic.name.trim());
      if (missingNameIndex >= 0) return { message: `Escribe el nombre de la actividad ${missingNameIndex + 1}.`, target: { field: "activityName", index: missingNameIndex } };
      const missingReasonIndex = draft.statistics.findIndex((statistic) => focusDailyActivityRequiresReason(statistic) && !statistic.description.trim());
      if (missingReasonIndex >= 0) return { message: `Agrega motivo / avance en la actividad ${missingReasonIndex + 1}.`, target: { field: "activityReason", index: missingReasonIndex } };
      try {
        if (!focusDailyResult.totalActivities) return { message: "Agrega al menos una actividad con datos para calcular el cumplimiento diario.", target: { field: "activityName", index: 0 } };
      } catch (error) {
        return { message: error instanceof Error ? error.message : "Revisa los campos y sus resultados.", target: { field: "activityName", index: 0 } };
      }
    }
    return null;
  }

  function goNext() {
    const error = validateStep(currentStep);
    if (error) {
      showValidationError(error);
      return;
    }
    clearValidationFeedback();
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
    window.requestAnimationFrame(() => document.querySelector(".evaluation-wizard")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function goBack() {
    clearValidationFeedback();
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (currentStep < steps.length - 1) {
      goNext();
      return;
    }
    const validationError = validateStep(currentStep);
    if (validationError) {
      showValidationError(validationError);
      return;
    }
    try {
      const contextualDraft = {
        ...draft,
        productDefinition: draft.productDefinition,
        problemStatement: "",
        dataAnalysis: "",
        solutionPlan: "",
        nextTarget: 0,
        observations: "",
        followUpDate: "",
      };
      const saved = onSubmit({ ...contextualDraft, statistics: submissionStatistics });
      setLastResult(saved);
      setNotice(`Evaluación ${saved.documentFolio ?? ""} guardada correctamente.`);
      setValidationTarget(null);
      setCurrentStep(0);
      setDraft((current) => {
        const reset = createDraft(units, positions, current.businessUnitId);
        const currentPosition = positions.find((item) => item.id === current.positionId);
        return {
          ...reset,
          area: current.area,
          positionId: current.positionId,
          collaboratorProfileId: current.collaboratorProfileId,
          evaluatedPersonName: currentPosition?.name ?? current.evaluatedPersonName,
          evaluatorName: current.evaluatorName,
          productDefinition: currentPosition?.rep ?? "",
          statistics: statisticsForPosition(),
        };
      });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No fue posible guardar la evaluación.");
      setValidationTarget(null);
    }
  }

  return (
    <div className={`evaluation-wizard-layout ${currentStep === 1 ? "is-activity-step" : ""}`}>
      <form className="panel evaluation-wizard" onSubmit={submit}>
        <div className="wizard-heading">
          <div><p className="eyebrow">Paso {currentStep + 1} de {steps.length}</p><h2>{steps[currentStep].title}</h2><p>{steps[currentStep].helper}</p></div>
          {notice && <div aria-live={lastResult ? "polite" : "assertive"} className={`wizard-notice ${lastResult ? "is-success" : "is-error"}`} role={lastResult ? "status" : "alert"}>
            <Icon name={lastResult ? "check" : "alert"} size={15} />
            <span><b>{lastResult ? "Guardado" : "Campo requerido"}</b>{notice}</span>
          </div>}
        </div>

        <nav className="wizard-progress" aria-label="Progreso de evaluación">
          {steps.map((step, index) => <button aria-current={currentStep === index ? "step" : undefined} className={`${currentStep === index ? "is-active" : ""} ${currentStep > index ? "is-complete" : ""}`} key={step.number} onClick={() => index <= currentStep && setCurrentStep(index)} type="button">
            <b>{currentStep > index ? <Icon name="check" size={13} /> : step.number}</b>
            <span><strong>{step.title}</strong><small>{step.helper}</small></span>
          </button>)}
        </nav>

        <div className="wizard-step" key={currentStep}>
          {currentStep === 0 ? <>
            <section className="wizard-section">
              <div className="wizard-section-heading"><span>1</span><div><h3>{lockedProfileId ? "Perfil activo" : "¿Qué puesto vas a evaluar?"}</h3><p>{lockedProfileId ? "Este Focus Diario quedará ligado al perfil con el que ingresaste." : "Selecciona el puesto del organigrama. El resultado alimentará el histórico de ese perfil de puesto."}</p></div></div>
              {lockedProfileId ? <div className="locked-profile-card">
                <Icon name="shield" size={18} />
                <div>
                  <span>Perfil</span>
                  <strong>{draft.evaluatedPersonName}</strong>
                  <small>{selectedPosition?.name}</small>
                </div>
              </div> : <div className={`form-grid ${showUnitSelector ? "form-grid-2" : ""} wizard-form-grid`}>
                {showUnitSelector ? <label className={validationClass("businessUnitId")} data-validation-target="businessUnitId"><span>Unidad de negocio{required}</span><select value={draft.businessUnitId} onChange={(event) => selectUnit(event.target.value)}>{activeUnitOptions.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label> : null}
                <label className={validationClass("positionId")} data-validation-target="positionId"><span>Puesto{required}</span><select disabled={Boolean(lockedPositionId)} value={draft.positionId} onChange={(event) => selectPosition(event.target.value)}>{positionLevelGroups.map((group) => <optgroup key={group.level} label={group.level}>{group.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</optgroup>)}</select></label>
              </div>}
              {!lockedProfileId && selectedPosition ? <div className="profile-link-state is-linked">
                <Icon name="check" size={15} />
                <div>
                  <b>Perfil de puesto vinculado</b>
                  <span>{selectedPosition.name} · {getOperationalLevel(selectedPosition)}. Esta evaluación continuará el histórico del puesto en el organigrama.</span>
                </div>
              </div> : null}
              {currentPeriodEvaluation ? <div className="current-period-warning">
                <Icon name="alert" size={17} />
                <div>
                  <b>Este día ya tiene Focus registrado</b>
                  <span>{currentPeriodEvaluation.documentFolio || currentPeriodEvaluation.id} · {currentPeriodEvaluation.finalScore}% · {currentPeriodEvaluation.condition}. Cambia la fecha o consulta el registro existente.</span>
                </div>
              </div> : null}
              {!lockedProfileId ? <div className="position-availability-note"><Icon name="people" size={16} /><span><b>{unitPositions.length} puestos disponibles</b> · {selectedPosition ? `${getOperationalLevel(selectedPosition)} · ` : ""}El Focus se guarda en el perfil del puesto.</span></div> : null}
            </section>

            <section className="wizard-section">
              <div className="wizard-section-heading"><span>2</span><div><h3>Fecha y referencia</h3><p>Captura la fecha del Focus. Si hay metas vigentes, se mostrarán como comparativa de cierre.</p></div></div>
              <div className="focus-context-grid">
                <label className={`focus-date-card ${validationClass("date")}`} data-validation-target="date">
                  <span>Fecha de llenado{required}</span>
                  <input type="date" value={draft.date} onChange={(event) => updateDate(event.target.value)} />
                  <small>Define el registro del día.</small>
                </label>
                <div className="focus-auto-context">
                  <div className={`automatic-folio focus-goal-auto ${directFocusGoals.length ? "is-ready" : ""}`}>
                    <Icon name={directFocusGoals.length ? "activity" : "file"} size={16} />
                    <div>
                      <b>Metas asignadas</b>
                      <span>{directFocusGoals.length
                        ? `${directFocusGoals.length} meta${directFocusGoals.length === 1 ? "" : "s"} para esta fecha`
                        : "Aún no hay metas asignadas"}</span>
                    </div>
                  </div>
                </div>
              </div>
              {activityFocusGoals.length ? <div className="focus-goal-gate is-ready">
                <Icon name="check" size={17} />
                <div>
                  <b>Metas visibles como comparativa</b>
                  <span>El Focus se evaluará por actividades, avance y prioridad. Las metas sólo indican el número esperado al cierre del día.</span>
                </div>
              </div> : null}
              <div className="automatic-period-note"><Icon name="activity" size={16} /><div><b>Fecha clasificada</b><span>{draft.date} · Semana {draft.week} · {draft.month} · {draft.season}.</span></div></div>
            </section>
          </> : null}

          {currentStep === 1 ? <>
          <section className="wizard-section">
            <div className="wizard-section-heading">
              <span>2</span>
              <div><h3>Captura actividades y avance</h3><p>Agrega filas tipo tablero, compara la fecha anterior y registra el estado real de cada actividad.</p></div>
            </div>
            {selectedPosition ? <div className="rep-reference-strip focus-context-grid">
              <div className="rep-reference-column">
                <div className="rep-reference-block">
                  <span>REP del puesto</span>
                  <strong>{selectedPosition.rep || "Sin REP definido"}</strong>
                </div>
                {selectedPositionIndicators.length ? <div className="rep-reference-block">
                  <span>Indicadores del puesto</span>
                  <ol className="rep-indicator-text-list">
                    {selectedPositionIndicators.map((kpi, index) => <li key={`${index}-${kpi.name}`}>
                      <strong className="rep-indicator-title">{index + 1} - {kpi.name}</strong>
                      {kpi.description ? <small className="rep-indicator-detail">• {kpi.description}</small> : null}
                    </li>)}
                  </ol>
                </div> : null}
              </div>
              <div className="rep-reference-column focus-assigned-goals">
                <div className="rep-reference-block">
                  <span>Metas asignadas</span>
                  {directFocusGoals.length ? <div className="focus-assigned-goal-list">
                    {directFocusGoals.map((goal) => <article key={goal.id}>
                      <b>{goal.goalLabel}</b>
                      <strong>{goalTargetText(goal)}</strong>
                      <small>{formatGoalCadence(goal.cadence)} · {periodLabelForGoal(goal)}</small>
                    </article>)}
                  </div> : <p>Aún no hay metas asignadas</p>}
                </div>
              </div>
            </div> : null}
            <div className={`evaluation-history-context ${previousEvaluation ? "has-history" : "is-legend"}`}>
              <Icon name={previousEvaluation ? "archive" : "activity"} size={16} />
              <div>
                <b>{previousEvaluation
                  ? `Histórico localizado · ${previousEvaluation.date}`
                  : hasProfileHistoryOutsideSelectedDate
                    ? "Sin cortes anteriores a esta fecha"
                    : "Primera evaluación de este puesto"}</b>
                <span>{previousEvaluation
                  ? followUpActivityCount
                    ? `${followUpActivityCount} actividad${followUpActivityCount === 1 ? "" : "es"} abierta${followUpActivityCount === 1 ? "" : "s"} continuará${followUpActivityCount === 1 ? "" : "n"} hasta completarse. ${closedActivityCount ? "Las cerradas quedan como referencia si se vuelven a abrir." : ""}`
                    : "Las actividades anteriores quedaron cerradas; agrega una nueva o reabre una actividad del mismo tipo para comparar."
                  : hasProfileHistoryOutsideSelectedDate
                    ? "Hay registros posteriores para este perfil; la tendencia conserva el orden cronológico de la fecha capturada."
                  : "Los resultados capturados crearán la línea base para la siguiente evaluación."}</span>
              </div>
              {latestActivitySnapshots.length ? <div className="previous-aspects-list">
                {latestActivitySnapshots.map(({ statistic, evaluation }) => <span className={`is-${getActivityHistoryTone(statistic)}`} key={`${evaluation.id}-${statistic.name}-${statistic.measurementMode ?? "numeric"}`}>
                  <b>{statistic.name}</b>
                  <small>
                    {getActivityHistoryLabel(statistic)}
                    {" · "}Último: {measurementValueLabel(statistic.measurementMode, statistic.currentValue, statistic.currentSelection ?? statistic.activityStatus, statistic.measurementUnit)}
                    {" · "}{evaluation.date}
                  </small>
                </span>)}
              </div> : null}
            </div>
            <div className="activity-capture-board" aria-label="Tablero de actividades evaluables">
              <div className="activity-board-toolbar">
                <div>
                  <b>Comienza a llenar tus actividades</b>
                  <span>{draft.statistics.length} actividad{draft.statistics.length === 1 ? "" : "es"} · El score se calcula por avance y prioridad. La meta no altera la condición.</span>
                </div>
                <div className="activity-board-toolbar-actions">
                  <strong>{previewStatistics.length ? `${previewPerformanceIndex}%` : "Sin calcular"}</strong>
                  <button className="secondary-button activity-add-button" onClick={addStatistic} type="button"><Icon name="plus" size={15} /> Agregar actividad</button>
                </div>
              </div>
              <div className="activity-board-scroll">
                <table className="activity-board-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Actividad{required}</th>
                      <th>Estado</th>
                      <th>Prioridad</th>
                      <th>Deadline</th>
                      <th>Avance %</th>
                      <th>Motivo / avance</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {draft.statistics.map((item, index) => {
                      const activityStatus = getActivityStatus(item);
                      const activitySemaphore = getActivitySemaphore(item);
                      const needsReason = focusDailyActivityRequiresReason(item);
                      return <tr className="activity-row" key={`activity-${index}`}>
                          <td className="activity-index">{String(index + 1).padStart(2, "0")}</td>
                          <td className={`activity-name-cell ${validationClass("activityName", index)}`} data-validation-target={targetId({ field: "activityName", index })}>
                            <input
                              aria-label={`Actividad ${index + 1}`}
                              placeholder="Ej. Seguimiento a prospectos"
                              value={item.name}
                              onChange={(event) => updateStatistic(index, {
                                name: event.target.value,
                                measurementMode: "percentage",
                                measurementUnit: "%",
                                targetValue: 100,
                              })}
                            />
                          </td>
                          <td>
                            <label className={`activity-status-select is-${activitySemaphore.tone}`}>
                              <i />
                              <select
                                aria-label={`Estado de ${item.name || `actividad ${index + 1}`}`}
                                value={activityStatus}
                                onChange={(event) => updateActivityStatus(index, event.target.value)}
                              >
                                {activityStatusOptions.map((option) => <option key={option}>{option}</option>)}
                              </select>
                            </label>
                          </td>
                          <td>
                            <select
                              aria-label={`Prioridad de ${item.name || `actividad ${index + 1}`}`}
                              value={normalizeFocusDailyPriority(item.activityPriority)}
                              onChange={(event) => updateStatistic(index, { activityPriority: event.target.value })}
                            >
                              {activityPriorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                          </td>
                          <td><input aria-label={`Deadline de ${item.name || `actividad ${index + 1}`}`} type="date" value={item.deadline ?? ""} onChange={(event) => updateStatistic(index, { deadline: event.target.value })} /></td>
                          <td>
                            <label className="activity-progress-field">
                              <input
                                aria-label={`Porcentaje de avance de ${item.name || `actividad ${index + 1}`}`}
                                max={activityStatus === "No iniciado" ? "99" : "100"}
                                min="0"
                                step="1"
                                type="number"
                                value={String(item.currentValue).replace(/^0+(?=\d)/, "")}
                                onFocus={(event) => event.currentTarget.select()}
                                onChange={(event) => updateActivityProgress(index, event.target.value)}
                              />
                              <b>%</b>
                            </label>
                          </td>
                          <td className={`activity-reason-cell ${validationClass("activityReason", index)}`} data-validation-target={targetId({ field: "activityReason", index })}>
                            <textarea
                              aria-label={`Motivo o avance de ${item.name || `actividad ${index + 1}`}`}
                              className={needsReason && !item.description.trim() ? "is-required" : ""}
                              placeholder={needsReason ? "Motivo breve requerido" : "Opcional"}
                              value={item.description}
                              onChange={(event) => updateStatistic(index, { description: event.target.value })}
                              rows={1}
                            />
                          </td>
                          <td><button aria-label="Quitar actividad" className="activity-remove-button" disabled={draft.statistics.length <= 1} onClick={() => removeStatistic(index)} type="button"><Icon name="x" size={15} /></button></td>
                        </tr>;
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          </> : null}

          {currentStep === 2 ? <>
            <section className="wizard-section condition-result-section">
              <div className="wizard-section-heading"><span>3</span><div><h3>Condición y fórmula a seguir</h3><p>Los motivos de avance ya quedaron registrados por actividad. Este cierre sólo muestra la condición resultante y la guía que corresponde aplicar.</p></div></div>
              <div className="trend-condition-comparison decision-condition-summary">
                <div><span>Índice anterior</span><strong>{previousPerformanceIndex === undefined ? "Sin histórico" : `${previousPerformanceIndex}%`}</strong></div>
                <div><span>Índice actual</span><strong>{previewPerformanceIndex}%</strong></div>
                <div><span>Lectura final</span><ConditionBadge condition={previewCondition} /></div>
              </div>
              {goalComparisonCards.length ? <div className="focus-goal-comparison focus-goal-comparison-compact">
                <div>
                  <span>Metas del puesto</span>
                  <strong>Referencia establecida</strong>
                </div>
                <div className="focus-goal-chip-list">
                  {goalComparisonCards.map(({ goal, readout }) => <article className="focus-goal-chip" key={goal.id}>
                    <b>{goal.goalLabel}</b>
                    <span>{readout.daily}</span>
                    <small>{readout.total} · {periodLabelForGoal(goal)}</small>
                  </article>)}
                </div>
              </div> : null}
              {draft.evaluatedPersonName.trim() ? <section className="focus-trend-section capture-history-panel condition-chart-result">
                <div className="capture-history-heading">
                  <div>
                    <p className="eyebrow">Seguimiento por fecha</p>
                    <h4>Gráfica resultante</h4>
                    <span>{comparableEvaluations.length ? `${comparableEvaluations.length} cortes previos y el resultado actual.` : "El resultado actual abrirá la línea base del puesto."}</span>
                  </div>
                  <div className="condition-streak-wrap">
                    <ConditionBadge condition={previewTrendCondition} />
                    {peakStreakCount ? <span className="peak-streak-badge"><Icon name="flame" size={13} /> Racha {peakStreakCount}</span> : null}
                  </div>
                </div>
                <div className="capture-history-chart" aria-label={`Tendencia de ${draft.evaluatedPersonName}`}>
                  <ResponsiveContainer height="100%" width="100%">
                    <LineChart data={chartHistoryData} margin={{ top: 12, right: 14, bottom: 4, left: -12 }}>
                      <CartesianGrid stroke="#dce7ef" strokeDasharray="3 3" vertical={false} />
                      <XAxis axisLine={false} dataKey="period" fontSize={9} tickLine={false} />
                      <YAxis axisLine={false} domain={[0, historyAxisMaximum]} fontSize={9} tickFormatter={(value) => `${value}%`} tickLine={false} width={46} />
                      <ReferenceLine stroke="#7891a7" strokeDasharray="4 4" y={100} />
                      <Tooltip
                        contentStyle={{ border: "1px solid #d5e3ed", borderRadius: 6, boxShadow: "0 10px 28px rgba(6, 26, 51, 0.1)", fontSize: 11 }}
                        formatter={(value, _name, entry) => [`${value}% · ${entry.payload.condition}${entry.payload.peakStreakCount ? ` · Racha ${entry.payload.peakStreakCount}` : ""}`, entry.payload.source]}
                        labelFormatter={(label, payload) => {
                          const point = payload[0]?.payload;
                          return point?.isBaseline ? "Base 0" : formatChartPointDate(point?.date ?? String(label));
                        }}
                      />
                      <Line activeDot={{ r: 5 }} dataKey="score" dot={{ fill: "#0877ce", r: 4, stroke: "#ffffff", strokeWidth: 2 }} stroke="#0877ce" strokeWidth={3} type="monotone" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section> : null}
              <div className="condition-action-guide decision-condition-guide condition-formula-result condition-result-blue">
                <div><span>Fórmula a seguir · Condición {previewCondition}</span><ConditionBadge condition={previewCondition} /></div>
                <ol>{previewFormulaSteps.map((item) => <li key={item}>{item}</li>)}</ol>
              </div>
            </section>
          </> : null}
        </div>

        <footer className="wizard-actions">
          <button className="text-button" disabled={currentStep === 0} onClick={goBack} type="button">Atrás</button>
          <span>Paso {currentStep + 1} de {steps.length}</span>
          {currentStep < steps.length - 1
            ? <button className="primary-button" type="submit">Continuar <Icon name="chart" size={15} /></button>
            : <button className="primary-button" type="submit"><Icon name="check" size={16} /> Guardar evaluación</button>}
        </footer>
      </form>

      <aside className="wizard-summary">
        <div className="wizard-summary-heading"><p className="eyebrow">Resumen de captura</p><span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span></div>
        <div className="wizard-summary-progress"><i style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} /></div>
        <dl>
          {!lockedProfileId ? <div><dt>Unidad</dt><dd>{selectedUnit?.name ?? "Sin definir"}</dd></div> : null}
          <div><dt>Perfil</dt><dd>{subjectLabel}</dd></div>
          <div><dt>Fecha</dt><dd>{draft.date || "Sin definir"}</dd></div>
          {primaryFocusGoal ? <div><dt>Referencia</dt><dd>{goalDisplayText(primaryFocusGoal)}</dd></div> : null}
        </dl>
        <div className="wizard-summary-result">
          <span>Resultado provisional</span>
          <strong>{previewScore}%</strong>
          <div className="condition-streak-wrap">
            <ConditionBadge condition={previewTrendCondition} />
            {peakStreakCount ? <span className="peak-streak-badge"><Icon name="flame" size={13} /> Racha {peakStreakCount}</span> : null}
          </div>
        </div>
        <div className="wizard-next-note">
          <Icon name="shield" size={16} />
          <p><b>Guardado con trazabilidad</b>Cada evaluación genera o vincula un folio y alimenta automáticamente el seguimiento.</p>
        </div>
        {lastResult ? <div className="wizard-last-result"><Icon name="check" size={17} /><div><b>{lastResult.documentFolio}</b><span>Última evaluación guardada</span></div></div> : null}
      </aside>
    </div>
  );
}
