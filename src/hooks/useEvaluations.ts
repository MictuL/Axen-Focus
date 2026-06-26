import { useEffect, useMemo, useState } from "react";
import { isPositionReady } from "../lib/catalog";
import {
  calculateStatistic,
  calculatePerformanceIndex,
  clampPercentage,
  conditionFormula,
  conditionToStatus,
  getAlerts,
  getConditionFromTrend,
  getEvaluationTrendScore,
  getEvaluationProfileKey,
  getStatisticPerformanceIndex,
  getTrend,
  hasSustainedPower,
  normalizeName,
} from "../lib/evaluation";
import { calculateFocusDailyScore } from "../lib/focusDaily";
import type { BusinessUnit, Evaluation, EvaluationDraft, Position } from "../types";
import { matchesEvaluationReset, type EvaluationResetRequest } from "../lib/evaluationReset";
import { getPositionProfileId } from "../lib/fundacionAccess";

const STORAGE_KEY = "axen-performance-evaluations-v9";
const LEGACY_STORAGE_KEYS = ["axen-performance-evaluations-v8", "axen-performance-evaluations-v7", "axen-performance-evaluations-v6", "axen-performance-evaluations-v5", "axen-performance-evaluations-v4"];

function migrateLegacyEvaluation(item: Evaluation): Evaluation {
  if (item.methodVersion) return item;
  const currentValue = Number(item.finalScore) || 0;
  const statistic = calculateStatistic({
    name: "Cumplimiento histórico migrado",
    description: "Registro conservado desde el método anterior.",
    measurementUnit: "%",
    previousValue: currentValue,
    currentValue,
    targetValue: 100,
  });
  const condition = item.status === "Crítico" ? "Inexistencia"
    : item.status === "Riesgo" ? "Peligro"
      : item.status === "En observación" ? "Emergencia"
        : item.status === "Bueno" ? "Normal"
          : "Afluencia";
  return {
    ...item,
    methodVersion: "condition-v1",
    subjectType: "collaborator",
    productDefinition: item.rep,
    statistics: [{ ...statistic, condition }],
    condition,
    conditionFormula: conditionFormula[condition],
    problemStatement: item.incidents,
    dataAnalysis: item.observations,
    solutionPlan: item.improvementAction,
    nextTarget: 100,
  };
}

function normalizeStoredEvaluation(item: Evaluation): Evaluation {
  const migrated = migrateLegacyEvaluation(item);
  const condition = migrated.condition ?? "Inexistencia";
  const statistics = migrated.statistics?.map((statistic) => ({
    ...statistic,
    currentValue: statistic.measurementMode === "percentage" ? clampPercentage(statistic.currentValue) : statistic.currentValue,
    targetAttainment: clampPercentage(statistic.targetAttainment),
    performanceIndex: statistic.performanceIndex ?? getStatisticPerformanceIndex(statistic),
    condition: statistic.condition ?? "Inexistencia",
  }));
  return {
    ...migrated,
    condition,
    conditionFormula: condition ? conditionFormula[condition] : migrated.conditionFormula,
    finalScore: clampPercentage(migrated.finalScore),
    performanceIndex: statistics?.length ? calculatePerformanceIndex(statistics) : migrated.finalScore,
    statistics,
  };
}

const evaluationKey = (evaluation: Evaluation) => getEvaluationProfileKey(evaluation);
const focusTrendToOperationalCondition = (condition: NonNullable<Evaluation["focusDaily"]>["trendCondition"]) =>
  condition === "Sin histórico suficiente" ? "Inexistencia" : condition;

const evaluationOrder = (left: Evaluation, right: Evaluation) =>
  left.date.localeCompare(right.date)
  || left.digitalCaptureDate.localeCompare(right.digitalCaptureDate)
  || left.id.localeCompare(right.id);

function alignEvaluationProfilesWithPositions(evaluations: Evaluation[], positions: Position[]) {
  const positionById = new Map(positions.map((position) => [position.id, position]));
  let changed = false;
  const aligned = evaluations.map((evaluation) => {
    if (evaluation.subjectType === "unit") return evaluation;
    const position = positionById.get(evaluation.positionId);
    if (!position) return evaluation;
    const collaboratorProfileId = getPositionProfileId(position.id);
    if (
      evaluation.collaboratorProfileId === collaboratorProfileId
      && evaluation.evaluatedPersonName === position.name
      && evaluation.positionName === position.name
      && evaluation.area === position.area
    ) {
      return evaluation;
    }
    changed = true;
    return {
      ...evaluation,
      collaboratorProfileId,
      evaluatedPersonName: position.name,
      positionName: position.name,
      area: position.area,
    };
  });
  return { aligned, changed };
}

