import { type FormEvent, useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getOperationalLevel } from "../lib/catalog";
import { chartAxisMaximum, withZeroBaseline } from "../lib/chartSeries";
import { formatChartPointDate } from "../lib/dateLabels";
import {
  buildUnitGoalIndicators,
  calculateAllocatedGoalTarget,
  formatGoalCadence,
  getGoalPeriodBounds,
  getGoalTargetBreakdown,
  goalAppliesToPosition,
  goalIsActiveOnDate,
  isSameGoalPeriod,
  normalizeGoalText,
  normalizeGoalAllocationPercent,
  resolveIndicatorValueKind,
  type UnitGoalIndicatorOption,
} from "../lib/goals";
import { buildFundacionHierarchy, flattenFundacionHierarchy } from "../lib/fundacionHierarchy";
import {
  calculateIndicatorAttainmentScore,
  calculateWeeklyIndicatorCondition,
  calculateWeeklyPositionIndicatorScore,
  getIndicatorStatusMeta,
  getIndicatorStatusMetaFromResult,
  getPositionIndicatorTrendSeries,
  normalizeIndicatorActualValue,
  normalizeIndicatorResult,
} from "../lib/positionIndicators";
import type {
  BusinessUnit,
  CollaboratorProfile,
  FocusHierarchyRelationship,
  GoalCadence,
  IndicatorMeasurementKind,
  IndicatorValueKind,
  OperationalGoalAssignment,
  OperationalLevel,
  PlatformRole,
  Position,
  TrendCadence,
  WeeklyPositionIndicatorEvaluation,
  WeeklyPositionIndicatorResult,
} from "../types";
import { ChartZoomControls } from "./ChartZoomControls";
import { ConditionBadge } from "./ConditionBadge";
import { Icon } from "./Icon";

type IndicatorDraft = Omit<WeeklyPositionIndicatorResult, "semaphore">;
type GoalDraft = {
  allocationPercents: Record<string, string>;
  cadences: Record<string, GoalCadence>;
  effectiveDate: string;
  notes: string;
  targetId: string;
  targetValues: Record<string, string>;
};
type GoalTarget = {
  helper: string;
  id: string;
  label: string;
  position?: Position;
};
type GoalInput = Omit<OperationalGoalAssignment, "id" | "createdAt" | "updatedAt"> & { id?: string; createdAt?: string };
type GoalIndicatorOption = {
  description?: string;
  id: string;
  measurementKind?: IndicatorMeasurementKind;
  name: string;
  source: "position" | "unit";
  unitIndicatorId?: string;
  unitIndicatorName?: string;
  valueKind: IndicatorValueKind;
};
type SharedQuantityPlanProfile = {
  currentGoal?: OperationalGoalAssignment;
  position?: Position;
  profile: CollaboratorProfile;
};
type SharedQuantityPlan = {
  indicator: GoalIndicatorOption;
  profiles: SharedQuantityPlanProfile[];
  unitGoal: OperationalGoalAssignment;
};

const today = new Date().toISOString().slice(0, 10);
const UNIT_GOAL_TARGET = "__unit-goal__";
const LEVEL_ORDER: Record<OperationalLevel, number> = { Planeación: 0, Supervisión: 1, Ejecución: 2 };

function inferIndicatorValueKind(indicatorName: string, measurementKind?: IndicatorMeasurementKind, valueKind?: IndicatorValueKind): IndicatorValueKind {
  return resolveIndicatorValueKind({ indicatorName, measurementKind, valueKind });
}

const draftFromPosition = (position?: Position): IndicatorDraft[] =>
  (position?.kpis ?? []).map((kpi, index) => ({
    indicatorId: `${position?.id ?? "position"}::${index}`,
    indicatorName: kpi.name,
    measurementKind: kpi.measurementKind ?? "rep-compliance",
    valueKind: inferIndicatorValueKind(kpi.name, kpi.measurementKind),
    actualValue: 0,
    targetValue: 100,
    result: "No Cumplió",
    score: 0,
    observations: "",
    evidenceUrl: "",
  }));

function measurementKindMeta(kind: IndicatorMeasurementKind | undefined) {
  if (kind === "quantity") return { label: "Cantidad", detail: "Número real contra meta", tone: "quantity" };
  if (kind === "goal-target") return { label: "Meta", detail: "Requiere meta vigente", tone: "goal" };
  if (kind === "unit-indicator") return { label: "Indicador UDN", detail: "Meta final de unidad", tone: "unit" };
  return { label: "REP", detail: "Cumplimiento por Focus", tone: "rep" };
}

function profilePosition(profile: CollaboratorProfile | undefined, positions: Position[]) {
  return profile ? positions.find((position) => position.id === profile.positionId) : undefined;
}

function goalMatchesTarget(goal: OperationalGoalAssignment, targetId: string) {
  if (targetId === UNIT_GOAL_TARGET) return goal.scope === "unit";
  return goal.scope === "profile" && goal.targetProfileId === targetId;
}

function goalMatchesIndicator(goal: OperationalGoalAssignment, indicator: IndicatorDraft) {
  if (!goal.unitIndicatorName && !goal.unitIndicatorId) return true;
  if (goal.unitIndicatorName && normalizeGoalText(goal.unitIndicatorName) === normalizeGoalText(indicator.indicatorName)) return true;
  return normalizeGoalText(goal.unitIndicatorName ?? "").split(" ").some((token) =>
    token.length > 3 && normalizeGoalText(indicator.indicatorName).includes(token)
  );
}

function unitIndicatorAppliesToPosition(indicator: { id: string; name: string; valueKind?: IndicatorValueKind }, position?: Position) {
  if (!position) return true;
  return goalAppliesToPosition({
    businessUnitId: position.businessUnitId,
    createdAt: "",
    effectiveDate: today,
    goalLabel: indicator.name,
    id: "indicator-preview",
    metricSource: "focus-daily",
    notes: "",
    scope: "profile",
    sourceProfileId: "system",
    status: "active",
    targetValue: indicator.valueKind === "percentage" ? 100 : 1,
    unitIndicatorId: indicator.id,
    unitIndicatorName: indicator.name,
    updatedAt: "",
    valueKind: indicator.valueKind,
  }, position);
}

function unitGoalIndicatorOption(indicator: UnitGoalIndicatorOption): GoalIndicatorOption {
  return {
    description: indicator.description,
    id: indicator.id,
    measurementKind: indicator.measurementKind,
    name: indicator.name,
    source: "unit",
    unitIndicatorId: indicator.id,
    unitIndicatorName: indicator.name,
    valueKind: indicator.valueKind,
  };
}

function meaningfulGoalTokens(value = "") {
  return normalizeGoalText(value)
    .split(" ")
    .filter((token) => token.length > 3 && !["cantidad", "porcentaje", "meta", "metas", "cumplimiento"].includes(token));
}

function relatedUnitIndicatorForKpi(
  kpi: Position["kpis"][number],
  position: Position,
  unitIndicators: UnitGoalIndicatorOption[],
) {
  const applicableIndicators = unitIndicators.filter((indicator) => unitIndicatorAppliesToPosition(indicator, position));
  if (!applicableIndicators.length) return undefined;
  if (!["goal-target", "quantity", "unit-indicator"].includes(kpi.measurementKind ?? "")) return undefined;
  const kpiText = normalizeGoalText(`${kpi.name} ${kpi.description}`);
  return applicableIndicators.find((indicator) => {
    const indicatorText = normalizeGoalText(indicator.name);
    const tokens = [...meaningfulGoalTokens(kpiText), ...meaningfulGoalTokens(indicatorText)];
    return tokens.some((token) => kpiText.includes(token) && indicatorText.includes(token));
  }) ?? applicableIndicators[0];
}