function matchingStatistic(evaluation: Evaluation, name: string, mode: string) {
  return evaluation.statistics?.find((statistic) =>
    normalizeName(statistic.name) === normalizeName(name)
    && (statistic.measurementMode ?? "numeric") === mode
  );
}

function applyTrendConditions(evaluations: Evaluation[]) {
  const groups = new Map<string, Evaluation[]>();
  evaluations.forEach((evaluation) => {
    const key = evaluationKey(evaluation);
    groups.set(key, [...(groups.get(key) ?? []), evaluation]);
  });

  const normalized = new Map<string, Evaluation>();
  groups.forEach((group) => {
    const sorted = [...group].sort(evaluationOrder);
    sorted.forEach((evaluation, index) => {
      const prior = sorted.slice(0, index);
      const previous = [...prior].reverse().find((item) => item.date !== evaluation.date);
      const distinctPrior = [...new Map(prior.map((item) => [item.date, item])).values()].sort(evaluationOrder);
      const trendScore = getEvaluationTrendScore(evaluation);
      const previousTrendScore = previous ? getEvaluationTrendScore(previous) : undefined;
      const focusResult = evaluation.methodVersion === "focus-daily-v5" || evaluation.focusDaily
        ? calculateFocusDailyScore(evaluation.statistics ?? [], distinctPrior.map((item) => ({
          date: item.date,
          finalScore: getEvaluationTrendScore(item),
          focusDaily: item.focusDaily,
        })))
        : undefined;
      const condition = focusResult
        ? focusTrendToOperationalCondition(focusResult.trendCondition)
        : getConditionFromTrend(trendScore, previousTrendScore, {
          hasPrevious: Boolean(previous),
          recentScores: [...distinctPrior.map(getEvaluationTrendScore), trendScore],
          sustainedPower: hasSustainedPower(prior, evaluation),
        });
      normalized.set(evaluation.id, {
        ...evaluation,
        methodVersion: focusResult ? "focus-daily-v5" : "trend-v4",
        condition,
        conditionFormula: conditionFormula[condition],
        status: conditionToStatus(condition),
        trend: getTrend(focusResult?.weightedScore ?? trendScore, focusResult?.previousWeightedScore ?? previousTrendScore),
        finalScore: focusResult?.weightedScore ?? evaluation.finalScore,
        performanceIndex: focusResult?.weightedScore ?? evaluation.performanceIndex,
        focusDaily: focusResult ? {
          totalActivities: focusResult.totalActivities,
          completedActivities: focusResult.completedActivities,
          inProgressActivities: focusResult.inProgressActivities,
          pendingActivities: focusResult.pendingActivities,
          blockedActivities: focusResult.blockedActivities,
          weightedScore: focusResult.weightedScore,
          goalCount: focusResult.goalCount,
          goalBreakdown: focusResult.goalBreakdown,
          generalStatus: focusResult.generalStatus,
          trendCondition: focusResult.trendCondition,
          trendDeltaPP: focusResult.trendDeltaPP,
          previousWeightedScore: focusResult.previousWeightedScore,
          rollingAverageLast4: focusResult.rollingAverageLast4,
          rollingMinimumLast4: focusResult.rollingMinimumLast4,
          isPowerCondition: focusResult.isPowerCondition,
          updatedAt: new Date().toISOString(),
        } : evaluation.focusDaily,
        statistics: evaluation.statistics?.map((statistic) => {
          const mode = statistic.measurementMode ?? "numeric";
          const previousStatistic = previous ? matchingStatistic(previous, statistic.name, mode) : undefined;
          const recentScores = distinctPrior.flatMap((item) => {
            const match = matchingStatistic(item, statistic.name, mode);
            return match ? [match.performanceIndex ?? match.targetAttainment] : [];
          });
          return {
            ...statistic,
            condition: getConditionFromTrend(
              statistic.performanceIndex ?? statistic.targetAttainment,
              previousStatistic?.performanceIndex ?? previousStatistic?.targetAttainment,
              {
                hasPrevious: Boolean(previousStatistic),
                recentScores: [...recentScores, statistic.performanceIndex ?? statistic.targetAttainment],
              },
            ),
          };
        }),
      });
    });
  });
  return evaluations.map((evaluation) => normalized.get(evaluation.id) ?? evaluation);
}

function loadEvaluations(): Evaluation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) ?? LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
    return stored ? applyTrendConditions((JSON.parse(stored) as Evaluation[]).map(normalizeStoredEvaluation)) : [];
  } catch {
    return [];
  }
}

export function useEvaluations(positions: Position[], units: BusinessUnit[]) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>(loadEvaluations);

  function save(next: Evaluation[]) {
    const trended = applyTrendConditions(next);
    setEvaluations(trended);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trended));
    return trended;
  }

  useEffect(() => {
    const { aligned, changed } = alignEvaluationProfilesWithPositions(evaluations, positions);
    if (changed) save(aligned);
  }, [evaluations, positions]);

  function addEvaluation(draft: EvaluationDraft) {
    const unit = units.find((item) => item.id === draft.businessUnitId);
    if (!unit) throw new Error("Selecciona una unidad de negocio válida.");
    if (draft.subjectType !== "collaborator") throw new Error("La unidad se calcula desde sus colaboradores y no admite una evaluación individual.");
    const position = positions.find((item) => item.id === draft.positionId && item.businessUnitId === draft.businessUnitId);
    if (!position) throw new Error("Selecciona un puesto válido.");
    if (!isPositionReady(position)) throw new Error("Este puesto todavía no tiene REP e indicadores oficiales.");
    if (!draft.date) throw new Error("Completa la fecha.");
    if (!draft.productDefinition.trim()) throw new Error("Define el producto terminado que se evaluará.");
    const subjectPositionId = position.id;
    const subjectName = position.name;
    const collaboratorProfileId = getPositionProfileId(subjectPositionId);
    const duplicate = evaluations.find((evaluation) =>
      evaluation.subjectType !== "unit"
      && evaluation.date === draft.date
      && getEvaluationProfileKey(evaluation) === getEvaluationProfileKey({
        businessUnitId: draft.businessUnitId,
        positionId: subjectPositionId,
        evaluatedPersonName: subjectName,
        collaboratorProfileId,
      })
    );
    if (duplicate) throw new Error(`Este perfil ya tiene un Focus Diario registrado el ${draft.date}.`);
    if (!draft.statistics.length) throw new Error("Agrega al menos una actividad para evaluar.");
    const previousForFocus = evaluations
      .filter((evaluation) =>
        evaluation.subjectType !== "unit"
        && getEvaluationProfileKey(evaluation) === getEvaluationProfileKey({
          businessUnitId: draft.businessUnitId,
          positionId: subjectPositionId,
          evaluatedPersonName: subjectName,
          collaboratorProfileId,
        })
        && evaluation.date < draft.date
      )
      .sort((left, right) => left.date.localeCompare(right.date));
    const focusResult = calculateFocusDailyScore(draft.statistics, previousForFocus.map((evaluation) => ({
      date: evaluation.date,
      finalScore: getEvaluationTrendScore(evaluation),
      focusDaily: evaluation.focusDaily,
    })));
    if (!focusResult.totalActivities) throw new Error("Agrega al menos una actividad con datos para evaluar.");
    const statistics = draft.statistics.map((statistic, index) => {
      const calculatedActivity = focusResult.activitiesWithCalculatedFields[index];
      const calculated = calculateStatistic({
        ...statistic,
        name: calculatedActivity?.name ?? statistic.name,
        description: calculatedActivity?.description ?? statistic.description,
        measurementMode: "percentage",
        measurementUnit: "%",
        activityStatus: calculatedActivity?.activityStatus ?? statistic.activityStatus,
        activityPriority: calculatedActivity?.activityPriority ?? statistic.activityPriority,
        activitySemaphore: calculatedActivity?.calculatedSemaphore ?? statistic.activitySemaphore,
        currentSelection: calculatedActivity?.activityStatus ?? statistic.currentSelection,
        currentValue: calculatedActivity?.currentValue ?? statistic.currentValue,
        targetValue: 100,
        internalPriorityWeight: calculatedActivity?.internalPriorityWeight ?? statistic.internalPriorityWeight,
        internalWeightedValue: calculatedActivity?.internalWeightedValue ?? statistic.internalWeightedValue,
      });
      return {
        ...calculated,
        activitySemaphore: calculatedActivity?.calculatedSemaphore ?? calculated.activitySemaphore,
        internalPriorityWeight: calculatedActivity?.internalPriorityWeight ?? calculated.internalPriorityWeight,
        internalWeightedValue: calculatedActivity?.internalWeightedValue ?? calculated.internalWeightedValue,
      };
    });
    const finalScore = focusResult.weightedScore;
    const performanceIndex = focusResult.weightedScore;
    const condition = focusTrendToOperationalCondition(focusResult.trendCondition);
    const evaluation: Evaluation = {
      id: `AXE-${Date.now()}`,
      collaboratorProfileId,
      documentFolio: draft.documentFolio,
      methodVersion: "focus-daily-v5",
      subjectType: "collaborator",
      businessUnitId: draft.businessUnitId,
      area: position.area,
      positionId: subjectPositionId,
      positionName: position.name,
      rep: draft.productDefinition.trim(),
      evaluatedPersonName: subjectName,
      evaluatorName: draft.evaluatorName.trim() || subjectName,
      date: draft.date,
      period: draft.period,
      week: draft.week,
      month: draft.month,
      season: draft.season,
      evaluatedActivity: "Evaluación flexible de producto, campos y condición",
      captureSource: draft.captureSource,
      physicalFormatId: draft.physicalFormatId,
      physicalFormatCode: draft.physicalFormatCode,
      physicalFormatTitle: draft.physicalFormatTitle,
      checklistResults: [],
      kpis: statistics.map((item) => ({ name: item.name, description: item.description, score: Math.max(1, Math.min(5, Math.round(item.targetAttainment / 20))) })),
      generalComplianceScore: Math.max(1, Math.min(5, Math.round(finalScore / 20))),
      evidenceIncidentScore: 5,
      observations: draft.observations,
      incidents: draft.problemStatement,
      improvementAction: draft.solutionPlan,
      followUpDate: draft.followUpDate,
      productDefinition: draft.productDefinition.trim(),
      statistics,
      condition,
      conditionFormula: conditionFormula[condition],
      problemStatement: draft.problemStatement.trim(),
      dataAnalysis: draft.dataAnalysis.trim(),
      solutionPlan: draft.solutionPlan.trim(),
      nextTarget: draft.nextTarget,
      finalScore,
      performanceIndex,
      focusDaily: {
        totalActivities: focusResult.totalActivities,
        completedActivities: focusResult.completedActivities,
        inProgressActivities: focusResult.inProgressActivities,
        pendingActivities: focusResult.pendingActivities,
        blockedActivities: focusResult.blockedActivities,
        weightedScore: focusResult.weightedScore,
        goalCount: focusResult.goalCount,
        goalBreakdown: focusResult.goalBreakdown,
        generalStatus: focusResult.generalStatus,
        trendCondition: focusResult.trendCondition,
        trendDeltaPP: focusResult.trendDeltaPP,
        previousWeightedScore: focusResult.previousWeightedScore,
        rollingAverageLast4: focusResult.rollingAverageLast4,
        rollingMinimumLast4: focusResult.rollingMinimumLast4,
        isPowerCondition: focusResult.isPowerCondition,
        peakStreakCount: focusResult.peakStreakCount,
        isPeakRecoveryPower: focusResult.isPeakRecoveryPower,
        updatedAt: new Date().toISOString(),
      },
      status: conditionToStatus(condition),
      trend: "Sin histórico",
      digitalCaptureDate: new Date().toISOString().slice(0, 10),
    };
    return save([evaluation, ...evaluations]).find((item) => item.id === evaluation.id) ?? evaluation;
  }

  function clearEvaluations() {
    save([]);
  }

  function resetEvaluations(request: EvaluationResetRequest) {
    const removed = evaluations.filter((evaluation) => matchesEvaluationReset(evaluation, request));
    save(evaluations.filter((evaluation) => !matchesEvaluationReset(evaluation, request)));
    return removed;
  }

  const alerts = useMemo(() => getAlerts(evaluations, positions, units), [evaluations, positions, units]);

  return { evaluations, alerts, addEvaluation, clearEvaluations, resetEvaluations };
}