function positionGoalIndicators(position: Position | undefined, unitIndicators: UnitGoalIndicatorOption[]): GoalIndicatorOption[] {
  if (!position) return [];
  const kpiIndicators = position.kpis.map((kpi, index) => {
    const linkedUnitIndicator = relatedUnitIndicatorForKpi(kpi, position, unitIndicators);
    return {
      description: kpi.description,
      id: `${position.id}::${index}`,
      measurementKind: kpi.measurementKind,
      name: kpi.name,
      source: "position" as const,
      unitIndicatorId: linkedUnitIndicator?.id,
      unitIndicatorName: linkedUnitIndicator?.name ?? kpi.name,
      valueKind: linkedUnitIndicator?.valueKind ?? inferIndicatorValueKind(kpi.name, kpi.measurementKind),
    };
  });
  const linkedIds = new Set(kpiIndicators.map((indicator) => indicator.unitIndicatorId).filter(Boolean));
  const inheritedUnitIndicators = unitIndicators
    .filter((indicator) => unitIndicatorAppliesToPosition(indicator, position))
    .filter((indicator) => !linkedIds.has(indicator.id))
    .map((indicator) => ({
      description: indicator.description,
      id: `${position.id}::unit::${indicator.id}`,
      measurementKind: indicator.measurementKind,
      name: indicator.name,
      source: "unit" as const,
      unitIndicatorId: indicator.id,
      unitIndicatorName: indicator.name,
      valueKind: indicator.valueKind,
    }));
  return [...kpiIndicators, ...inheritedUnitIndicators];
}

function defaultTargetValueForGoalIndicator(indicator: GoalIndicatorOption) {
  return indicator.valueKind === "percentage" ? "100" : "1";
}

function formatGoalNumber(value: number) {
  return new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 }).format(value);
}

function quantityFromDraft(value: string | number | undefined) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.round(numeric * 100) / 100) : 0;
}

function allocationPercentFromQuantity(quantity: number, targetValue: number) {
  if (!targetValue) return 0;
  return normalizeGoalAllocationPercent((quantity / targetValue) * 100);
}

function suggestedSharedQuantity(index: number, total: number, targetValue: number) {
  if (total <= 0) return 0;
  const base = Math.floor((targetValue / total) * 100) / 100;
  return index === total - 1 ? Math.round((targetValue - base * (total - 1)) * 100) / 100 : base;
}

function sortProfilesByOperationalLevel(left: CollaboratorProfile, right: CollaboratorProfile, positionById: Map<string, Position>) {
  const leftPosition = positionById.get(left.positionId);
  const rightPosition = positionById.get(right.positionId);
  const leftLevel = leftPosition ? getOperationalLevel(leftPosition) : "Ejecución";
  const rightLevel = rightPosition ? getOperationalLevel(rightPosition) : "Ejecución";
  return LEVEL_ORDER[leftLevel] - LEVEL_ORDER[rightLevel] || left.name.localeCompare(right.name, "es");
}

function indicatorActiveGoalsForProfile(
  goals: OperationalGoalAssignment[],
  businessUnitId: string,
  date: string,
  selectedProfileId?: string,
  position?: Position,
) {
  return goals
    .filter((goal) =>
      goal.status === "active"
      && goal.businessUnitId === businessUnitId
      && goalIsActiveOnDate(goal, date)
      && (
        (selectedProfileId && goal.scope === "profile" && goal.targetProfileId === selectedProfileId)
        || (goal.scope === "unit" && goalAppliesToPosition(goal, position))
      )
    )
    .sort((left, right) => {
      const leftDirect = left.targetProfileId === selectedProfileId ? 0 : 1;
      const rightDirect = right.targetProfileId === selectedProfileId ? 0 : 1;
      return leftDirect - rightDirect
        || right.effectiveDate.localeCompare(left.effectiveDate)
        || right.updatedAt.localeCompare(left.updatedAt);
    });
}

function scoredEffectiveGoal(indicators: IndicatorDraft[], goals: OperationalGoalAssignment[]) {
  return indicators
    .map((indicator) => goals.find((goal) => goalMatchesIndicator(goal, indicator)))
    .find((goal): goal is OperationalGoalAssignment => Boolean(goal))
    ?? goals[0];
}

function weeklyIndicatorTargetValue(goal?: OperationalGoalAssignment) {
  if (!goal) return undefined;
  if (goal.valueKind === "percentage") return goal.targetValue;
  return getGoalTargetBreakdown(goal).weeklyTarget;
}

function indicatorTargetValue(indicator: IndicatorDraft, goal?: OperationalGoalAssignment) {
  const goalTarget = weeklyIndicatorTargetValue(goal);
  if (Number.isFinite(goalTarget) && Number(goalTarget) > 0) return Number(goalTarget);
  if (Number.isFinite(indicator.targetValue) && Number(indicator.targetValue) > 0) return Number(indicator.targetValue);
  return 100;
}

function normalizeIndicatorAgainstGoal(indicator: IndicatorDraft, goal?: OperationalGoalAssignment): IndicatorDraft {
  const valueKind = resolveIndicatorValueKind({
    goalValueKind: goal?.valueKind,
    indicatorName: indicator.indicatorName,
    measurementKind: indicator.measurementKind,
    valueKind: indicator.valueKind,
  });
  const targetValue = indicatorTargetValue(indicator, goal);
  const actualValue = normalizeIndicatorActualValue(indicator.actualValue ?? indicator.score);
  const score = calculateIndicatorAttainmentScore(actualValue, targetValue);
  return normalizeIndicatorResult({
    ...indicator,
    actualValue,
    result: getIndicatorStatusMeta(score).status,
    score,
    targetValue,
    valueKind,
    goalAssignmentId: goal?.id ?? indicator.goalAssignmentId,
    goalCadence: goal?.cadence ?? indicator.goalCadence,
    goalEffectiveDate: goal?.effectiveDate ?? indicator.goalEffectiveDate,
    goalLabel: goal?.goalLabel ?? indicator.goalLabel,
    goalUnitIndicatorName: goal?.unitIndicatorName ?? indicator.goalUnitIndicatorName,
  });
}

function indicatorRequiresGoal(indicator: IndicatorDraft) {
  return ["goal-target", "unit-indicator", "quantity"].includes(indicator.measurementKind ?? "")
    || inferIndicatorValueKind(indicator.indicatorName, indicator.measurementKind, indicator.valueKind) === "quantity";
}

function goalMatchesGoalIndicator(goal: OperationalGoalAssignment, indicator: GoalIndicatorOption) {
  const indicatorKey = normalizeGoalText(indicator.unitIndicatorName ?? indicator.name);
  const goalKey = normalizeGoalText(goal.unitIndicatorName ?? goal.goalLabel);
  return Boolean(goalKey && indicatorKey && goalKey === indicatorKey);
}

function recordIndicatorMatchesGoalIndicator(indicator: WeeklyPositionIndicatorResult, goalIndicator: GoalIndicatorOption) {
  const goalKey = normalizeGoalText(goalIndicator.unitIndicatorName ?? goalIndicator.name);
  const candidates = [
    indicator.goalUnitIndicatorName,
    indicator.goalLabel,
    indicator.indicatorName,
  ].map((value) => normalizeGoalText(value ?? "")).filter(Boolean);
  return candidates.some((candidate) =>
    candidate === goalKey
    || candidate.includes(goalKey)
    || goalKey.includes(candidate)
  );
}

export function PositionIndicatorMetrics({
  allowedProfileIds,
  accessDisplayName,
  accessMode,
  accessProfileId,
  accessRole,
  goalAssignments,
  profiles,
  positions,
  records,
  relationships,
  saveWeeklyEvaluation,
  selectedUnitId,
  setSelectedUnitId,
  units,
  upsertGoals,
}: {
  allowedProfileIds?: string[];
  accessDisplayName?: string;
  accessMode?: "master" | "profile";
  accessProfileId?: string;
  accessRole?: PlatformRole;
  goalAssignments: OperationalGoalAssignment[];
  profiles: CollaboratorProfile[];
  positions: Position[];
  records: WeeklyPositionIndicatorEvaluation[];
  relationships: FocusHierarchyRelationship[];
  saveWeeklyEvaluation: (input: {
    businessUnitId: string;
    collaboratorProfileId: string;
    date: string;
    evaluatorName?: string;
    goalAssignmentId?: string;
    goalEffectiveDate?: string;
    goalLabel?: string;
    goalTargetValue?: number;
    indicators: IndicatorDraft[];
    positionId: string;
  }) => WeeklyPositionIndicatorEvaluation;
  selectedUnitId: string;
  setSelectedUnitId: (value: string) => void;
  units: BusinessUnit[];
  upsertGoals: (inputs: GoalInput[]) => OperationalGoalAssignment[];
}) {
  const allowedProfileSet = useMemo(() => allowedProfileIds ? new Set(allowedProfileIds) : undefined, [allowedProfileIds]);
  const positionById = useMemo(() => new Map(positions.map((position) => [position.id, position])), [positions]);
  const unitProfiles = useMemo(() => profiles.filter((profile) =>
    profile.businessUnitId === selectedUnitId
    && profile.status === "active"
    && (!allowedProfileSet || allowedProfileSet.has(profile.id))
  ), [allowedProfileSet, profiles, selectedUnitId]);
  const [selectedProfileId, setSelectedProfileId] = useState(unitProfiles[0]?.id ?? "");
  const selectedProfile = unitProfiles.find((profile) => profile.id === selectedProfileId) ?? unitProfiles[0];
  const selectedPosition = profilePosition(selectedProfile, positions);
  const [date, setDate] = useState(today);
  const [indicatorDrafts, setIndicatorDrafts] = useState<IndicatorDraft[]>(() => draftFromPosition(selectedPosition));
  const [notice, setNotice] = useState("");
  const [cadence, setCadence] = useState<TrendCadence>("week");
  const selectedUnit = units.find((unit) => unit.id === selectedUnitId);
  const unitDirectorPosition = useMemo(() => positions.find((position) =>
    position.businessUnitId === selectedUnitId && getOperationalLevel(position) === "Planeación"
  ), [positions, selectedUnitId]);
  const unitGoalIndicators = useMemo(() => buildUnitGoalIndicators(unitDirectorPosition), [unitDirectorPosition]);
  const activeRelationships = useMemo(() => relationships.filter((relationship) =>
    relationship.status === "active" && relationship.businessUnitId === selectedUnitId
  ), [relationships, selectedUnitId]);
  const assignableProfiles = useMemo(() => {
    if (accessMode === "master") {
      return [...unitProfiles].sort((left, right) => sortProfilesByOperationalLevel(left, right, positionById));
    }
    if (!accessProfileId) return [];
    const hierarchy = buildFundacionHierarchy({
      businessUnitId: selectedUnitId,
      evaluations: [],
      positions,
      profiles,
      relationships: activeRelationships,
      rootProfileId: accessProfileId,
    });
    const includeSelfTarget = accessRole === "Coordinador" || accessRole === "Gerente";
    return flattenFundacionHierarchy(hierarchy)
      .map((node) => node.profile)
      .filter((profile) => (includeSelfTarget || profile.id !== accessProfileId) && profile.status === "active")
      .filter((profile) => profile.businessUnitId === selectedUnitId)
      .filter((profile) => profile.id === accessProfileId || !allowedProfileSet || allowedProfileSet.has(profile.id))
      .sort((left, right) => sortProfilesByOperationalLevel(left, right, positionById));
  }, [accessMode, accessProfileId, accessRole, activeRelationships, allowedProfileSet, positionById, positions, profiles, selectedUnitId, unitProfiles]);
  const [goalDraft, setGoalDraft] = useState<GoalDraft>({
    allocationPercents: {},
    cadences: {},
    effectiveDate: today,
    notes: "",
    targetId: UNIT_GOAL_TARGET,
    targetValues: {},
  });
  const [sharedAllocationDrafts, setSharedAllocationDrafts] = useState<Record<string, Record<string, string>>>({});
  const [sharedAllocationExpanded, setSharedAllocationExpanded] = useState(false);
  const goalTargets = useMemo<GoalTarget[]>(() => {
    const unit = units.find((item) => item.id === selectedUnitId);
    const unitTarget: GoalTarget = {
      helper: "Dirección define metas generales sin asignarlas a una persona.",
      id: UNIT_GOAL_TARGET,
      label: `Meta general · ${unit?.name ?? "Unidad"}`,
    };
    const targets = assignableProfiles.map((profile) => {
      const position = positionById.get(profile.positionId);
      const level = position ? getOperationalLevel(position) : "Ejecución";
      return {
        helper: profile.id === accessProfileId
          ? "Meta propia del responsable."
          : level === "Ejecución" ? "Meta para ejecutivo o colaborador operativo." : "Meta divisional para responsable de área.",
        id: profile.id,
        label: profile.name,
        position,
      };
    });
    if (accessMode === "master") {
      return [unitTarget, ...targets];
    }
    return accessRole === "Director de Unidad" ? [unitTarget, ...targets] : targets;
  }, [accessMode, accessRole, assignableProfiles, positionById, selectedUnitId, units]);
  const selectedTarget = goalTargets.find((target) => target.id === goalDraft.targetId);
  const autoAssignedGoalIndicators = useMemo(() => {
    if (!selectedTarget || selectedTarget.id === UNIT_GOAL_TARGET) {
      return unitGoalIndicators.map(unitGoalIndicatorOption);
    }
    return positionGoalIndicators(selectedTarget.position, unitGoalIndicators);
  }, [selectedTarget, unitGoalIndicators]);
  const isUnitGoalTarget = goalDraft.targetId === UNIT_GOAL_TARGET;
  const isUnitDirectorReadout = isUnitGoalTarget || (selectedPosition ? getOperationalLevel(selectedPosition) === "Planeación" : false);
  const readoutSubjectLabel = isUnitGoalTarget
    ? `Meta general · ${selectedUnit?.name ?? "Unidad"}`
    : `${selectedProfile?.name ?? "Sin perfil"} · ${selectedPosition?.name ?? "Sin puesto"}`;
  const goalDraftDate = goalDraft.effectiveDate || today;
  const goalPanelGoals = useMemo(() => goalAssignments.filter((goal) =>
    goal.status === "active"
    && goal.businessUnitId === selectedUnitId
    && goalIsActiveOnDate(goal, goalDraftDate)
  ), [goalAssignments, goalDraftDate, selectedUnitId]);
  const goalDraftPeriod = useMemo(() => {
    const bounds = goalPanelGoals.map((goal) => getGoalTargetBreakdown(goal));
    if (!bounds.length) return getGoalPeriodBounds(goalDraftDate, "week");
    return {
      startDate: bounds.map((item) => item.startDate).sort()[0],
      endDate: bounds.map((item) => item.endDate).sort().at(-1) ?? bounds[0].endDate,
    };
  }, [goalDraftDate, goalPanelGoals]);
  const selectedRecords = useMemo(() => records
    .filter((record) =>
      record.businessUnitId === selectedUnitId
      && record.collaboratorProfileId === selectedProfile?.id
      && record.positionId === selectedPosition?.id
    )
    .sort((left, right) => left.weekStartDate.localeCompare(right.weekStartDate) || left.createdAt.localeCompare(right.createdAt)),
  [records, selectedPosition?.id, selectedProfile?.id, selectedUnitId]);
  const trendData = useMemo(() => getPositionIndicatorTrendSeries(selectedRecords, cadence), [cadence, selectedRecords]);
  const [visibleCount, setVisibleCount] = useState(trendData.length);
  const activeVisibleCount = visibleCount || trendData.length;
  const visibleData = trendData.slice(Math.max(0, trendData.length - activeVisibleCount));
  const chartVisibleData = withZeroBaseline(visibleData, ["score"]);
  const latestTrend = trendData.at(-1);
  const recentRecords = records
    .filter((record) => record.businessUnitId === selectedUnitId)
    .slice(0, 6);
  const canAssignGoals = Boolean(goalTargets.length);
  const goalsForProfile = useMemo(() => indicatorActiveGoalsForProfile(
    goalAssignments,
    selectedUnitId,
    date,
    selectedProfile?.id,
    selectedPosition,
  ), [date, goalAssignments, selectedPosition, selectedProfile?.id, selectedUnitId]);
  const findGoalForIndicator = (indicator: IndicatorDraft) =>
    goalsForProfile.find((goal) => goalMatchesIndicator(goal, indicator)) ?? goalsForProfile[0];
  const effectiveGoal = scoredEffectiveGoal(indicatorDrafts, goalsForProfile);
  const sharedQuantityPlans = useMemo<SharedQuantityPlan[]>(() => {
    const unitOptions = unitGoalIndicators.map(unitGoalIndicatorOption);
    return goalPanelGoals
      .filter((goal) => goal.scope === "unit" && goal.valueKind === "quantity" && goal.targetValue > 0)
      .flatMap((unitGoal): SharedQuantityPlan[] => {
        const indicator = unitOptions.find((option) => goalMatchesGoalIndicator(unitGoal, option)) ?? {
          id: unitGoal.unitIndicatorId ?? unitGoal.id,
          measurementKind: "quantity" as const,
          name: unitGoal.unitIndicatorName ?? unitGoal.goalLabel,
          source: "unit" as const,
          unitIndicatorId: unitGoal.unitIndicatorId,
          unitIndicatorName: unitGoal.unitIndicatorName ?? unitGoal.goalLabel,
          valueKind: "quantity" as const,
        };
        const profilesForGoal: SharedQuantityPlanProfile[] = assignableProfiles
          .map((profile) => ({ profile, position: positionById.get(profile.positionId) }))
          .filter(({ position }) =>
            Boolean(position)
            && positionGoalIndicators(position, unitGoalIndicators).some((positionIndicator) => goalMatchesGoalIndicator(unitGoal, positionIndicator))
          )
          .map(({ profile, position }): SharedQuantityPlanProfile => {
            const currentGoal = goalPanelGoals.find((goal) =>
              goal.scope === "profile"
              && goal.targetProfileId === profile.id
              && (goal.parentGoalId === unitGoal.id || goalMatchesGoalIndicator(goal, indicator))
            );
            return { currentGoal, position, profile };
          });
        return profilesForGoal.length > 1 ? [{ indicator, profiles: profilesForGoal, unitGoal }] : [];
      });
  }, [assignableProfiles, goalPanelGoals, positionById, unitGoalIndicators]);
  const selectedTargetGoals = goalPanelGoals
    .filter((goal) => goalMatchesTarget(goal, goalDraft.targetId))
    .sort((left, right) => right.effectiveDate.localeCompare(left.effectiveDate) || right.updatedAt.localeCompare(left.updatedAt));
  const scoredIndicatorDrafts = useMemo(
    () => indicatorDrafts.map((indicator) => normalizeIndicatorAgainstGoal(indicator, findGoalForIndicator(indicator))),
    [goalsForProfile, indicatorDrafts],
  );
  const weeklyScore = useMemo(() => calculateWeeklyPositionIndicatorScore(scoredIndicatorDrafts), [scoredIndicatorDrafts]);
  const effectiveGoalWeeklyTarget = weeklyIndicatorTargetValue(effectiveGoal);
  const unitAutoReadouts = useMemo(() => {
    if (!isUnitDirectorReadout || !unitGoalIndicators.length) return [];
    const periodRecords = records.filter((record) =>
      record.businessUnitId === selectedUnitId
      && record.weekStartDate <= goalDraftPeriod.endDate
      && record.weekEndDate >= goalDraftPeriod.startDate
    );
    return unitGoalIndicators.map(unitGoalIndicatorOption).map((indicator) => {
      const matchingGoal = goalPanelGoals.find((goal) => goal.scope === "unit" && goalMatchesGoalIndicator(goal, indicator));
      const targetValue = matchingGoal?.targetValue ?? Number(defaultTargetValueForGoalIndicator(indicator));
      const matchingIndicators = periodRecords.flatMap((record) =>
        record.indicators.filter((item) => recordIndicatorMatchesGoalIndicator(item, indicator))
      );
      const valueKind = matchingGoal?.valueKind ?? indicator.valueKind;
      const actualValue = valueKind === "quantity"
        ? matchingIndicators.reduce((sum, item) => sum + (item.actualValue ?? 0), 0)
        : matchingIndicators.length
          ? Math.round(matchingIndicators.reduce((sum, item) => sum + item.score, 0) / matchingIndicators.length)
          : 0;
      const score = calculateIndicatorAttainmentScore(actualValue, targetValue);
      return {
        ...indicator,
        actualValue,
        contributors: matchingIndicators.length,
        hasGoal: Boolean(matchingGoal),
        result: getIndicatorStatusMeta(score).status,
        score,
        targetValue,
        valueKind,
      };
    });
  }, [goalDraftPeriod.endDate, goalDraftPeriod.startDate, goalPanelGoals, isUnitDirectorReadout, records, selectedUnitId, unitGoalIndicators]);
  const unitAutoScore = useMemo(() => calculateWeeklyPositionIndicatorScore(unitAutoReadouts), [unitAutoReadouts]);
  const displayedWeeklyScore = isUnitDirectorReadout ? unitAutoScore : weeklyScore;
  const displayedCondition = useMemo(() => calculateWeeklyIndicatorCondition(
    displayedWeeklyScore,
    selectedRecords.map((record) => ({ date: record.weekStartDate, weightedScore: record.weightedScore })),
    isUnitDirectorReadout ? unitAutoReadouts.length : scoredIndicatorDrafts.length,
  ), [displayedWeeklyScore, isUnitDirectorReadout, scoredIndicatorDrafts.length, selectedRecords, unitAutoReadouts.length]);
  const indicatorRepReference = isUnitDirectorReadout ? unitDirectorPosition?.rep : selectedPosition?.rep;
  const axisMaximum = chartAxisMaximum([...chartVisibleData, { period: "Actual", date: date, score: displayedWeeklyScore }], ["score"]);

  useEffect(() => {
    const nextProfile = unitProfiles[0];
    setSelectedProfileId(nextProfile?.id ?? "");
  }, [unitProfiles, selectedUnitId]);

  useEffect(() => {
    setIndicatorDrafts(draftFromPosition(selectedPosition));
    setNotice("");
  }, [selectedPosition?.id]);

  useEffect(() => setVisibleCount(trendData.length), [cadence, selectedProfile?.id, selectedPosition?.id, trendData.length]);

  useEffect(() => {
    if (!goalTargets.length) return;
    if (!goalTargets.some((target) => target.id === goalDraft.targetId)) {
      setGoalDraft((current) => ({ ...current, targetId: goalTargets[0].id }));
    }
  }, [goalDraft.targetId, goalTargets]);

  useEffect(() => {
    if (goalDraft.targetId === UNIT_GOAL_TARGET || selectedProfileId === goalDraft.targetId) return;
    setSelectedProfileId(goalDraft.targetId);
  }, [goalDraft.targetId, selectedProfileId]);

  useEffect(() => {
    if (!goalDraft.effectiveDate || date === goalDraft.effectiveDate) return;
    setDate(goalDraft.effectiveDate);
  }, [date, goalDraft.effectiveDate]);

  function updateIndicator(index: number, patch: Partial<IndicatorDraft>) {
    setNotice("");
    setIndicatorDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  function updateIndicatorProgress(index: number, value: string) {
    const current = indicatorDrafts[index];
    if (!current) return;
    const actualValue = normalizeIndicatorActualValue(value.replace("%", ""));
    const normalized = normalizeIndicatorAgainstGoal({ ...current, actualValue }, findGoalForIndicator(current));
    updateIndicator(index, normalized);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!selectedProfile || !selectedPosition) {
      setNotice("Selecciona un colaborador con puesto e indicadores.");
      return;
    }
    const missingGoal = scoredIndicatorDrafts.find((indicator) => indicatorRequiresGoal(indicator) && !indicator.goalAssignmentId);
    if (missingGoal) {
      setNotice(`El indicador "${missingGoal.indicatorName}" requiere una meta vigente relacionada antes de guardar la evaluación semanal.`);
      return;
    }
    try {
      const saved = saveWeeklyEvaluation({
        businessUnitId: selectedUnitId,
        collaboratorProfileId: selectedProfile.id,
        date,
        evaluatorName: accessDisplayName,
        goalAssignmentId: effectiveGoal?.id,
        goalEffectiveDate: effectiveGoal?.effectiveDate,
        goalLabel: effectiveGoal?.goalLabel,
        goalTargetValue: effectiveGoalWeeklyTarget ?? effectiveGoal?.targetValue,
        indicators: scoredIndicatorDrafts,
        positionId: selectedPosition.id,
      });
      setNotice(`Indicadores guardados: ${saved.weightedScore}% · ${saved.weeklyCondition}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No fue posible guardar indicadores.");
    }
  }

  function submitGoal(event: FormEvent) {
    event.preventDefault();
    const target = goalTargets.find((item) => item.id === goalDraft.targetId);
    const indicators = autoAssignedGoalIndicators;
    if (!target) {
      setNotice("Selecciona a quién se asigna la meta.");
      return;
    }
    if (!indicators.length) {
      setNotice("Este puesto no tiene indicadores, REP o KPIs asociados automáticamente. Revisa la guía operativa o el catálogo del puesto.");
      return;
    }
    const invalidIndicator = indicators.find((indicator) => !Number.isFinite(goalDraftTargetForIndicator(indicator)) || goalDraftTargetForIndicator(indicator) <= 0);
    if (invalidIndicator) {
      setNotice(`La meta de "${invalidIndicator.name}" debe ser mayor a 0.`);
      return;
    }
    const goalDate = goalDraftDate;
    let updated = 0;
    const goalInputs: GoalInput[] = indicators.map((indicator) => {
      const indicatorKey = indicator.unitIndicatorName ?? indicator.name;
      const indicatorCadence = goalDraftCadenceForIndicator(indicator);
      const periodBounds = getGoalPeriodBounds(goalDate, indicatorCadence);
      const inheritedGoal = inheritedGoalForIndicator(indicator);
      const usesInheritedQuantity = Boolean(inheritedGoal && target.id !== UNIT_GOAL_TARGET && indicator.valueKind === "quantity");
      const allocationPercent = usesInheritedQuantity
        ? normalizeGoalAllocationPercent(goalDraftAllocationForIndicator(indicator))
        : undefined;
      const existingGoal = goalAssignments.find((goal) =>
        goal.status === "active"
        && goal.businessUnitId === selectedUnitId
        && goalMatchesTarget(goal, target.id)
        && (goal.cadence ?? "week") === indicatorCadence
        && isSameGoalPeriod(goal, goalDate)
        && normalizeGoalText(goal.unitIndicatorName ?? goal.goalLabel) === normalizeGoalText(indicatorKey)
      );
      if (existingGoal) updated += 1;
      return {
        allocationPercent,
        businessUnitId: selectedUnitId,
        cadence: indicatorCadence,
        createdAt: existingGoal?.createdAt,
        effectiveDate: goalDate,
        goalLabel: indicator.name,
        id: existingGoal?.id,
        metricSource: "focus-daily",
        notes: goalDraft.notes,
        parentGoalId: usesInheritedQuantity ? inheritedGoal?.id : undefined,
        periodEndDate: periodBounds.endDate,
        periodStartDate: periodBounds.startDate,
        revision: existingGoal?.revision ?? 0,
        scope: target.id === UNIT_GOAL_TARGET ? "unit" : "profile",
        sourceTargetValue: usesInheritedQuantity ? inheritedGoal?.targetValue : undefined,
        sourceProfileId: accessProfileId || "master",
        status: "active",
        targetProfileId: target.id === UNIT_GOAL_TARGET ? undefined : target.id,
        targetValue: goalDraftTargetForIndicator(indicator),
        unitIndicatorId: indicator.unitIndicatorId ?? indicator.id,
        unitIndicatorName: indicatorKey,
        valueKind: indicator.valueKind,
      };
    });
    upsertGoals(goalInputs);
    setNotice(`${indicators.length} indicador${indicators.length === 1 ? "" : "es"} asociado${indicators.length === 1 ? "" : "s"} ${updated ? "actualizado" : "guardado"}${indicators.length === 1 ? "" : "s"} para ${target.label}. Disponible en Focus e indicadores.`);
    setGoalDraft((current) => ({ ...current, notes: "" }));
  }

  function currentGoalForIndicator(indicator: GoalIndicatorOption) {
    const indicatorKey = indicator.unitIndicatorName ?? indicator.name;
    return selectedTargetGoals.find((goal) =>
      normalizeGoalText(goal.unitIndicatorName ?? goal.goalLabel) === normalizeGoalText(indicatorKey)
    );
  }

  function inheritedGoalForIndicator(indicator: GoalIndicatorOption) {
    if (isUnitGoalTarget) return undefined;
    return goalPanelGoals.find((goal) =>
      goal.scope === "unit" && goalMatchesGoalIndicator(goal, indicator)
    );
  }

  function goalDraftCadenceForIndicator(indicator: GoalIndicatorOption) {
    const draftCadence = goalDraft.cadences[indicator.id];
    if (draftCadence) return draftCadence;
    return currentGoalForIndicator(indicator)?.cadence
      ?? inheritedGoalForIndicator(indicator)?.cadence
      ?? "week";
  }

  function goalPeriodForIndicator(indicator: GoalIndicatorOption) {
    return getGoalPeriodBounds(goalDraftDate, goalDraftCadenceForIndicator(indicator));
  }

  function goalDraftAllocationForIndicator(indicator: GoalIndicatorOption) {
    const savedGoal = currentGoalForIndicator(indicator);
    const inheritedGoal = inheritedGoalForIndicator(indicator);
    const draftValue = goalDraft.allocationPercents[indicator.id];
    if (draftValue !== undefined) return draftValue;
    if (savedGoal?.allocationPercent !== undefined) return String(savedGoal.allocationPercent);
    if (savedGoal && inheritedGoal && inheritedGoal.targetValue > 0 && savedGoal.valueKind === "quantity") {
      return String(normalizeGoalAllocationPercent((savedGoal.targetValue / inheritedGoal.targetValue) * 100));
    }
    return "100";
  }

  function goalDraftValueForIndicator(indicator: GoalIndicatorOption) {
    const savedValue = currentGoalForIndicator(indicator)?.targetValue;
    const inheritedValue = inheritedGoalForIndicator(indicator)?.targetValue;
    const draftValue = goalDraft.targetValues[indicator.id];
    if (draftValue !== undefined) return draftValue;
    if (Number.isFinite(savedValue) && Number(savedValue) > 0) return String(savedValue);
    if (Number.isFinite(inheritedValue) && Number(inheritedValue) > 0) return String(inheritedValue);
    return defaultTargetValueForGoalIndicator(indicator);
  }

  function goalDraftTargetForIndicator(indicator: GoalIndicatorOption) {
    const inheritedGoal = inheritedGoalForIndicator(indicator);
    if (inheritedGoal && !isUnitGoalTarget && indicator.valueKind === "quantity") {
      return Math.round(calculateAllocatedGoalTarget(inheritedGoal, goalDraftAllocationForIndicator(indicator)));
    }
    return Math.max(0, Math.round(Number(goalDraftValueForIndicator(indicator))));
  }

  function updateGoalTargetValue(indicator: GoalIndicatorOption, value: string) {
    const nextValue = value.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "");
    setGoalDraft((current) => ({
      ...current,
      targetValues: {
        ...current.targetValues,
        [indicator.id]: nextValue,
      },
    }));
  }

  function updateGoalAllocationPercent(indicator: GoalIndicatorOption, value: string) {
    const sanitized = value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
    setGoalDraft((current) => ({
      ...current,
      allocationPercents: {
        ...current.allocationPercents,
        [indicator.id]: sanitized,
      },
    }));
  }

  function updateGoalCadence(indicator: GoalIndicatorOption, cadence: GoalCadence) {
    setGoalDraft((current) => ({
      ...current,
      cadences: {
        ...current.cadences,
        [indicator.id]: cadence,
      },
    }));
  }

  function sharedAllocationValue(plan: SharedQuantityPlan, item: SharedQuantityPlanProfile, index: number) {
    const draftValue = sharedAllocationDrafts[plan.unitGoal.id]?.[item.profile.id];
    if (draftValue !== undefined) return draftValue;
    if (item.currentGoal?.targetValue && plan.unitGoal.targetValue > 0) {
      return String(item.currentGoal.targetValue);
    }
    if (item.currentGoal?.allocationPercent !== undefined) {
      return String(calculateAllocatedGoalTarget(plan.unitGoal, item.currentGoal.allocationPercent));
    }
    return String(suggestedSharedQuantity(index, plan.profiles.length, plan.unitGoal.targetValue));
  }

  function sharedAllocationTotal(plan: SharedQuantityPlan) {
    return Math.round(plan.profiles.reduce((sum, item, index) => sum + quantityFromDraft(sharedAllocationValue(plan, item, index)), 0) * 100) / 100;
  }

  function sharedAllocationCompletionPercent(plan: SharedQuantityPlan) {
    if (!plan.unitGoal.targetValue) return 0;
    return Math.round((sharedAllocationTotal(plan) / plan.unitGoal.targetValue) * 10000) / 100;
  }

  function updateSharedAllocation(unitGoalId: string, profileId: string, value: string) {
    const sanitized = value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
    setSharedAllocationDrafts((current) => ({
      ...current,
      [unitGoalId]: {
        ...(current[unitGoalId] ?? {}),
        [profileId]: sanitized,
      },
    }));
  }

  function saveSharedQuantityPlan(plan: SharedQuantityPlan) {
    const total = sharedAllocationTotal(plan);
    if (Math.abs(total - plan.unitGoal.targetValue) > 0.01) {
      setNotice(`El reparto de "${plan.unitGoal.goalLabel}" debe sumar ${formatGoalNumber(plan.unitGoal.targetValue)}. Actualmente suma ${formatGoalNumber(total)}.`);
      return;
    }
    const bounds = getGoalPeriodBounds(plan.unitGoal.effectiveDate, plan.unitGoal.cadence ?? "week");
    const goalInputs: GoalInput[] = plan.profiles.map((item, index) => {
      const targetValue = quantityFromDraft(sharedAllocationValue(plan, item, index));
      const allocationPercent = allocationPercentFromQuantity(targetValue, plan.unitGoal.targetValue);
      const existingGoal = goalAssignments.find((goal) =>
        goal.status === "active"
        && goal.businessUnitId === selectedUnitId
        && goal.scope === "profile"
        && goal.targetProfileId === item.profile.id
        && (goal.cadence ?? "week") === (plan.unitGoal.cadence ?? "week")
        && isSameGoalPeriod(goal, plan.unitGoal.effectiveDate)
        && (goal.parentGoalId === plan.unitGoal.id || goalMatchesGoalIndicator(goal, plan.indicator))
      );
      return {
        allocationPercent,
        businessUnitId: selectedUnitId,
        cadence: plan.unitGoal.cadence ?? "week",
        createdAt: existingGoal?.createdAt,
        effectiveDate: plan.unitGoal.effectiveDate,
        goalLabel: plan.unitGoal.goalLabel,
        id: existingGoal?.id,
        metricSource: "focus-daily",
        notes: existingGoal?.notes ?? plan.unitGoal.notes,
        parentGoalId: plan.unitGoal.id,
        periodEndDate: bounds.endDate,
        periodStartDate: bounds.startDate,
        revision: existingGoal?.revision ?? 0,
        scope: "profile",
        sourceProfileId: accessProfileId || "master",
        sourceTargetValue: plan.unitGoal.targetValue,
        status: "active",
        targetProfileId: item.profile.id,
        targetValue,
        unitIndicatorId: plan.unitGoal.unitIndicatorId ?? plan.indicator.unitIndicatorId ?? plan.indicator.id,
        unitIndicatorName: plan.unitGoal.unitIndicatorName ?? plan.indicator.unitIndicatorName ?? plan.indicator.name,
        valueKind: "quantity",
      };
    });
    upsertGoals(goalInputs);
    setNotice(`Reparto guardado para "${plan.unitGoal.goalLabel}". La meta queda distribuida en ${formatGoalNumber(plan.unitGoal.targetValue)} unidades entre ${plan.profiles.length} puestos.`);
  }

  return <div className="indicator-metrics">
    <section className="indicator-hero">
      <div>
        <p className="eyebrow">Fuente 2 · Semanal</p>
        <h2>Indicadores y Metas</h2>
        <p>Evalúa los indicadores fundamentales del puesto, asigna metas y consulta la tendencia desde una sola pantalla.</p>
      </div>
      {allowedProfileIds ? <div className="compact-context-card">
        <span>Unidad</span>
        <strong>{selectedUnit?.name ?? "Sin unidad"}</strong>
      </div> : <label className="unit-context-select">
        <span>Unidad</span>
        <select value={selectedUnitId} onChange={(event) => setSelectedUnitId(event.target.value)}>{units.filter((unit) => unit.status === "active").map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select>
      </label>}
    </section>

    <div className="indicator-grid is-score-only">
      <section className="panel indicator-score-card">
        <p className="eyebrow">Resultado semanal general</p>
        <strong>{displayedWeeklyScore}%</strong>
        <ConditionBadge condition={displayedCondition.weeklyCondition} />
        <span>{readoutSubjectLabel}</span>
        <small>{isUnitDirectorReadout
          ? "Lectura automática del REP de unidad con base en las metas generales cumplidas."
          : "Promedio del avance real contra las metas aplicables a los indicadores del puesto."}</small>
      </section>
    </div>

    {canAssignGoals ? <section className="panel indicator-goal-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Metas jerárquicas</p>
          <h2>{accessMode === "master" ? "Meta final de unidad" : accessRole === "Director de Unidad" ? "Metas de unidad y divisionales" : "Metas a ejecutivos"}</h2>
        </div>
        <span className="count-badge">{selectedTargetGoals.length} vigentes</span>
      </div>
      <form className="goal-assignment-form" onSubmit={submitGoal}>
        <label className="goal-assignee-field"><span>Asignar a</span><select value={goalDraft.targetId} onChange={(event) => setGoalDraft((current) => ({ ...current, targetId: event.target.value }))}>
          {goalTargets.map((target) => <option key={target.id} value={target.id}>{target.label}</option>)}
        </select><small>{selectedTargetGoals.length ? `${selectedTargetGoals.length} meta${selectedTargetGoals.length === 1 ? "" : "s"} vigente${selectedTargetGoals.length === 1 ? "" : "s"} en esta fecha.` : "Sin metas vigentes para esta fecha."}</small></label>
        <label className="goal-date-field"><span>Inicio base</span><input type="date" value={goalDraft.effectiveDate} onChange={(event) => setGoalDraft((current) => ({ ...current, effectiveDate: event.target.value }))} /><small>Rango visible: {goalDraftPeriod.startDate} al {goalDraftPeriod.endDate}</small></label>
        <div className="goal-target-values">
          <span>{isUnitGoalTarget ? "Metas generales" : "Metas del puesto"}</span>
          {autoAssignedGoalIndicators.length ? <div>
            {autoAssignedGoalIndicators.map((indicator) => {
              const suffix = indicator.valueKind === "percentage" ? "%" : "";
              const inheritedGoal = inheritedGoalForIndicator(indicator);
              const allocationValue = goalDraftAllocationForIndicator(indicator);
              const calculatedTarget = goalDraftTargetForIndicator(indicator);
              const usesAllocation = Boolean(inheritedGoal && !isUnitGoalTarget && indicator.valueKind === "quantity");
              const indicatorCadence = goalDraftCadenceForIndicator(indicator);
              const indicatorPeriod = goalPeriodForIndicator(indicator);
              return <article className={`${inheritedGoal ? "has-inherited-goal" : ""} ${usesAllocation ? "uses-allocation" : ""}`} key={indicator.id}>
                <div>
                  <b>{indicator.name}</b>
                  {indicator.description ? <p>{indicator.description}</p> : null}
                  <small>{indicator.valueKind === "quantity" ? "Cantidad" : indicator.measurementKind === "rep-compliance" ? "REP porcentual" : "Porcentaje"}</small>
                  {inheritedGoal ? <small className="goal-inherited-note">{usesAllocation ? `Base general ${inheritedGoal.targetValue}${suffix}` : "Meta individual 100%"}</small> : null}
                </div>
                <label aria-label={`Periodo para ${indicator.name}`} className="goal-cadence-field">
                  <span>Periodo</span>
                  <select value={indicatorCadence} onChange={(event) => updateGoalCadence(indicator, event.target.value as GoalCadence)}>
                    <option value="week">Semanal</option>
                    <option value="month">Mensual</option>
                    <option value="year">Anual</option>
                  </select>
                  <small>{indicatorPeriod.startDate} al {indicatorPeriod.endDate}</small>
                </label>
                {usesAllocation ? <label aria-label={`Porcentaje de participación para ${indicator.name}`} className="goal-allocation-field">
                  <span>Participación</span>
                  <input
                    inputMode="decimal"
                    max="100"
                    min="0"
                    step="1"
                    type="number"
                    value={allocationValue}
                    onChange={(event) => updateGoalAllocationPercent(indicator, event.target.value)}
                  />
                  <strong>%</strong>
                </label> : null}
                <label aria-label={`Meta para ${indicator.name}`} className="goal-target-field">
                  <span>{usesAllocation ? "Meta calculada" : "Meta"}</span>
                  <input
                    inputMode="numeric"
                    min="1"
                    readOnly={indicator.valueKind === "percentage" || usesAllocation}
                    step="1"
                    type="number"
                    value={usesAllocation ? String(calculatedTarget) : goalDraftValueForIndicator(indicator)}
                    onChange={(event) => updateGoalTargetValue(indicator, event.target.value)}
                  />
                  {suffix ? <strong>{suffix}</strong> : null}
                </label>
              </article>;
            })}
          </div> : <em>Selecciona un destino con indicadores para capturar metas.</em>}
        </div>
        <label className="goal-notes-field"><span>Comentario</span><textarea placeholder="Observación opcional" rows={1} value={goalDraft.notes} onChange={(event) => setGoalDraft((current) => ({ ...current, notes: event.target.value }))} /></label>
        <button className="primary-button" type="submit"><Icon name="check" size={15} /> Guardar metas</button>
      </form>
      {sharedQuantityPlans.length ? <details className="shared-goal-allocation-panel" open={sharedAllocationExpanded} onToggle={(event) => setSharedAllocationExpanded(event.currentTarget.open)}>
        <summary className="shared-goal-allocation-head">
          <div>
            <p className="eyebrow">Metas compartidas por cantidad</p>
            <h3>Reparto de contribución</h3>
          </div>
          <span>{sharedQuantityPlans.length} meta{sharedQuantityPlans.length === 1 ? "" : "s"} compartida{sharedQuantityPlans.length === 1 ? "" : "s"}</span>
          <strong className="shared-goal-toggle-label">{sharedAllocationExpanded ? "Ocultar reparto" : "Ver reparto"}</strong>
        </summary>
        <div className="shared-goal-allocation-body">{sharedQuantityPlans.map((plan) => {
          const suffix = plan.unitGoal.valueKind === "percentage" ? "%" : "";
          const total = sharedAllocationTotal(plan);
          const totalPercent = sharedAllocationCompletionPercent(plan);
          const isBalanced = Math.abs(total - plan.unitGoal.targetValue) <= 0.01;
          return <article className="shared-goal-card" key={plan.unitGoal.id}>
            <header>
              <div>
                <b>{plan.unitGoal.goalLabel}</b>
                <small>{formatGoalCadence(plan.unitGoal.cadence)} · Meta general {formatGoalNumber(plan.unitGoal.targetValue)}{suffix}</small>
              </div>
              <strong className={isBalanced ? "is-balanced" : "is-unbalanced"}>{formatGoalNumber(totalPercent)}%</strong>
            </header>
            <div className="shared-goal-rows">
              {plan.profiles.map((item, index) => {
                const value = sharedAllocationValue(plan, item, index);
                const calculated = quantityFromDraft(value);
                const calculatedPercent = allocationPercentFromQuantity(calculated, plan.unitGoal.targetValue);
                return <label className="shared-goal-row" key={item.profile.id}>
                  <span>
                    <b>{item.profile.name}</b>
                    <small>{item.position?.name ?? "Puesto activo"}</small>
                  </span>
                  <input
                    inputMode="decimal"
                    max={plan.unitGoal.targetValue}
                    min="0"
                    step="1"
                    type="number"
                    value={value}
                    onChange={(event) => updateSharedAllocation(plan.unitGoal.id, item.profile.id, event.target.value)}
                  />
                  <em>{formatGoalNumber(calculated)} asignado · {formatGoalNumber(calculatedPercent)}%</em>
                </label>;
              })}
            </div>
            <footer>
              <span>{isBalanced ? `Reparto completo: ${formatGoalNumber(total)} de ${formatGoalNumber(plan.unitGoal.targetValue)}.` : `El reparto debe sumar ${formatGoalNumber(plan.unitGoal.targetValue)}. Actualmente suma ${formatGoalNumber(total)}.`}</span>
              <button className="secondary-button" disabled={!isBalanced} type="button" onClick={() => saveSharedQuantityPlan(plan)}>
                <Icon name="check" size={15} /> Guardar reparto
              </button>
            </footer>
          </article>;
        })}</div>
      </details> : null}
    </section> : null}

    <section className="panel indicator-trend-panel">
      <div className="panel-heading indicator-trend-heading">
        <div><p className="eyebrow">Tendencia por indicadores</p><h2>{readoutSubjectLabel}</h2></div>
        <div className="indicator-trend-tools">
          <label className="chart-cadence-select"><span>Lectura</span><select value={cadence} onChange={(event) => setCadence(event.target.value as TrendCadence)}><option value="week">Semanal</option><option value="month">Mensual</option><option value="year">Anual</option></select></label>
          <ChartZoomControls total={trendData.length} visible={activeVisibleCount} onVisibleChange={setVisibleCount} />
        </div>
      </div>
      {latestTrend ? <div className="trend-reading-strip">
        <div><span>Índice actual</span><strong>{latestTrend.score}%</strong></div>
        <div><span>Índice anterior</span><strong>{latestTrend.previousScore === undefined ? "Sin histórico" : `${latestTrend.previousScore}%`}</strong></div>
        <div><span>Variación</span><strong>{latestTrend.delta === undefined ? "Sin comparativo" : `${latestTrend.delta > 0 ? "+" : ""}${latestTrend.delta} pts`}</strong></div>
        <div><span>Condición</span><ConditionBadge condition={latestTrend.condition} /></div>
      </div> : null}
      <div className="chart-wrap indicator-chart-wrap">
        {trendData.length ? <ResponsiveContainer height="100%" width="100%">
          <LineChart data={chartVisibleData} margin={{ bottom: 4, left: -12, right: 18, top: 12 }}>
            <CartesianGrid stroke="#d8ddda" strokeDasharray="3 4" vertical={false} />
            <XAxis axisLine={false} dataKey="period" fontSize={12} stroke="#6f7b77" tickLine={false} />
            <YAxis axisLine={false} domain={[0, axisMaximum]} fontSize={12} stroke="#6f7b77" tickFormatter={(value) => `${value}%`} tickLine={false} width={54} />
            <ReferenceLine label={{ fill: "#52708b", fontSize: 11, position: "insideTopRight", value: "Meta 100%" }} stroke="#7891a7" strokeDasharray="5 5" y={100} />
            <Tooltip
              contentStyle={{ background: "#ffffff", border: "1px solid #d8e4ef", borderRadius: 8 }}
              formatter={(value) => [`${Number(value ?? 0)}%`, "Indicadores de puesto"]}
              labelFormatter={(_, payload) => {
                const point = payload[0]?.payload;
                return point?.isBaseline ? "Base 0 · contra meta" : `${formatChartPointDate(point?.date)} · ${point?.condition ?? ""}`;
              }}
            />
            <Line activeDot={{ r: 6 }} dataKey="score" dot={{ fill: "#0877ce", r: 4, stroke: "#ffffff", strokeWidth: 2 }} stroke="#0877ce" strokeWidth={3} type="monotone" />
          </LineChart>
        </ResponsiveContainer> : <div className="empty-state"><Icon name="chart" size={26} /><strong>Sin tendencia disponible</strong><span>Guarda la primera evaluación semanal para iniciar la gráfica de indicadores.</span></div>}
      </div>
    </section>

    {isUnitDirectorReadout ? <section className="panel indicator-evaluation is-auto-readout">
      <div className="panel-heading">
        <div><p className="eyebrow">Captura semanal</p><h2>REP de unidad automático</h2></div>
        <span className="count-badge">{unitAutoReadouts.length} metas generales</span>
      </div>
      {notice ? <p className="admin-notice">{notice}</p> : null}
      {indicatorRepReference ? <div className="rep-reference-strip">
        <span>REP evaluado</span>
        <strong>{indicatorRepReference}</strong>
      </div> : null}
      <div className="unit-auto-readout-copy">
        <Icon name="chart" size={18} />
        <p>La Dirección no captura manualmente el REP de la unidad. El resultado se calcula con el cumplimiento de las metas generales y los aportes registrados por los puestos relacionados.</p>
      </div>
      {unitAutoReadouts.length ? <div className="indicator-table-wrap">
        <table className="indicator-table unit-auto-readout-table">
          <thead><tr><th>Meta general</th><th>Meta</th><th>Avance registrado</th><th>Aportes</th><th>Resultado</th></tr></thead>
          <tbody>{unitAutoReadouts.map((indicator) => {
            const suffix = indicator.valueKind === "percentage" ? "%" : "";
            const status = getIndicatorStatusMetaFromResult(indicator.result, indicator.score);
            return <tr key={indicator.id}>
              <td><b>{indicator.name}</b><small>{indicator.description ?? "Indicador general de la unidad"}</small></td>
              <td><span className="indicator-target-value">{indicator.hasGoal ? `${indicator.targetValue}${suffix}` : "Sin meta"}</span></td>
              <td><span className="indicator-target-value">{indicator.actualValue}{suffix}</span></td>
              <td><span className="indicator-target-value">{indicator.contributors || "Sin aportes"}</span></td>
              <td><span className={`indicator-status-pill is-${status.color}`}><i />{indicator.score}% · {indicator.result}</span></td>
            </tr>;
          })}</tbody>
        </table>
      </div> : <div className="empty-state"><Icon name="clipboard" size={26} /><strong>Sin metas generales</strong><span>Primero establece las metas generales de la unidad para activar el REP automático.</span></div>}
    </section> : <form className="panel indicator-evaluation" onSubmit={submit}>
      <div className="panel-heading">
        <div><p className="eyebrow">Captura semanal</p><h2>Indicadores fundamentales</h2></div>
        <button className="primary-button" disabled={!selectedProfile || !selectedPosition || !indicatorDrafts.length} type="submit"><Icon name="check" size={15} /> Guardar semana</button>
      </div>
      {notice ? <p className="admin-notice">{notice}</p> : null}
      {indicatorRepReference ? <div className="rep-reference-strip">
        <span>REP evaluado</span>
        <strong>{indicatorRepReference}</strong>
      </div> : null}
      {scoredIndicatorDrafts.length ? <div className="indicator-table-wrap">
        <table className="indicator-table">
          <thead><tr><th>Indicador</th><th>Base</th><th>Resultado</th><th>Valor real</th><th>Meta</th><th>Score</th><th>Comentario</th></tr></thead>
          <tbody>{scoredIndicatorDrafts.map((indicator, index) => {
            const status = getIndicatorStatusMetaFromResult(indicator.result, indicator.score);
            const basis = measurementKindMeta(indicator.measurementKind);
            const valueKind = inferIndicatorValueKind(indicator.indicatorName, indicator.measurementKind, indicator.valueKind);
            const valueSuffix = valueKind === "percentage" ? "%" : "";
            const targetValue = indicator.targetValue ?? indicatorTargetValue(indicator, effectiveGoal);
            return <tr key={indicator.indicatorId}>
              <td><b>{indicator.indicatorName}</b></td>
              <td>
                <span className={`indicator-basis-pill is-${basis.tone}`}>{basis.label}</span>
                <small className="indicator-basis-detail">{basis.detail}</small>
              </td>
              <td>
                <span className={`indicator-status-pill is-${status.color}`}><i />{indicator.result}</span>
              </td>
            <td>
              <label className="activity-progress-field indicator-progress-field">
                <input
                  inputMode="numeric"
                  max={valueKind === "percentage" ? "100" : undefined}
                  min="0"
                  pattern="[0-9]*"
                  step="1"
                  type="number"
                  value={String(indicator.actualValue ?? 0).replace(/^0+(?=\d)/, "")}
                  onFocus={(event) => event.currentTarget.select()}
                  onKeyDown={(event) => {
                    if (["e", "E", "+", "-", "."].includes(event.key)) event.preventDefault();
                  }}
                  onChange={(event) => updateIndicatorProgress(index, event.target.value)}
                />
                {valueSuffix ? <b>{valueSuffix}</b> : null}
              </label>
            </td>
            <td><span className="indicator-target-value">{targetValue}{valueSuffix}</span></td>
            <td><span className="indicator-score-value">{indicator.score}%</span></td>
            <td><textarea value={indicator.observations} onChange={(event) => updateIndicator(index, { observations: event.target.value })} placeholder="Comentario opcional" rows={1} /></td>
          </tr>;
          })}</tbody>
        </table>
      </div> : <div className="empty-state"><Icon name="clipboard" size={26} /><strong>Este puesto no tiene KPIs completos</strong><span>Configura los indicadores desde Administración antes de evaluar semanalmente.</span></div>}
    </form>}

    <section className="panel indicator-history">
      <div className="panel-heading"><div><p className="eyebrow">Histórico semanal</p><h2>Últimos registros por indicadores</h2></div></div>
      {recentRecords.length ? <div className="recent-list">{recentRecords.map((record) => {
        const profile = profiles.find((item) => item.id === record.collaboratorProfileId);
        const position = positions.find((item) => item.id === record.positionId);
        return <article key={record.id}><div className="initials">{(profile?.name ?? "PI").slice(0, 2).toUpperCase()}</div><div><b>{profile?.name ?? "Perfil"}</b><span>{position?.name ?? "Puesto"} · {record.week}</span></div><strong>{record.weightedScore}%</strong><ConditionBadge condition={record.weeklyCondition} /></article>;
      })}</div> : <div className="empty-state"><Icon name="archive" size={26} /><strong>Sin registros semanales</strong><span>Guarda la primera evaluación para iniciar el histórico independiente.</span></div>}
    </section>
  </div>;
}
