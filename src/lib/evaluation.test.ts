import { describe, expect, it } from "vitest";
import * as catalog from "../data/catalog";
import { businessUnits, operationFormats, physicalChecklistFormats, positions } from "../data/catalog";
import { seedEvaluations } from "../data/seed";
import {
  FUNDACION_DANTE_UNIT_ID,
  updatedBusinessUnits,
  updatedGuideUnits,
} from "../data/units/updatedOperationalGuides";
import { getEvaluationPointSeries, getIndividualSeries, getIndividualTrendSeries, getLatestProfileTrendStates, getOverviewSeries, getTrendSeries, getUnitSummaries } from "./analytics";
import { createPositionId, getOperationalLevel, hasOfficialKpis, isPositionReady } from "./catalog";
import { chartAxisMaximum, withZeroBaseline } from "./chartSeries";
import { calculateFinalScore, calculatePerformanceIndex, calculateStatistic, calculateTargetAttainment, getAlerts, getBusinessUnitScore, getCollaboratorEvaluationHistory, getConditionFromTrend, getLatestCollaboratorEvaluations, getMeasurementScore, getOperationalCondition, getOverallCondition, getPerformanceStatus, getTrend, hasSustainedPower } from "./evaluation";
import { getCurrentPeriodEvaluations, getEvaluationPeriod, getWeeklyEvaluationSchedule } from "./evaluationSchedule";
import { getEvaluationResetRange, matchesDocumentReset, matchesEvaluationReset, matchesOperationalGoalReset, matchesUnitConditionReviewReset, matchesWeeklyIndicatorReset } from "./evaluationReset";
import { calculateBusinessUnitFocusCondition, calculateConsolidatedFocusCondition, preventDuplicateCounting, validateRelationshipConfiguration } from "./focusConsolidation";
import { calculateFocusDailyProgress, calculateFocusDailyScore, DEFAULT_FOCUS_FORMULAS, FOCUS_DAILY_COLUMN_INDEX, FOCUS_DAILY_ROW_COUNT_KEY, FOCUS_FIELD_PERCENTAGE, focusDailySummaryValues, focusDailyTableKey, getFocusDailyRowCount, getFocusFormula, getFocusWeeklyCondition, getFocusDailySemaphore, getFocusDailyValidationErrors, normalizeFocusConfiguration } from "./focusDaily";
import { formatDocumentFolio, getNextDocumentFolio, parseDocumentFolio } from "./folios";
import { buildPositionProfiles, defaultFocusRelationships, getPositionProfileId } from "./fundacionAccess";
import { buildFundacionHierarchy, deriveUnitFocusFromDirectorHierarchy, flattenFundacionHierarchy } from "./fundacionHierarchy";
import { calculateAllocatedGoalTarget, getGoalPeriodBounds, getGoalTargetBreakdown, goalAppliesToPosition, goalIsActiveOnDate, inferGoalValueKind, normalizeGoalAllocationPercent, resolveIndicatorValueKind } from "./goals";
import { calculateIndicatorAttainmentScore, calculateWeeklyIndicatorCondition, calculateWeeklyPositionIndicatorScore, getIndicatorStatusMeta, getPositionIndicatorTrendSeries, getWeeklyIndicatorConditionMeta, normalizeIndicatorResult, normalizeIndicatorScore, normalizeWeeklyPositionIndicatorRecord } from "./positionIndicators";
import type { DocumentRecord, Evaluation, OperationalGoalAssignment, UnitConditionReview, WeeklyPositionIndicatorEvaluation } from "../types";

const fundacionDantePositions = positions.filter((position) => position.businessUnitId === FUNDACION_DANTE_UNIT_ID);
const fundacionPosition = (slug: string) => {
  const position = positions.find((item) => item.id === createPositionId(FUNDACION_DANTE_UNIT_ID, slug));
  if (!position) throw new Error(`Missing Fundacion Dante position fixture: ${slug}`);
  return position;
};
const baseFixturePosition = fundacionPosition("voluntariado-de-procuracion-de-fondos");

function makeEvaluation(overrides: Partial<Evaluation> = {}): Evaluation {
  const position = overrides.positionId ? positions.find((item) => item.id === overrides.positionId) ?? baseFixturePosition : baseFixturePosition;
  const businessUnitId = overrides.businessUnitId ?? position.businessUnitId;
  const unit = businessUnits.find((item) => item.id === businessUnitId);
  const date = overrides.date ?? "2026-06-01";
  const period = getEvaluationPeriod(date);
  const finalScore = overrides.finalScore ?? 80;
  return {
    id: overrides.id ?? `fixture-${date}-${position.id}`,
    businessUnitId,
    area: overrides.area ?? position.area,
    positionId: position.id,
    positionName: overrides.positionName ?? position.name,
    rep: overrides.rep ?? position.rep,
    evaluatedPersonName: overrides.evaluatedPersonName ?? position.name,
    evaluatorName: overrides.evaluatorName ?? "Dirección",
    date,
    period: overrides.period ?? period.period,
    week: overrides.week ?? period.week,
    month: overrides.month ?? period.month,
    season: overrides.season ?? period.season,
    evaluatedActivity: overrides.evaluatedActivity ?? "Actividad evaluada",
    captureSource: overrides.captureSource ?? "Digital",
    kpis: overrides.kpis ?? [{ name: "Cumplimiento del REP", description: "Indicador de prueba", score: Math.round(finalScore / 20) }],
    generalComplianceScore: overrides.generalComplianceScore ?? finalScore,
    evidenceIncidentScore: overrides.evidenceIncidentScore ?? finalScore,
    observations: overrides.observations ?? "",
    incidents: overrides.incidents ?? "",
    improvementAction: overrides.improvementAction ?? "",
    followUpDate: overrides.followUpDate ?? "",
    statistics: overrides.statistics,
    condition: overrides.condition,
    conditionFormula: overrides.conditionFormula,
    problemStatement: overrides.problemStatement,
    dataAnalysis: overrides.dataAnalysis,
    solutionPlan: overrides.solutionPlan,
    nextTarget: overrides.nextTarget,
    finalScore,
    performanceIndex: overrides.performanceIndex,
    focusDaily: overrides.focusDaily,
    status: overrides.status ?? getPerformanceStatus(finalScore),
    trend: overrides.trend ?? "Sin histórico",
    digitalCaptureDate: overrides.digitalCaptureDate ?? date,
    collaboratorProfileId: overrides.collaboratorProfileId,
    documentFolio: overrides.documentFolio,
    methodVersion: overrides.methodVersion,
    subjectType: overrides.subjectType ?? "collaborator",
    physicalFormatId: overrides.physicalFormatId,
    physicalFormatCode: overrides.physicalFormatCode,
    physicalFormatTitle: overrides.physicalFormatTitle,
    checklistResults: overrides.checklistResults,
    productDefinition: overrides.productDefinition,
  };
}

const fixtureEvaluations: Evaluation[] = [
  makeEvaluation({ id: "fixture-1", evaluatedPersonName: "Rodrigo Lara", collaboratorProfileId: "COL-RODRIGO", date: "2026-06-01", finalScore: 90, condition: "Normal", incidents: "Seguimiento comercial" }),
  makeEvaluation({ id: "fixture-2", evaluatedPersonName: "Rodrigo Lara", collaboratorProfileId: "COL-RODRIGO", date: "2026-06-08", finalScore: 75, condition: "Peligro", incidents: "Seguimiento comercial" }),
  makeEvaluation({ id: "fixture-3", evaluatedPersonName: "Rodrigo Lara", collaboratorProfileId: "COL-RODRIGO", date: "2026-06-15", finalScore: 45, condition: "Peligro", incidents: "Seguimiento comercial" }),
  makeEvaluation({ id: "fixture-4", evaluatedPersonName: "Ana Pérez", collaboratorProfileId: "COL-ANA", positionId: fundacionPosition("voluntariado-de-activaciones").id, date: "2026-06-15", finalScore: 100, condition: "Normal" }),
];

describe("calculateFinalScore", () => {
  it("returns 100 when every score is rated 5", () => {
    expect(calculateFinalScore([5, 5, 5], 5, 5)).toBe(100);
  });

  it("applies the REP KPI 70 / compliance 20 / evidence 10 weighting", () => {
    expect(calculateFinalScore([4, 4, 4], 4, 4)).toBe(80);
  });

  it("supports variable KPI counts without changing the 70 / 20 / 10 weighting", () => {
    expect(calculateFinalScore([5, 5], 5, 5)).toBe(100);
    expect(calculateFinalScore([3, 4, 5, 4], 4, 4)).toBe(80);
  });

  it("requires at least one official KPI with name and description", () => {
    expect(hasOfficialKpis([{ name: "Calidad", description: "Resultado esperado" }])).toBe(true);
    expect(hasOfficialKpis([])).toBe(false);
  });

  it("rejects scores outside the 1 to 5 scale", () => {
    expect(() => calculateFinalScore([0, 4, 4], 4, 4)).toThrow();
  });
});

describe("getPerformanceStatus", () => {
  it.each([
    [100, "Excelente"], [90, "Excelente"], [89, "Bueno"], [80, "Bueno"], [79, "En observación"],
    [70, "En observación"], [69, "Riesgo"], [60, "Riesgo"], [59, "Crítico"], [0, "Crítico"],
  ])("classifies %s as %s", (score, expected) => {
    expect(getPerformanceStatus(score as number)).toBe(expected);
  });
});

describe("product statistics and operational conditions", () => {
  it("calculates variation and target attainment from comparable production data", () => {
    expect(calculateStatistic({
      name: "Productos terminados",
      description: "Entregas aceptadas",
      measurementUnit: "productos",
      previousValue: 80,
      currentValue: 100,
      targetValue: 120,
    }, { hasPrevious: true })).toMatchObject({
      variation: 20,
      variationPercentage: 25,
      targetAttainment: 83.3,
      condition: "Normal",
    });
  });

  it("classifies conditions from movement between periods, not the isolated percentage", () => {
    expect(getOperationalCondition(80, 80, 100)).toBe("Emergencia");
    expect(getOperationalCondition(80, 83, 100)).toBe("Normal");
    expect(getOperationalCondition(80, 100, 100)).toBe("Normal");
    expect(getOperationalCondition(60, 100, 100)).toBe("Afluencia");
    expect(getOperationalCondition(100, 75, 100)).toBe("Peligro");
    expect(getOperationalCondition(100, 70, 100)).toBe("Peligro");
    expect(getOperationalCondition(100, 60, 100)).toBe("Peligro");
  });

  it("uses average compliance as the statistic and prior average as the condition comparison", () => {
    const normal = calculateStatistic({ name: "A", description: "", measurementUnit: "u", previousValue: 100, currentValue: 110, targetValue: 120 });
    const danger = calculateStatistic({ name: "B", description: "", measurementUnit: "u", previousValue: 100, currentValue: 70, targetValue: 100 });
    expect(getOverallCondition([normal, danger], 75)).toBe("Normal");
    expect(calculateTargetAttainment([normal, danger])).toBe(80.9);
  });

  it("maps trend shapes to conditions and reserves Poder for sustained movement", () => {
    expect(getConditionFromTrend(90)).toBe("Inexistencia");
    expect(getConditionFromTrend(0)).toBe("Inexistencia");
    expect(getConditionFromTrend(0, 10)).toBe("Peligro");
    expect(getConditionFromTrend(70, 95)).toBe("Peligro");
    expect(getConditionFromTrend(55, 95)).toBe("Peligro");
    expect(getConditionFromTrend(85, 90)).toBe("Emergencia");
    expect(getConditionFromTrend(88, 85)).toBe("Normal");
    expect(getConditionFromTrend(75, 60)).toBe("Normal");
    expect(getConditionFromTrend(80, 60)).toBe("Normal");
    expect(getConditionFromTrend(100, 60)).toBe("Afluencia");
    expect(getConditionFromTrend(92, 90, { sustainedPower: true })).toBe("Poder");
    expect(getConditionFromTrend(100, 100)).toBe("Afluencia");
    expect(getConditionFromTrend(100, 100, { recentScores: [60, 100, 100] })).toBe("Afluencia");
    expect(getConditionFromTrend(100, 100, { recentScores: [60, 100, 100, 100] })).toBe("Poder");
    expect(getConditionFromTrend(80, 100, { recentScores: [60, 100, 80] })).toBe("Emergencia");
    expect(getConditionFromTrend(100, 80, { recentScores: [100, 80, 100] })).toBe("Poder");
    expect(getConditionFromTrend(80, 80, { recentScores: [80, 80.5, 80, 80] })).toBe("Peligro");
  });

  it("keeps a zero first cut in Inexistencia and changes it to Peligro only with prior history", () => {
    expect(getConditionFromTrend(0, undefined, { hasPrevious: false })).toBe("Inexistencia");
    expect(getConditionFromTrend(0, 0, { hasPrevious: true })).toBe("Peligro");
  });

  it("requires more than three months of continuous gradual weekly growth for Poder", () => {
    const points = Array.from({ length: 14 }, (_, index) => {
      const date = new Date(Date.UTC(2026, 0, 1 + (index * 7))).toISOString().slice(0, 10);
      return {
        businessUnitId: "unit",
        positionId: "position",
        evaluatedPersonName: "Colaborador",
        date,
        finalScore: 60 + (index * 4),
      };
    });
    const candidate = points.at(-1)!;
    expect(hasSustainedPower(points.slice(0, -1), candidate)).toBe(true);
    expect(hasSustainedPower(points.map((point, index) => index === 7 ? { ...point, finalScore: 30 } : point).slice(0, -1), candidate)).toBe(false);
  });

  it("normalizes every flexible evaluation mode to an equitable 0 to 100 score", () => {
    const quantity = calculateStatistic({ name: "Llamadas", description: "", measurementUnit: "llamadas", measurementMode: "numeric", previousValue: 100, currentValue: 175, targetValue: 250 });
    const scale = calculateStatistic({ name: "Calidad", description: "", measurementUnit: "escala 1-5", measurementMode: "scale-1-5", previousValue: 3, currentValue: 4, targetValue: 5 });
    const percentage = calculateStatistic({ name: "Avance", description: "", measurementUnit: "%", measurementMode: "percentage", previousValue: 60, currentValue: 75, targetValue: 100 });
    const semaphore = calculateStatistic({ name: "Riesgo", description: "", measurementUnit: "semáforo", measurementMode: "traffic-light", previousValue: 50, currentValue: 100, currentSelection: "Verde", targetValue: 100 });
    const compliance = calculateStatistic({ name: "Entrega", description: "", measurementUnit: "cumplimiento", measurementMode: "compliance", previousValue: 0, currentValue: 50, currentSelection: "Medio cumple", targetValue: 100 });

    expect(quantity.targetAttainment).toBe(70);
    expect(scale.targetAttainment).toBe(80);
    expect(percentage.targetAttainment).toBe(75);
    expect(semaphore.targetAttainment).toBe(100);
    expect(compliance.targetAttainment).toBe(50);
    expect(calculateTargetAttainment([scale, percentage, semaphore, compliance])).toBe(76.3);
    expect(getMeasurementScore(semaphore)).toBe(100);
  });

  it("allows quantity targets and results above 100", () => {
    const quantity = calculateStatistic({
      name: "Expedientes procesados",
      description: "",
      measurementUnit: "expedientes",
      measurementMode: "numeric",
      previousValue: 120,
      currentValue: 300,
      targetValue: 400,
    });

    expect(quantity.currentValue).toBe(300);
    expect(quantity.targetAttainment).toBe(75);
  });

  it("uses the configured target when calculating flexible evaluations", () => {
    const scale = calculateStatistic({ name: "Calidad", description: "", measurementUnit: "escala 1-5", measurementMode: "scale-1-5", previousValue: 2, currentValue: 3, targetValue: 4 });
    const percentage = calculateStatistic({ name: "Avance", description: "", measurementUnit: "%", measurementMode: "percentage", previousValue: 40, currentValue: 60, targetValue: 80 });
    const semaphore = calculateStatistic({ name: "Riesgo", description: "", measurementUnit: "semáforo", measurementMode: "traffic-light", previousValue: 0, currentValue: 50, currentSelection: "Amarillo", targetValue: 50, targetSelection: "Amarillo" });

    expect(scale.targetAttainment).toBe(75);
    expect(percentage.targetAttainment).toBe(75);
    expect(semaphore.targetAttainment).toBe(100);
  });

  it("rejects incomplete flexible ratings", () => {
    expect(() => calculateStatistic({ name: "Calidad", description: "", measurementUnit: "escala 1-5", measurementMode: "scale-1-5", previousValue: 0, currentValue: 0, targetValue: 5 })).toThrow();
    expect(() => calculateStatistic({ name: "Riesgo", description: "", measurementUnit: "semáforo", measurementMode: "traffic-light", previousValue: 0, currentValue: 0, targetValue: 100 })).toThrow();
  });

  it("never reports fulfillment above 100 percent", () => {
    const doubledTarget = calculateStatistic({
      name: "Cumplimiento",
      description: "Tareas terminadas",
      measurementUnit: "tareas",
      previousValue: 5,
      currentValue: 20,
      targetValue: 10,
    });

    expect(doubledTarget.targetAttainment).toBe(100);
    expect(doubledTarget.performanceIndex).toBe(200);
    expect(calculateTargetAttainment([doubledTarget])).toBe(100);
    expect(calculatePerformanceIndex([doubledTarget])).toBe(200);
    expect(() => calculateStatistic({
      name: "Cumplimiento",
      description: "",
      measurementUnit: "%",
      measurementMode: "percentage",
      previousValue: 100,
      currentValue: 200,
      targetValue: 100,
    })).toThrow();
  });
});

describe("business unit score", () => {
  it("uses only the latest collaborator evaluation and ignores direct unit evaluations", () => {
    const base = makeEvaluation({ id: "base-score", evaluatedPersonName: "Persona A", collaboratorProfileId: "COL-A" });
    const older = { ...base, id: "older", date: "2026-06-01", finalScore: 20 };
    const latest = { ...base, id: "latest", date: "2026-06-08", finalScore: 80 };
    const secondPerson = makeEvaluation({ id: "second-person", evaluatedPersonName: "Persona B", collaboratorProfileId: "COL-B", date: "2026-06-08", finalScore: 100 });
    const directUnit = {
      ...base,
      id: "direct-unit",
      subjectType: "unit" as const,
      positionId: `unit:${base.businessUnitId}`,
      evaluatedPersonName: "Unidad",
      finalScore: 0,
    };
    const evaluations = [older, latest, secondPerson, directUnit];

    expect(getLatestCollaboratorEvaluations(evaluations, base.businessUnitId).map((item) => item.id)).toEqual(["latest", "second-person"]);
    expect(getBusinessUnitScore(evaluations, base.businessUnitId)).toBe(90);
  });
});

describe("collaborator evaluation history", () => {
  it("returns the ordered history for the same person, unit and position through the selected date", () => {
    const base = makeEvaluation({ id: "history-base", evaluatedPersonName: "Persona A", collaboratorProfileId: "COL-A" });
    const records = [
      { ...base, id: "history-2", date: "2026-06-08", period: "Semana 24 · Junio 2026" },
      { ...base, id: "history-1", date: "2026-06-01", period: "Semana 23 · Junio 2026" },
      { ...base, id: "future", date: "2026-06-22", period: "Semana 26 · Junio 2026" },
      { ...base, id: "other-person", evaluatedPersonName: "Otra persona", collaboratorProfileId: "COL-OTRA", date: "2026-06-08" },
    ];

    expect(getCollaboratorEvaluationHistory(
      records,
      base.businessUnitId,
      base.positionId,
      base.evaluatedPersonName.toLocaleUpperCase("es-MX"),
      "2026-06-15",
      base.collaboratorProfileId,
    ).map((item) => item.id)).toEqual(["history-1", "history-2"]);
  });

  it("keeps profiles with the same display name in independent histories and trends", () => {
    const base = makeEvaluation({ id: "profile-base", evaluatedPersonName: "Persona Compartida" });
    const records = [
      { ...base, id: "profile-a-1", collaboratorProfileId: "COL-A", date: "2026-06-01", period: "Semana 23 · Junio 2026", finalScore: 60 },
      { ...base, id: "profile-b-1", collaboratorProfileId: "COL-B", date: "2026-06-08", period: "Semana 24 · Junio 2026", finalScore: 30 },
      { ...base, id: "profile-a-2", collaboratorProfileId: "COL-A", date: "2026-06-15", period: "Semana 25 · Junio 2026", finalScore: 75 },
    ];

    expect(getCollaboratorEvaluationHistory(
      records,
      base.businessUnitId,
      base.positionId,
      base.evaluatedPersonName,
      "2026-06-30",
      "COL-A",
    ).map((item) => item.id)).toEqual(["profile-a-1", "profile-a-2"]);
    expect(getLatestCollaboratorEvaluations(records).map((item) => item.id).sort()).toEqual(["profile-a-2", "profile-b-1"]);
    expect(getIndividualTrendSeries(records, "COL-A").map((point) => point.score)).toEqual([60, 75]);
  });
});

describe("automatic periods and weekly evaluation agenda", () => {
  it("derives week, month, season and period from the evaluation date", () => {
    expect(getEvaluationPeriod("2026-06-13")).toEqual({
      period: "Semana 24 · Junio 2026",
      week: "24",
      month: "Junio",
      season: "2026",
    });
  });

  it("marks a position as current only when it has an evaluation in the active week", () => {
    const position = positions.find((item) => item.businessUnitId === FUNDACION_DANTE_UNIT_ID && getOperationalLevel(item) === "Ejecución")!;
    const recent = {
      ...makeEvaluation({ id: "schedule-recent", positionId: position.id }),
      positionId: position.id,
      businessUnitId: position.businessUnitId,
      date: "2026-06-10",
      ...getEvaluationPeriod("2026-06-10"),
    };
    const schedule = getWeeklyEvaluationSchedule([position], [recent], position.businessUnitId, new Date("2026-06-13T12:00:00"));
    expect(schedule[0]).toMatchObject({ dueDate: "2026-06-17", daysUntilDue: 4, status: "upcoming" });

    const overdue = getWeeklyEvaluationSchedule([position], [{
      ...recent,
      date: "2026-06-01",
      ...getEvaluationPeriod("2026-06-01"),
    }], position.businessUnitId, new Date("2026-06-13T12:00:00"));
    expect(overdue[0]).toMatchObject({ dueDate: "2026-06-13", daysUntilDue: 0, status: "overdue" });

    const pending = getWeeklyEvaluationSchedule([position], [], position.businessUnitId, new Date("2026-06-13T12:00:00"));
    expect(pending[0]).toMatchObject({ status: "pending", daysUntilDue: 0 });
  });

  it("returns the current dashboard to zero when the active weekly cut is reset", () => {
    const base = makeEvaluation({ id: "current-period-base" });
    const previous = { ...base, id: "previous-cut", date: "2026-06-01", period: getEvaluationPeriod("2026-06-01").period };
    const current = { ...base, id: "current-cut", date: "2026-06-10", period: getEvaluationPeriod("2026-06-10").period };

    expect(getCurrentPeriodEvaluations([previous, current], "2026-06-13").map((item) => item.id)).toEqual(["current-cut"]);
    expect(getCurrentPeriodEvaluations([previous], "2026-06-13")).toEqual([]);
  });
});

describe("evaluation reset ranges", () => {
  const resetEvaluation = { ...makeEvaluation({ id: "reset-base" }), businessUnitId: "unit-a", date: "2026-06-10" };

  it("limits a weekly reset to Monday through Sunday", () => {
    expect(getEvaluationResetRange("week", "2026-06-10")).toEqual({
      start: "2026-06-08",
      end: "2026-06-14",
      label: "2026-06-08 al 2026-06-14",
    });
    expect(matchesEvaluationReset(resetEvaluation, { businessUnitId: "unit-a", scope: "week", referenceDate: "2026-06-10" })).toBe(true);
    expect(matchesEvaluationReset({ ...resetEvaluation, date: "2026-06-15" }, { businessUnitId: "unit-a", scope: "week", referenceDate: "2026-06-10" })).toBe(false);
  });

  it("supports monthly, annual and all-unit reset filters", () => {
    expect(getEvaluationResetRange("month", "2026-06-10")).toMatchObject({ start: "2026-06-01", end: "2026-06-30" });
    expect(getEvaluationResetRange("year", "2026-06-10")).toMatchObject({ start: "2026-01-01", end: "2026-12-31" });
    expect(matchesEvaluationReset(resetEvaluation, { businessUnitId: "", scope: "year", referenceDate: "2026-01-01" })).toBe(true);
    expect(matchesEvaluationReset(resetEvaluation, { businessUnitId: "unit-b", scope: "year", referenceDate: "2026-01-01" })).toBe(false);
  });

  it("supports total reset for a unit across focus, indicators, goals, documents and reviews", () => {
    const request = { businessUnitId: "unit-a", scope: "all", referenceDate: "2026-06-22" } as const;
    const indicatorRecord = {
      id: "indicator-a",
      businessUnitId: "unit-a",
      collaboratorProfileId: "profile-a",
      evaluatorName: "Dirección",
      positionId: "position-a",
      week: "S25 2026",
      weekStartDate: "2026-06-15",
      weekEndDate: "2026-06-21",
      indicators: [],
      weightedScore: 81,
      weeklyCondition: "Normal",
      source: "position-indicators",
      createdAt: "2026-06-21T12:00:00.000Z",
      updatedAt: "2026-06-21T12:00:00.000Z",
    } satisfies WeeklyPositionIndicatorEvaluation;
    const goal = {
      id: "goal-a",
      businessUnitId: "unit-a",
      sourceProfileId: "director",
      targetProfileId: "profile-a",
      scope: "profile",
      metricSource: "focus-daily",
      targetValue: 100,
      goalLabel: "Meta de procuración",
      notes: "",
      effectiveDate: "2026-06-01",
      status: "active",
      createdAt: "2026-06-01T12:00:00.000Z",
      updatedAt: "2026-06-01T12:00:00.000Z",
    } satisfies OperationalGoalAssignment;
    const document = {
      folio: "EV00326",
      type: "evaluation",
      status: "digital",
      businessUnitId: "unit-a",
      businessUnitName: "Unit A",
      formatTitle: "Focus Diario",
      createdAt: "2026-04-01T10:00:00.000Z",
      updatedAt: "2026-04-01T10:00:00.000Z",
    } satisfies DocumentRecord;
    const review = {
      id: "review-total",
      businessUnitId: "unit-a",
      operationalLevel: "Planeación",
      positionId: "director",
      positionName: "Director",
      sourceLevel: "Ejecución",
      score: 81,
      condition: "Normal",
      evaluationIds: [],
      sourceReviewIds: [],
      reviewerName: "Dirección",
      date: "2026-05-10",
      period: "Mayo 2026",
      finalComments: "Comentarios",
      detectedCauses: "Causas",
      actionPlan: "Plan",
      followUpDate: "2026-05-17",
      createdAt: "2026-05-10T12:00:00.000Z",
    } satisfies UnitConditionReview;

    expect(getEvaluationResetRange("all", "2026-06-22")).toMatchObject({ label: "Todo el histórico" });
    expect(matchesEvaluationReset(resetEvaluation, request)).toBe(true);
    expect(matchesWeeklyIndicatorReset(indicatorRecord, request)).toBe(true);
    expect(matchesOperationalGoalReset(goal, request)).toBe(true);
    expect(matchesDocumentReset(document, request)).toBe(true);
    expect(matchesUnitConditionReviewReset(review, request)).toBe(true);
    expect(matchesWeeklyIndicatorReset({ ...indicatorRecord, businessUnitId: "unit-b" }, request)).toBe(false);
    expect(matchesOperationalGoalReset({ ...goal, businessUnitId: "unit-b" }, request)).toBe(false);
  });

  it("matches linked documents, printed folios and unit reviews in the selected reset range", () => {
    const request = { businessUnitId: "unit-a", scope: "week", referenceDate: "2026-06-10" } as const;
    const document = {
      folio: "EV00126",
      type: "evaluation",
      status: "printed",
      businessUnitId: "unit-a",
      businessUnitName: "Unit A",
      formatTitle: "Focus Diario",
      createdAt: "2026-06-09T10:00:00.000Z",
      updatedAt: "2026-06-09T10:00:00.000Z",
      printedAt: "2026-06-09T10:00:00.000Z",
    } satisfies DocumentRecord;
    const linkedDocument = { ...document, folio: "EV00226", linkedEvaluationId: "evaluation-a", createdAt: "2026-05-01T10:00:00.000Z", printedAt: "2026-05-01T10:00:00.000Z" } satisfies DocumentRecord;
    const review = {
      id: "review-a",
      businessUnitId: "unit-a",
      operationalLevel: "Planeación",
      positionId: "director",
      positionName: "Director",
      sourceLevel: "Ejecución",
      score: 75,
      condition: "Normal",
      evaluationIds: [],
      sourceReviewIds: [],
      reviewerName: "Dirección",
      date: "2026-06-10",
      period: "Semana 24 · Junio 2026",
      finalComments: "Comentarios",
      detectedCauses: "Causas",
      actionPlan: "Plan",
      followUpDate: "2026-06-17",
      createdAt: "2026-06-10T12:00:00.000Z",
    } satisfies UnitConditionReview;

    expect(matchesDocumentReset(document, request)).toBe(true);
    expect(matchesDocumentReset(linkedDocument, request, new Set(["evaluation-a"]))).toBe(true);
    expect(matchesDocumentReset({ ...document, businessUnitId: "unit-b" }, request)).toBe(false);
    expect(matchesUnitConditionReviewReset(review, request)).toBe(true);
    expect(matchesUnitConditionReviewReset({ ...review, date: "2026-06-20", createdAt: "2026-06-20T12:00:00.000Z" }, request)).toBe(false);
  });
});

describe("document folios", () => {
  const baseDocument = {
    status: "digital",
    businessUnitId: FUNDACION_DANTE_UNIT_ID,
    businessUnitName: "Fundación Dante Eludier",
    formatTitle: "Formato de prueba",
    createdAt: "2026-06-09T00:00:00.000Z",
    updatedAt: "2026-06-09T00:00:00.000Z",
  } satisfies Omit<DocumentRecord, "folio" | "type">;

  it("generates evaluation and operation folios with prefix, sequence and current year", () => {
    const date = new Date("2026-06-09T12:00:00");
    expect(formatDocumentFolio("evaluation", 0, date)).toBe("EV00026");
    expect(formatDocumentFolio("operation", 0, date)).toBe("OP00026");
    expect(formatDocumentFolio("evaluation", 1000, date)).toBe("EV100026");
    expect(getNextDocumentFolio("evaluation", [], date)).toBe("EV00026");
  });

  it("continues the sequence independently by document type and year", () => {
    const records: DocumentRecord[] = [
      { ...baseDocument, folio: "EV00126", type: "evaluation" },
      { ...baseDocument, folio: "EV00225", type: "evaluation" },
      { ...baseDocument, folio: "OP00126", type: "operation" },
    ];
    const date = new Date("2026-06-09T12:00:00");

    expect(getNextDocumentFolio("evaluation", records, date)).toBe("EV00226");
    expect(getNextDocumentFolio("operation", records, date)).toBe("OP00226");
    expect(parseDocumentFolio(" ev00226 ")?.sequence).toBe(2);
  });
});

describe("Focus Diario operation scoring", () => {
  it("calculates the weighted daily percentage from Eisenhower activity rows", () => {
    const values = {
      [focusDailyTableKey(0, FOCUS_DAILY_COLUMN_INDEX.activity)]: "Revisión de indicadores",
      [focusDailyTableKey(0, FOCUS_DAILY_COLUMN_INDEX.status)]: "Completado",
      [focusDailyTableKey(0, FOCUS_DAILY_COLUMN_INDEX.priority)]: "Importante – urgente",
      [focusDailyTableKey(0, FOCUS_DAILY_COLUMN_INDEX.progress)]: "100",
      [focusDailyTableKey(1, FOCUS_DAILY_COLUMN_INDEX.activity)]: "Seguimiento comercial",
      [focusDailyTableKey(1, FOCUS_DAILY_COLUMN_INDEX.status)]: "En proceso",
      [focusDailyTableKey(1, FOCUS_DAILY_COLUMN_INDEX.priority)]: "Importante – no urgente",
      [focusDailyTableKey(1, FOCUS_DAILY_COLUMN_INDEX.progress)]: "50",
      [focusDailyTableKey(1, FOCUS_DAILY_COLUMN_INDEX.blockageReason)]: "Respuesta pendiente",
      [focusDailyTableKey(2, FOCUS_DAILY_COLUMN_INDEX.activity)]: "Cierre de pendientes",
      [focusDailyTableKey(2, FOCUS_DAILY_COLUMN_INDEX.status)]: "No iniciado",
      [focusDailyTableKey(2, FOCUS_DAILY_COLUMN_INDEX.priority)]: "No importante – urgente",
      [focusDailyTableKey(2, FOCUS_DAILY_COLUMN_INDEX.progress)]: "0",
      [focusDailyTableKey(2, FOCUS_DAILY_COLUMN_INDEX.blockageReason)]: "Sin insumo",
    };

    const progress = calculateFocusDailyProgress(values);
    const summary = focusDailySummaryValues(progress);

    expect(progress).toMatchObject({ registered: 3, done: 1, inProgress: 1, pending: 1, blocked: 1, score: 61, semaphore: "Amarillo" });
    expect(summary["summary::Cumplimiento diario"]).toBe("61%");
    expect(summary["summary::Semáforo general"]).toBe("Amarillo");
    expect(summary["summary::Condición de tendencia"]).toBe("Sin histórico suficiente");
  });

  it("preserves a custom activity row count and excludes removed rows from scoring", () => {
    const values = {
      [FOCUS_DAILY_ROW_COUNT_KEY]: "2",
      [focusDailyTableKey(0, FOCUS_DAILY_COLUMN_INDEX.activity)]: "Actividad vigente",
      [focusDailyTableKey(0, FOCUS_DAILY_COLUMN_INDEX.status)]: "Completado",
      [focusDailyTableKey(0, FOCUS_DAILY_COLUMN_INDEX.priority)]: "Importante – urgente",
      [focusDailyTableKey(0, FOCUS_DAILY_COLUMN_INDEX.progress)]: "100",
      [focusDailyTableKey(2, FOCUS_DAILY_COLUMN_INDEX.activity)]: "Fila removida",
      [focusDailyTableKey(2, FOCUS_DAILY_COLUMN_INDEX.status)]: "Pendiente",
    };

    expect(getFocusDailyRowCount(values)).toBe(2);
    expect(calculateFocusDailyProgress(values, getFocusDailyRowCount(values))).toMatchObject({
      registered: 1,
      score: 100,
      semaphore: "Verde",
    });
  });

  it("clamps direct manual percentages to the daily 0 to 100 range", () => {
    const progress = calculateFocusDailyProgress({ [FOCUS_FIELD_PERCENTAGE]: "125.5" });
    expect(progress).toMatchObject({ score: 100, semaphore: "Verde" });
    expect(progress).not.toHaveProperty("preliminaryCondition");
    expect(getFocusDailySemaphore(49)).toBe("Rojo");
    expect(getFocusDailySemaphore(50)).toBe("Amarillo");
    expect(getFocusDailySemaphore(80)).toBe("Verde");
  });

  it("calculates focus daily trend conditions from prior daily scores", () => {
    expect(calculateFocusDailyScore([], [{ score: 80 }])).toMatchObject({ weightedScore: 0, trendCondition: "Inexistencia" });
    expect(calculateFocusDailyScore([{ name: "A", activityStatus: "Completado", activityPriority: "Importante – urgente", currentValue: 100 }])).toMatchObject({ weightedScore: 100, trendCondition: "Sin histórico suficiente" });
    expect(calculateFocusDailyScore([{ name: "A", activityStatus: "En proceso", activityPriority: "Importante – urgente", currentValue: 75 }], [{ score: 60 }])).toMatchObject({ weightedScore: 75, trendCondition: "Normal", trendDeltaPP: 15 });
    expect(calculateFocusDailyScore([{ name: "A", activityStatus: "En proceso", activityPriority: "Importante – urgente", currentValue: 80 }], [{ score: 60 }])).toMatchObject({ weightedScore: 80, trendCondition: "Normal", trendDeltaPP: 20 });
    expect(calculateFocusDailyScore([{ name: "A", activityStatus: "En proceso", activityPriority: "Importante – urgente", currentValue: 90 }], [{ score: 60 }])).toMatchObject({ weightedScore: 90, trendCondition: "Normal", trendDeltaPP: 30 });
    expect(calculateFocusDailyScore([{ name: "A", activityStatus: "Completado", activityPriority: "Importante – urgente", currentValue: 100 }], [{ score: 60 }])).toMatchObject({ weightedScore: 100, trendCondition: "Afluencia", trendDeltaPP: 40 });
    expect(calculateFocusDailyScore([{ name: "A", activityStatus: "Completado", activityPriority: "Importante – urgente", currentValue: 100 }], [{ score: 100, date: "2026-06-01" }])).toMatchObject({ weightedScore: 100, trendCondition: "Afluencia", trendDeltaPP: 0, peakStreakCount: 1 });
    expect(calculateFocusDailyScore([{ name: "A", activityStatus: "Completado", activityPriority: "Importante – urgente", currentValue: 100 }], [{ score: 50, date: "2026-06-01" }, { score: 100, date: "2026-06-02" }])).toMatchObject({ weightedScore: 100, trendCondition: "Afluencia", trendDeltaPP: 0, peakStreakCount: 1 });
    expect(calculateFocusDailyScore([{ name: "A", activityStatus: "Completado", activityPriority: "Importante – urgente", currentValue: 100 }], [{ score: 50, date: "2026-06-01" }, { score: 100, date: "2026-06-02" }, { score: 100, date: "2026-06-03" }])).toMatchObject({ weightedScore: 100, trendCondition: "Poder", trendDeltaPP: 0, peakStreakCount: 2 });
    expect(calculateFocusDailyScore([{ name: "A", activityStatus: "En proceso", activityPriority: "Importante – urgente", currentValue: 80 }], [{ score: 50, date: "2026-06-01" }, { score: 100, date: "2026-06-02" }])).toMatchObject({ weightedScore: 80, trendCondition: "Emergencia", trendDeltaPP: -20 });
    expect(calculateFocusDailyScore([{ name: "A", activityStatus: "Completado", activityPriority: "Importante – urgente", currentValue: 100 }], [{ score: 100, date: "2026-06-01" }, { score: 80, date: "2026-06-02" }])).toMatchObject({ weightedScore: 100, trendCondition: "Poder", trendDeltaPP: 20, peakStreakCount: 2, isPeakRecoveryPower: true });
    expect(calculateFocusDailyScore([{ name: "A", activityStatus: "En proceso", activityPriority: "Importante – urgente", currentValue: 73 }], [{ score: 62 }])).toMatchObject({ weightedScore: 73, trendCondition: "Normal", trendDeltaPP: 11 });
    expect(calculateFocusDailyScore([{ name: "A", activityStatus: "En proceso", activityPriority: "Importante – urgente", currentValue: 64 }], [{ score: 62 }])).toMatchObject({ weightedScore: 64, trendCondition: "Normal", trendDeltaPP: 2 });
    expect(calculateFocusDailyScore([{ name: "A", activityStatus: "En proceso", activityPriority: "Importante – urgente", currentValue: 75 }], [{ score: 82 }])).toMatchObject({ weightedScore: 75, trendCondition: "Emergencia", trendDeltaPP: -7 });
    expect(calculateFocusDailyScore([{ name: "A", activityStatus: "En proceso", activityPriority: "Importante – urgente", currentValue: 75 }], [{ score: 100 }])).toMatchObject({ weightedScore: 75, trendCondition: "Peligro", trendDeltaPP: -25 });
    expect(calculateFocusDailyScore([{ name: "A", activityStatus: "En proceso", activityPriority: "Importante – urgente", currentValue: 70 }], [{ score: 100 }])).toMatchObject({ weightedScore: 70, trendCondition: "Peligro", trendDeltaPP: -30 });
    expect(calculateFocusDailyScore([{ name: "A", activityStatus: "En proceso", activityPriority: "Importante – urgente", currentValue: 60 }], [{ score: 100 }])).toMatchObject({ weightedScore: 60, trendCondition: "Peligro", trendDeltaPP: -40 });
    expect(calculateFocusDailyScore([{ name: "A", activityStatus: "Pendiente", activityPriority: "Importante – urgente", currentValue: 0 }], [{ score: 100 }])).toMatchObject({ weightedScore: 0, trendCondition: "Peligro", trendDeltaPP: -100 });
  });

  it("averages weekly Focus fulfillment across the active assigned goals", () => {
    const result = calculateFocusDailyScore([
      { name: "Llamadas de procuración", goalAssignmentId: "goal-1", goalLabel: "Procuración semanal", activityStatus: "Completado", activityPriority: "Importante – urgente", currentValue: 100 },
      { name: "Seguimiento de aliados", goalAssignmentId: "goal-2", goalLabel: "Alianzas", activityStatus: "En proceso", activityPriority: "Importante – urgente", currentValue: 50 },
    ], [], [
      { id: "goal-1", label: "Procuración semanal", targetValue: 100 },
      { id: "goal-2", label: "Alianzas", targetValue: 100 },
      { id: "goal-3", label: "Reporte semanal", targetValue: 100 },
    ]);

    expect(result.weightedScore).toBe(50);
    expect(result.goalCount).toBe(3);
    expect(result.goalBreakdown.map((goal) => [goal.label, goal.score, goal.activityCount])).toEqual([
      ["Procuración semanal", 100, 1],
      ["Alianzas", 50, 1],
      ["Reporte semanal", 0, 0],
    ]);
  });

  it("splits unit goals by cadence for daily, weekly and monthly operational targets", () => {
    expect(getGoalPeriodBounds("2026-06-23", "week")).toEqual({
      startDate: "2026-06-23",
      endDate: "2026-06-29",
    });

    expect(getGoalTargetBreakdown({
      cadence: "week",
      effectiveDate: "2026-06-22",
      targetValue: 70,
    })).toMatchObject({
      days: 7,
      dailyTarget: 10,
      weeklyTarget: 70,
    });

    expect(getGoalTargetBreakdown({
      cadence: "month",
      effectiveDate: "2026-06-15",
      targetValue: 310,
    })).toMatchObject({
      days: 30,
      dailyTarget: 10.33,
      weeklyTarget: 62,
      monthlyTarget: 310,
    });

    expect(getGoalTargetBreakdown({
      cadence: "year",
      effectiveDate: "2026-06-15",
      targetValue: 1200,
    })).toMatchObject({
      days: 365,
      monthlyTarget: 100,
    });
  });

  it("allocates a quantity unit goal by collaborator participation without changing percentage goals", () => {
    const fundraisingGoal = {
      targetValue: 2500000,
      valueKind: "quantity",
    } satisfies Pick<OperationalGoalAssignment, "targetValue" | "valueKind">;
    const repGoal = {
      targetValue: 100,
      valueKind: "percentage",
    } satisfies Pick<OperationalGoalAssignment, "targetValue" | "valueKind">;

    expect(normalizeGoalAllocationPercent(120)).toBe(100);
    expect(calculateAllocatedGoalTarget(fundraisingGoal, 20)).toBe(500000);
    expect(calculateAllocatedGoalTarget(fundraisingGoal, 80)).toBe(2000000);
    expect(calculateAllocatedGoalTarget(repGoal, 20)).toBe(100);
  });

  it("keeps long cadence goals active across every Focus date inside their assigned range", () => {
    const annualGoal = {
      cadence: "year",
      effectiveDate: "2026-06-23",
      periodStartDate: "2026-06-23",
      periodEndDate: "2027-06-22",
    } as const;
    const monthlyGoal = {
      cadence: "month",
      effectiveDate: "2026-06-23",
      periodStartDate: "2026-06-23",
      periodEndDate: "2026-07-22",
    } as const;

    expect(goalIsActiveOnDate(annualGoal, "2026-06-23")).toBe(true);
    expect(goalIsActiveOnDate(annualGoal, "2027-01-15")).toBe(true);
    expect(goalIsActiveOnDate(annualGoal, "2027-06-23")).toBe(false);
    expect(goalIsActiveOnDate(monthlyGoal, "2026-07-15")).toBe(true);
    expect(goalIsActiveOnDate(monthlyGoal, "2026-07-23")).toBe(false);
  });

  it("treats quantity unit indicators differently from percentage goals and applies them only to related roles", () => {
    const director = fundacionDantePositions.find((position) => position.name === "Director General UDN")!;
    const fundraiser = fundacionDantePositions.find((position) => position.name === "Voluntariado de Procuración de Fondos")!;
    const activations = fundacionDantePositions.find((position) => position.name === "Voluntariado de Activaciones")!;
    const quantityIndicator = director.kpis.find((kpi) => kpi.name === "Cantidad de procuración de fondos")!;
    const percentageIndicator = director.kpis.find((kpi) => kpi.name === "Porcentaje de rentabilidad")!;
    const goal = {
      businessUnitId: FUNDACION_DANTE_UNIT_ID,
      cadence: "month",
      createdAt: "2026-06-01",
      effectiveDate: "2026-06-01",
      goalLabel: quantityIndicator.name,
      id: "goal-fundraising",
      metricSource: "focus-daily",
      notes: "",
      scope: "unit",
      sourceProfileId: "master",
      status: "active",
      targetValue: 300,
      unitIndicatorName: quantityIndicator.name,
      updatedAt: "2026-06-01",
      valueKind: "quantity",
    } satisfies OperationalGoalAssignment;

    expect(inferGoalValueKind(quantityIndicator.name, quantityIndicator.measurementKind)).toBe("quantity");
    expect(inferGoalValueKind(percentageIndicator.name, percentageIndicator.measurementKind)).toBe("percentage");
    expect(resolveIndicatorValueKind({
      goalValueKind: goal.valueKind,
      indicatorName: "Meta de procuración de fondos",
      measurementKind: "goal-target",
      valueKind: "percentage",
    })).toBe("quantity");
    expect(goalAppliesToPosition(goal, fundraiser)).toBe(true);
    expect(goalAppliesToPosition(goal, activations)).toBe(false);
  });

  it("keeps every active Fundacion Dante position connected to at least one unit indicator", () => {
    const director = fundacionDantePositions.find((position) => position.name === "Director General UDN")!;
    const unitIndicators = director.kpis.filter((kpi) => ["unit-indicator", "quantity"].includes(kpi.measurementKind ?? ""));
    const activePositions = fundacionDantePositions.filter((position) => position.status === "active" && position.name !== "Director General UDN");

    activePositions.forEach((position) => {
      const matchingIndicators = unitIndicators.filter((indicator) => goalAppliesToPosition({
        businessUnitId: FUNDACION_DANTE_UNIT_ID,
        cadence: "week",
        createdAt: "2026-06-22",
        effectiveDate: "2026-06-22",
        goalLabel: indicator.name,
        id: `goal-${indicator.name}`,
        metricSource: "focus-daily",
        notes: "",
        scope: "unit",
        sourceProfileId: "master",
        status: "active",
        targetValue: indicator.measurementKind === "quantity" ? 1 : 100,
        unitIndicatorName: indicator.name,
        updatedAt: "2026-06-22",
        valueKind: indicator.measurementKind === "quantity" ? "quantity" : "percentage",
      } satisfies OperationalGoalAssignment, position));

      expect(matchingIndicators.map((indicator) => indicator.name), position.name).not.toEqual([]);
    });
  });

  it("keeps the full Fundacion Dante report chain targetable from Direction", () => {
    const profiles = buildPositionProfiles(fundacionDantePositions);
    const directorProfileId = getPositionProfileId(createPositionId(FUNDACION_DANTE_UNIT_ID, "director-general-udn"));
    const hierarchy = buildFundacionHierarchy({
      businessUnitId: FUNDACION_DANTE_UNIT_ID,
      evaluations: [],
      positions: fundacionDantePositions,
      profiles,
      relationships: defaultFocusRelationships,
      rootProfileId: directorProfileId,
    });
    const managedNames = flattenFundacionHierarchy(hierarchy)
      .map((node) => node.profile.name)
      .filter((name) => name !== "Director General UDN");

    expect(managedNames).toContain("Voluntariado de Procuración de Fondos");
    expect(managedNames).toContain("Voluntariado de Activaciones");
  });

  it("treats REP compliance as an assignable percentage indicator when a position has no quantity KPI", () => {
    const coordinator = fundacionDantePositions.find((position) => position.name === "Coordinador de Activaciones")!;
    const repIndicator = coordinator.kpis.find((kpi) => kpi.name === "Cumplimiento del REP");

    expect(repIndicator?.measurementKind).toBe("rep-compliance");
    expect(inferGoalValueKind(repIndicator?.name, repIndicator?.measurementKind)).toBe("percentage");
  });

  it("assigns Poder only for high stable daily performance", () => {
    expect(calculateFocusDailyScore(
      [{ name: "Entrega", activityStatus: "En proceso", activityPriority: "Importante – urgente", currentValue: 94 }],
      [{ score: 91, date: "2026-06-01" }, { score: 93, date: "2026-06-02" }, { score: 92, date: "2026-06-03" }],
    )).toMatchObject({ weightedScore: 94, trendCondition: "Poder", isPowerCondition: true, rollingAverageLast4: 92.5, rollingMinimumLast4: 91 });

    expect(calculateFocusDailyScore(
      [{ name: "Entrega", activityStatus: "Completado", activityPriority: "Importante – urgente", currentValue: 100 }],
      [{ score: 50, date: "2026-06-01" }, { score: 65, date: "2026-06-02" }, { score: 80, date: "2026-06-03" }],
    )).toMatchObject({ weightedScore: 100, trendCondition: "Normal", isPowerCondition: false });

    expect(calculateFocusDailyScore(
      [{ name: "Entrega", activityStatus: "Completado", activityPriority: "Importante – urgente", currentValue: 100 }],
      [{ score: 100, date: "2026-06-01" }, { score: 100, date: "2026-06-02" }, { score: 100, date: "2026-06-03" }],
    )).toMatchObject({ weightedScore: 100, trendCondition: "Poder", isPowerCondition: true });
  });

  it("requires reason for not started or incomplete daily activities", () => {
    const values = {
      [focusDailyTableKey(0, FOCUS_DAILY_COLUMN_INDEX.activity)]: "Resolver incidencia",
      [focusDailyTableKey(0, FOCUS_DAILY_COLUMN_INDEX.status)]: "No iniciado",
      [focusDailyTableKey(0, FOCUS_DAILY_COLUMN_INDEX.priority)]: "Importante – urgente",
      [focusDailyTableKey(0, FOCUS_DAILY_COLUMN_INDEX.progress)]: "40",
    };
    expect(getFocusDailyValidationErrors(values, 1)[0]).toContain("motivo");
  });

  it.each([
    [{ approvedEntries: 2, currentStat: 90, previousStat: 80 }, "Inexistencia"],
    [{ approvedEntries: 3, currentStat: 50, previousStat: 30 }, "Normal"],
    [{ approvedEntries: 3, currentStat: 80, previousStat: 50 }, "Normal"],
    [{ approvedEntries: 3, currentStat: 70, previousStat: 95 }, "Peligro"],
    [{ approvedEntries: 3, currentStat: 90, previousStat: 50 }, "Afluencia"],
    [{ approvedEntries: 3, currentStat: 55, previousStat: 95 }, "Peligro"],
    [{ approvedEntries: 3, currentStat: 52, previousStat: 50 }, "Normal"],
    [{ approvedEntries: 3, currentStat: 85, previousStat: 90 }, "Emergencia"],
    [{ approvedEntries: 3, currentStat: 85, previousStat: 85 }, "Emergencia"],
    [{ approvedEntries: 3, currentStat: 100, previousStat: 100, recentStats: [50, 100, 100] }, "Afluencia"],
    [{ approvedEntries: 3, currentStat: 100, previousStat: 100, recentStats: [50, 100, 100, 100] }, "Poder"],
    [{ approvedEntries: 3, currentStat: 80, previousStat: 100, recentStats: [50, 100, 80] }, "Emergencia"],
    [{ approvedEntries: 3, currentStat: 100, previousStat: 80, recentStats: [100, 80, 100] }, "Poder"],
    [{ approvedEntries: 3, currentStat: 88, previousStat: 85 }, "Normal"],
  ])("calculates weekly condition by trend for %o", (input, expected) => {
    expect(getFocusWeeklyCondition(input)).toBe(expected);
  });

  it("normalizes stale Focus thresholds so +30 remains Normal", () => {
    const staleConfiguration = {
      ...normalizeFocusConfiguration(),
      riseThreshold: 20,
      fallThreshold: 20,
      minimumWeeklyEntries: 3,
    };

    expect(normalizeFocusConfiguration(staleConfiguration)).toMatchObject({ riseThreshold: 40, fallThreshold: 25 });
    expect(getFocusWeeklyCondition({
      approvedEntries: 3,
      currentStat: 80,
      previousStat: 50,
      configuration: staleConfiguration,
    })).toBe("Normal");
  });

  it("detects prolonged stagnation and exposes one formula per condition", () => {
    expect(getFocusWeeklyCondition({
      approvedEntries: 3,
      currentStat: 80,
      previousStat: 80,
      recentStats: [80, 80.5, 80, 80],
    })).toBe("Peligro");
    expect(DEFAULT_FOCUS_FORMULAS).toHaveLength(6);
    expect(getFocusFormula("Emergencia")[1]).toBe("Cambiar tu base de operación.");
    expect(getFocusFormula("Poder")).toEqual([
      "La primera ley de una condición de Poder es no perder el contacto.",
      "Dejar constancia de todas las líneas de comunicación del trabajo o actividad.",
      "Escribir el conocimiento de la actividad y ponerlo en manos de la persona que va a ocuparse de ella.",
      "Hacer todo lo posible para que alguien pueda ocuparse correctamente de la actividad que se deja.",
    ]);
  });

  it("assigns Poder after more than three months of continuous gradual weekly growth", () => {
    const recentPeriods = Array.from({ length: 14 }, (_, index) => ({
      year: 2026,
      isoWeek: index + 1,
      stat: 60 + (index * 4),
      approvedEntries: 3,
    }));
    expect(getFocusWeeklyCondition({
      approvedEntries: 3,
      currentStat: recentPeriods.at(-1)!.stat,
      previousStat: recentPeriods.at(-2)!.stat,
      recentPeriods,
    })).toBe("Poder");

    const peakPeriods = Array.from({ length: 14 }, (_, index) => ({
      year: 2026,
      isoWeek: index + 1,
      stat: 100,
      approvedEntries: 3,
    }));
    expect(getFocusWeeklyCondition({
      approvedEntries: 3,
      currentStat: 100,
      previousStat: 100,
      recentPeriods: peakPeriods,
    })).toBe("Poder");
  });
});

describe("trend and catalog rules", () => {
  it("uses more than 3 points as the threshold for improvement or decline", () => {
    expect(getTrend(83, 80)).toBe("Estable");
    expect(getTrend(84, 80)).toBe("Mejora");
    expect(getTrend(76, 80)).toBe("Baja");
    expect(getTrend(80)).toBe("Sin histórico");
  });

  it("starts with no captured evaluations and no people catalog", () => {
    expect(seedEvaluations).toHaveLength(0);
    expect("collaborators" in catalog).toBe(false);
    expect("people" in catalog).toBe(false);
  });

  it("keeps the catalog free of positions without official REP or KPIs", () => {
    const pending = positions.filter((item) => !isPositionReady(item));
    expect(pending).toHaveLength(0);
  });

  it("loads the updated business-unit catalog and removes Halcones", () => {
    const unitIds = new Set(businessUnits.map((unit) => unit.id));
    const forbiddenText = [
      ...businessUnits.map((unit) => unit.name),
      ...positions.map((position) => position.name),
      ...physicalChecklistFormats.map((format) => format.title),
    ].join(" ").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es-MX");

    expect(businessUnits.map((unit) => unit.name)).toEqual(updatedBusinessUnits.map((unit) => unit.name));
    expect(businessUnits).toHaveLength(10);
    expect(positions).toHaveLength(108);
    expect(physicalChecklistFormats).toHaveLength(108);
    expect(positions.every((position) => unitIds.has(position.businessUnitId))).toBe(true);
    expect(positions.every((position) => position.id.startsWith(`${position.businessUnitId}:`))).toBe(true);
    expect(physicalChecklistFormats.every((format) => unitIds.has(format.businessUnitId))).toBe(true);
    expect(forbiddenText).not.toContain("halcones");
  });

  it("links every updated position to a valid printable checklist format", () => {
    const formatIds = new Set(physicalChecklistFormats.map((item) => item.id));
    expect(positions.every(isPositionReady)).toBe(true);
    expect(positions.every((item) => item.physicalFormatIds?.length)).toBe(true);
    expect(positions.flatMap((item) => item.physicalFormatIds ?? []).every((id) => formatIds.has(id))).toBe(true);
    expect(physicalChecklistFormats.every((format) => format.frequency === "Semanal" && format.checklist.length > 0)).toBe(true);
  });

  it("does not expose or assign deprecated REP/KPI master formats", () => {
    const deprecatedMasterIds = new Set(["halcones-f-01-general", "axen-mind-f-01-general", "fundacion-dante-f-01-general"]);
    const catalogFormatIds = new Set(physicalChecklistFormats.map((format) => format.id));
    const assignedFormatIds = positions.flatMap((position) => position.physicalFormatIds ?? []);
    const catalogText = physicalChecklistFormats.map((format) => `${format.code} ${format.title}`.toLocaleLowerCase("es-MX"));
    const forbiddenPositionText = positions.map((position) => position.name).join(" ").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es-MX");

    expect(physicalChecklistFormats.some((format) => deprecatedMasterIds.has(format.id))).toBe(false);
    expect(physicalChecklistFormats.some((format) => format.code === "F-01")).toBe(false);
    expect(assignedFormatIds.some((id) => deprecatedMasterIds.has(id))).toBe(false);
    expect(assignedFormatIds.every((id) => catalogFormatIds.has(id))).toBe(true);
    expect(catalogText.some((text) => text.includes("maestro") || text.includes("rep / kpi general"))).toBe(false);
    expect(forbiddenPositionText).not.toMatch(/\b(ceo|dueno|patronato)\b/);
  });

  it("keeps every updated guide unit isolated with its own active positions", () => {
    updatedGuideUnits.forEach((guideUnit) => {
      const unitPositions = positions.filter((position) => position.businessUnitId === guideUnit.id);
      const unitFormats = physicalChecklistFormats.filter((format) => format.businessUnitId === guideUnit.id);

      expect(unitPositions.map((position) => position.name), guideUnit.name).toEqual(guideUnit.positions.map((position) => position.name));
      expect(unitFormats, guideUnit.name).toHaveLength(unitPositions.length);
      expect(unitPositions.every((position) => position.status === "active"), guideUnit.name).toBe(true);
      expect(unitPositions.every(isPositionReady), guideUnit.name).toBe(true);
    });
  });

  it("loads Focus Diario operation formats independently by unit and links them to valid positions when applicable", () => {
    const positionIds = new Set(positions.map((item) => item.id));
    const operationCountsByUnit = new Map<string, number>();
    operationFormats.forEach((format) => operationCountsByUnit.set(format.businessUnitId, (operationCountsByUnit.get(format.businessUnitId) ?? 0) + 1));

    expect(operationFormats).toHaveLength(positions.length);
    updatedGuideUnits.forEach((unit) => {
      expect(operationCountsByUnit.get(unit.id), unit.name).toBe(unit.positions.length);
    });
    expect(operationFormats.every((item) => item.formats.length === 1)).toBe(true);
    expect(operationFormats.every((item) => item.formats.every((format) => format.keyArea === "Focus diario" && format.format === "Focus Diario"))).toBe(true);
    expect(operationFormats.every((item) => item.formats.every((format) => format.template?.scoreSource === "focus-daily"))).toBe(true);
    expect(operationFormats.every((item) => item.formats.every((format) => format.template?.summaryFields?.includes("Semáforo general")))).toBe(true);
    expect(operationFormats.every((item) => item.formats.every((format) => Boolean(format.template?.sourceFile)))).toBe(true);
    expect(operationFormats.filter((item) => item.positionId).every((item) => positionIds.has(item.positionId!))).toBe(true);
    expect(operationFormats.some((item) => item.positionName === "Dueño")).toBe(false);
    expect(operationFormats.some((item) => item.positionName.toLocaleLowerCase("es-MX").includes("patronato"))).toBe(false);
    expect(operationFormats.some((item) => item.positionName.toLocaleLowerCase("es-MX").includes("ceo"))).toBe(false);
    expect(operationFormats.every((item) => item.positionId && positionIds.has(item.positionId))).toBe(true);
  });

  it("keeps digital capture aligned to printable checklist sources by unit and position", () => {
    const formatById = new Map(physicalChecklistFormats.map((format) => [format.id, format]));
    positions.filter(isPositionReady).forEach((position) => {
      const suggestedFormat = position.physicalFormatIds?.[0];
      expect(suggestedFormat, `${position.name} needs a suggested printable format`).toBeTruthy();
      const format = formatById.get(suggestedFormat!);
      expect(format?.businessUnitId).toBe(position.businessUnitId);
      expect(format?.checklist.length).toBeGreaterThan(0);
    });
  });
});

describe("chart series", () => {
  it("adds a visible zero baseline and keeps over-target values inside the axis", () => {
    const points = [
      { date: "2026-06-08", period: "S24", score: 80 },
      { date: "2026-06-15", period: "S25", score: 125 },
    ];
    const chartPoints = withZeroBaseline(points, ["score"]);

    expect(chartPoints[0]).toMatchObject({ isBaseline: true, period: "0", score: 0 });
    expect(chartPoints.slice(1)).toEqual(points);
    expect(chartAxisMaximum(chartPoints, ["score"])).toBeGreaterThan(125);
  });

  it("keeps equal period labels from different seasons as separate points", () => {
    const first = makeEvaluation({ id: "chart-first", date: "2026-03-10", period: "Semana 10 · Marzo 2026" });
    const future = { ...first, id: "future", date: "2027-03-10", season: "2027 Apertura", finalScore: 50 };
    expect(getOverviewSeries([first, future])).toHaveLength(2);
  });

  it("updates the overview series when a new evaluation is registered", () => {
    const current = getOverviewSeries(fixtureEvaluations);
    const latest = fixtureEvaluations.at(-1)!;
    const added = { ...latest, id: "added", finalScore: 0 };
    const updated = getOverviewSeries([...fixtureEvaluations, added]);
    expect(updated.at(-1)!.score).not.toBe(current.at(-1)!.score);
  });

  it("recalculates the trend independently for weekly, monthly and annual views", () => {
    const base = makeEvaluation({ id: "trend-base" });
    const points = [
      { ...base, id: "trend-1", date: "2026-01-05", period: "Semana 2 · Enero 2026", finalScore: 50 },
      { ...base, id: "trend-2", date: "2026-01-12", period: "Semana 3 · Enero 2026", finalScore: 55 },
      { ...base, id: "trend-3", date: "2026-02-02", period: "Semana 6 · Febrero 2026", finalScore: 75 },
    ];

    expect(getTrendSeries(points, "week").map((point) => point.condition)).toEqual(["Inexistencia", "Normal", "Normal"]);
    expect(getTrendSeries(points, "month").map((point) => point.condition)).toEqual(["Inexistencia", "Normal"]);
    expect(getTrendSeries(points, "year").map((point) => point.condition)).toEqual(["Inexistencia"]);
  });

  it("counts peak streaks at 100 before moving from Afluencia to Poder", () => {
    const base = makeEvaluation({ id: "recovery-base" });
    const points = [
      { ...base, id: "recovery-1", date: "2026-06-08", finalScore: 60 },
      { ...base, id: "recovery-2", date: "2026-06-15", finalScore: 100 },
      { ...base, id: "recovery-3", date: "2026-06-22", finalScore: 100 },
      { ...base, id: "recovery-4", date: "2026-06-29", finalScore: 100 },
    ];

    expect(getTrendSeries(points, "week").map((point) => point.condition)).toEqual(["Inexistencia", "Afluencia", "Afluencia", "Poder"]);
  });

  it("keeps over-target production visible in the trend index", () => {
    const base = makeEvaluation({ id: "index-base" });
    const points = [
      { ...base, id: "index-1", date: "2026-06-08", finalScore: 100, performanceIndex: 100 },
      { ...base, id: "index-2", date: "2026-06-15", finalScore: 100, performanceIndex: 135 },
    ];

    expect(getTrendSeries(points, "week").map((point) => point.score)).toEqual([100, 135]);
  });

  it("counts the latest recalculated condition for each profile", () => {
    const base = makeEvaluation({ id: "state-base" });
    const points = [
      { ...base, id: "state-1", collaboratorProfileId: "PROFILE-1", date: "2026-06-08", finalScore: 60, performanceIndex: 60 },
      { ...base, id: "state-2", collaboratorProfileId: "PROFILE-1", date: "2026-06-15", finalScore: 100, performanceIndex: 100 },
      { ...base, id: "state-3", collaboratorProfileId: "PROFILE-1", date: "2026-06-22", finalScore: 100, performanceIndex: 100 },
    ];

    expect(getLatestProfileTrendStates(points).map((point) => point.condition)).toEqual(["Afluencia"]);
  });

  it("keeps each captured evaluation as a visible point in the individual dashboard unit mode", () => {
    const first = makeEvaluation({ id: "point-1", finalScore: 60 });
    const second = { ...makeEvaluation({ id: "point-2", finalScore: 90 }), date: first.date, period: first.period };
    const points = getEvaluationPointSeries([first, second]);
    expect(points).toHaveLength(2);
    expect(points.map((item) => item.score)).toEqual([first.finalScore, second.finalScore]);
  });

  it("compares a person only with peers from the same unit, position and period", () => {
    const sergio = makeEvaluation({ id: "sergio", evaluatedPersonName: "Sergio Valdés", finalScore: 84 });
    const otherUnit = { ...sergio, id: "other-unit", businessUnitId: "another-unit", evaluatedPersonName: "Persona Externa", finalScore: 0 };
    expect(getIndividualSeries([sergio, otherUnit], "Sergio Valdés")[0].positionAverage).toBe(sergio.finalScore);
  });

  it("summarizes the updated portfolio without requiring seed records", () => {
    const summaries = getUnitSummaries(businessUnits, positions, seedEvaluations);
    expect(summaries).toHaveLength(10);
    expect(summaries.every((item) => item.evaluationCount === 0)).toBe(true);
    expect(summaries.some((item) => item.name === "Halcones Fútbol Club")).toBe(false);
  });
});

describe("getAlerts", () => {
  it("detects low scores, declines, repeated incidences and missing catalog definitions", () => {
    const alerts = getAlerts(fixtureEvaluations, positions, businessUnits);
    expect(alerts.some((alert) => alert.alertType === "low-score" && alert.evaluatedPersonName === "Rodrigo Lara")).toBe(true);
    expect(alerts.some((alert) => alert.alertType === "decline" && alert.evaluatedPersonName === "Rodrigo Lara")).toBe(true);
    expect(alerts.some((alert) => alert.alertType === "repeated-incidence" && alert.evaluatedPersonName === "Rodrigo Lara")).toBe(true);
    expect(alerts.filter((alert) => alert.alertType === "missing-rep")).toHaveLength(0);
  });
});

describe("focus consolidation architecture", () => {
  it("propagates a collaborator focus trend through the fundacion hierarchy", () => {
    const coordinatorPosition = fundacionPosition("coordinador-de-procuracion-de-fondos");
    const volunteerPosition = fundacionPosition("voluntariado-de-procuracion-de-fondos");
    const coordinatorProfileId = getPositionProfileId(coordinatorPosition.id);
    const volunteerProfileId = getPositionProfileId(volunteerPosition.id);
    const profiles = [coordinatorPosition, volunteerPosition].map((position) => ({
      id: getPositionProfileId(position.id),
      businessUnitId: FUNDACION_DANTE_UNIT_ID,
      positionId: position.id,
      name: position.name,
      status: "active" as const,
      createdAt: "2026-06-18",
      updatedAt: "2026-06-18",
    }));
    const focusEvaluation = (id: string, date: string, score: number, condition: NonNullable<Evaluation["focusDaily"]>["trendCondition"]): Evaluation => ({
      ...makeEvaluation({ id: `${id}-base`, positionId: volunteerPosition.id }),
      id,
      businessUnitId: FUNDACION_DANTE_UNIT_ID,
      area: volunteerPosition.area,
      positionId: volunteerPosition.id,
      positionName: volunteerPosition.name,
      rep: volunteerPosition.rep,
      evaluatedPersonName: volunteerPosition.name,
      evaluatorName: "",
      date,
      period: date,
      week: "S25",
      month: "Junio",
      season: "2026",
      subjectType: "collaborator",
      collaboratorProfileId: volunteerProfileId,
      methodVersion: "focus-daily-v5",
      finalScore: score,
      condition: condition === "Sin histórico suficiente" ? undefined : condition,
      focusDaily: {
        totalActivities: 1,
        completedActivities: score >= 100 ? 1 : 0,
        inProgressActivities: score > 0 && score < 100 ? 1 : 0,
        pendingActivities: score === 0 ? 1 : 0,
        blockedActivities: 0,
        weightedScore: score,
        generalStatus: getFocusDailySemaphore(score),
        trendCondition: condition,
        isPowerCondition: condition === "Poder",
        updatedAt: date,
      },
    });

    const hierarchy = buildFundacionHierarchy({
      businessUnitId: FUNDACION_DANTE_UNIT_ID,
      evaluations: [
        focusEvaluation("volunteer-focus-1", "2026-06-17", 100, "Sin histórico suficiente"),
        focusEvaluation("volunteer-focus-2", "2026-06-18", 70, "Peligro"),
      ],
      positions: fundacionDantePositions,
      profiles,
      relationships: defaultFocusRelationships,
      rootProfileId: coordinatorProfileId,
    });

    expect(hierarchy?.consolidatedScore).toBe(70);
    expect(hierarchy?.consolidatedCondition).toBe("Peligro");
    expect(hierarchy?.history.map((point) => point.score)).toEqual([100, 70]);
  });

  it("keeps the unit focus condition separate from the coordinator condition", () => {
    const directorPosition = fundacionPosition("director-general-udn");
    const coordinatorPosition = fundacionPosition("coordinador-de-procuracion-de-fondos");
    const volunteerPosition = fundacionPosition("voluntariado-de-procuracion-de-fondos");
    const directorProfileId = getPositionProfileId(directorPosition.id);
    const coordinatorProfileId = getPositionProfileId(coordinatorPosition.id);
    const volunteerProfileId = getPositionProfileId(volunteerPosition.id);
    const profiles = [directorPosition, coordinatorPosition, volunteerPosition].map((position) => ({
      id: getPositionProfileId(position.id),
      businessUnitId: FUNDACION_DANTE_UNIT_ID,
      positionId: position.id,
      name: position.name,
      status: "active" as const,
      createdAt: "2026-06-18",
      updatedAt: "2026-06-18",
    }));
    const focusEvaluation = (
      id: string,
      date: string,
      position: typeof directorPosition,
      profileId: string,
      score: number,
      condition: NonNullable<Evaluation["focusDaily"]>["trendCondition"],
    ): Evaluation => ({
      ...makeEvaluation({ id: `${id}-base`, positionId: position.id }),
      id,
      businessUnitId: FUNDACION_DANTE_UNIT_ID,
      area: position.area,
      positionId: position.id,
      positionName: position.name,
      rep: position.rep,
      evaluatedPersonName: position.name,
      evaluatorName: "",
      date,
      period: date,
      week: "S25",
      month: "Junio",
      season: "2026",
      subjectType: "collaborator",
      collaboratorProfileId: profileId,
      methodVersion: "focus-daily-v5",
      finalScore: score,
      condition: condition === "Sin histórico suficiente" ? undefined : condition,
      focusDaily: {
        totalActivities: 1,
        completedActivities: score >= 100 ? 1 : 0,
        inProgressActivities: score > 0 && score < 100 ? 1 : 0,
        pendingActivities: score === 0 ? 1 : 0,
        blockedActivities: 0,
        weightedScore: score,
        generalStatus: getFocusDailySemaphore(score),
        trendCondition: condition,
        isPowerCondition: condition === "Poder",
        updatedAt: date,
      },
    });
    const reportEvaluations = [
      focusEvaluation("volunteer-focus-1", "2026-06-17", volunteerPosition, volunteerProfileId, 100, "Sin histórico suficiente"),
      focusEvaluation("volunteer-focus-2", "2026-06-18", volunteerPosition, volunteerProfileId, 70, "Peligro"),
      focusEvaluation("coordinator-own-focus-1", "2026-06-18", coordinatorPosition, coordinatorProfileId, 92, "Normal"),
    ];
    const directorHierarchyWithoutOwnFocus = buildFundacionHierarchy({
      businessUnitId: FUNDACION_DANTE_UNIT_ID,
      evaluations: reportEvaluations,
      positions: fundacionDantePositions,
      profiles,
      relationships: defaultFocusRelationships,
      rootProfileId: directorProfileId,
    });
    const coordinatorNode = flattenFundacionHierarchy(directorHierarchyWithoutOwnFocus)
      .find((node) => node.profile.id === coordinatorProfileId);
    const unitWithoutDirectorFocus = deriveUnitFocusFromDirectorHierarchy(directorHierarchyWithoutOwnFocus);

    expect(coordinatorNode?.consolidatedScore).toBe(70);
    expect(coordinatorNode?.consolidatedCondition).toBe("Peligro");
    expect(coordinatorNode?.ownFocusScore).toBe(92);
    expect(coordinatorNode?.ownFocusCondition).toBe("Normal");
    expect(unitWithoutDirectorFocus.ready).toBe(false);
    expect(unitWithoutDirectorFocus.missingDirectorFocus).toBe(true);

    const directorHierarchyWithOwnFocus = buildFundacionHierarchy({
      businessUnitId: FUNDACION_DANTE_UNIT_ID,
      evaluations: [
        ...reportEvaluations,
        focusEvaluation("director-focus-1", "2026-06-18", directorPosition, directorProfileId, 80, "Sin histórico suficiente"),
      ],
      positions: fundacionDantePositions,
      profiles,
      relationships: defaultFocusRelationships,
      rootProfileId: directorProfileId,
    });
    const unitWithDirectorFocus = deriveUnitFocusFromDirectorHierarchy(directorHierarchyWithOwnFocus);

    expect(unitWithDirectorFocus.ready).toBe(true);
    expect(unitWithDirectorFocus.score).toBe(75);
    expect(unitWithDirectorFocus.sourceCount).toBe(2);
  });

  it("calculates a weighted consolidated condition from related focus and own focus", () => {
    const result = calculateConsolidatedFocusCondition({
      businessUnitId: "unit",
      date: "2026-06-16",
      userProfileId: "manager",
      ownWeight: 1,
      previousConsolidatedResults: [{ date: "2026-06-15", consolidatedScore: 70 }],
      focusResults: [
        { profileId: "manager", businessUnitId: "unit", date: "2026-06-16", score: 90, trendCondition: "Normal", generalStatus: "Verde", source: "own_focus" },
        { profileId: "collab-a", businessUnitId: "unit", date: "2026-06-16", score: 80, trendCondition: "Normal", generalStatus: "Verde", source: "own_focus" },
        { profileId: "collab-b", businessUnitId: "unit", date: "2026-06-16", score: 60, trendCondition: "Emergencia", generalStatus: "Amarillo", source: "own_focus" },
      ],
      relationships: [
        { id: "rel-a", businessUnitId: "unit", sourceProfileId: "collab-a", targetProfileId: "manager", relationshipType: "Reporta directamente a", weight: 1, startDate: "2026-06-01", status: "active", createdBy: "Admin", createdAt: "2026-06-01", updatedAt: "2026-06-01" },
        { id: "rel-b", businessUnitId: "unit", sourceProfileId: "collab-b", targetProfileId: "manager", relationshipType: "Reporte compartido", weight: 0.5, startDate: "2026-06-01", status: "active", createdBy: "Admin", createdAt: "2026-06-01", updatedAt: "2026-06-01" },
      ],
    });

    expect(result.consolidatedScore).toBe(80);
    expect(result.relatedScore).toBe(73);
    expect(result.trendCondition).toBe("Normal");
    expect(result.inputsUsed).toHaveLength(3);
  });

  it("prevents double counting the same profile in one responsible formula", () => {
    const inputs = preventDuplicateCounting([
      { sourceProfileId: "collab", score: 50, weight: 1, sourceType: "related_condition" },
      { sourceProfileId: "collab", score: 90, weight: 2, sourceType: "related_condition" },
    ]);

    expect(inputs).toHaveLength(1);
    expect(inputs[0].score).toBe(90);
  });

  it("validates hierarchy relationships before saving them", () => {
    expect(validateRelationshipConfiguration({
      businessUnitId: "unit",
      sourceProfileId: "same",
      targetProfileId: "same",
      weight: 1,
      startDate: "2026-06-01",
      status: "active",
    })).toContain("Un perfil no puede reportarse a sí mismo.");
  });

  it("uses the director consolidated condition as the focus condition of the business unit", () => {
    const result = calculateBusinessUnitFocusCondition("unit", "director", "2026-06-16", [{
      userProfileId: "director",
      businessUnitId: "unit",
      date: "2026-06-16",
      consolidatedScore: 84,
      generalStatus: "Verde",
      trendCondition: "Normal",
      isPowerCondition: false,
      source: "focus-consolidated",
      inputsUsed: [],
      createdAt: "2026-06-16",
      updatedAt: "2026-06-16",
    }]);

    expect(result.unitFocusScore).toBe(84);
    expect(result.unitFocusCondition).toBe("Normal");
  });
});

describe("position indicator metrics", () => {
  it("calculates the weekly indicator percentage as the simple average of captured advances", () => {
    const indicators = [
      normalizeIndicatorResult({ indicatorId: "a", indicatorName: "Cuentas", score: 27, observations: "Avance capturado" }),
      normalizeIndicatorResult({ indicatorId: "b", indicatorName: "Seguimiento", score: Number.NaN, observations: "" }),
      normalizeIndicatorResult({ indicatorId: "c", indicatorName: "Cierre", score: -12, observations: "" }),
    ];

    expect(indicators.map((item) => item.score)).toEqual([27, 0, 0]);
    expect(indicators.map((item) => item.result)).toEqual(["No Cumplió", "No Cumplió", "No Cumplió"]);
    expect(calculateWeeklyPositionIndicatorScore(indicators)).toBe(9);
    expect(indicators.map((item) => item.semaphore)).toEqual(["Rojo", "Rojo", "Rojo"]);
    expect(calculateWeeklyIndicatorCondition(9).weeklyCondition).toBe("Inexistencia");
  });

  it("keeps indicator advances inside the 0 to 100 capture range", () => {
    expect(normalizeIndicatorScore(undefined)).toBe(0);
    expect(normalizeIndicatorScore(-1)).toBe(0);
    expect(normalizeIndicatorScore(101)).toBe(100);
    expect(normalizeIndicatorScore(49.6)).toBe(50);
  });

  it("calculates indicator attainment from real quantity or percentage against the assigned goal", () => {
    expect(calculateIndicatorAttainmentScore(12, 24)).toBe(50);
    expect(calculateIndicatorAttainmentScore(60, 80)).toBe(75);
    expect(calculateIndicatorAttainmentScore(130, 100)).toBe(100);
    expect(calculateIndicatorAttainmentScore(10, 0)).toBe(0);
  });

  it("derives each indicator status automatically from its captured percentage", () => {
    expect(getIndicatorStatusMeta(0)).toMatchObject({ status: "No Cumplió", color: "red" });
    expect(getIndicatorStatusMeta(49)).toMatchObject({ status: "No Cumplió", color: "red" });
    expect(getIndicatorStatusMeta(50)).toMatchObject({ status: "Medio Cumplió", color: "yellow" });
    expect(getIndicatorStatusMeta(99)).toMatchObject({ status: "Medio Cumplió", color: "yellow" });
    expect(getIndicatorStatusMeta(100)).toMatchObject({ status: "Cumplió", color: "green" });
  });

  it("classifies the weekly condition by the fixed percentage ranges", () => {
    expect(getWeeklyIndicatorConditionMeta(39)).toMatchObject({ condition: "Inexistencia", color: "red" });
    expect(getWeeklyIndicatorConditionMeta(40)).toMatchObject({ condition: "Peligro", color: "orange" });
    expect(getWeeklyIndicatorConditionMeta(60)).toMatchObject({ condition: "Emergencia", color: "yellow" });
    expect(getWeeklyIndicatorConditionMeta(80)).toMatchObject({ condition: "Normal", color: "blue" });
    expect(getWeeklyIndicatorConditionMeta(95)).toMatchObject({ condition: "Afluencia", color: "green" });
    expect(calculateWeeklyIndicatorCondition(82, [{ weightedScore: 70 }])).toMatchObject({
      previousScore: 70,
      trendDeltaPP: 12,
      weeklyCondition: "Normal",
      weeklyConditionColor: "blue",
    });
  });

  it("normalizes stored weekly indicator records for graphing and history", () => {
    const normalized = normalizeWeeklyPositionIndicatorRecord({
      businessUnitId: "unit",
      collaboratorProfileId: "profile",
      createdAt: "2026-06-15",
      evaluatorName: "Dirección",
      id: "legacy",
      indicators: [
        { indicatorId: "a", indicatorName: "A", result: "Cumplió", score: 120, observations: "", semaphore: "Verde" },
        { indicatorId: "b", indicatorName: "B", result: "En Riesgo" as never, score: 50, observations: "", semaphore: "Rojo" },
      ],
      positionId: "position",
      source: "position-indicators",
      updatedAt: "2026-06-15",
      week: "Semana 25",
      weekEndDate: "2026-06-21",
      weekStartDate: "2026-06-15",
      weeklyCondition: "Sin histórico suficiente",
      weightedScore: 0,
    });

    expect(normalized.indicators.map((item) => item.score)).toEqual([100, 50]);
    expect(normalized.indicators.map((item) => item.result)).toEqual(["Cumplió", "Medio Cumplió"]);
    expect(normalized.weightedScore).toBe(75);
    expect(normalized.weeklyCondition).toBe("Emergencia");
    expect(normalized.weeklyConditionColor).toBe("yellow");
  });

  it("graphs weekly position indicators with the saved weekly percentage condition", () => {
    const baseRecord = {
      businessUnitId: "unit",
      collaboratorProfileId: "profile",
      evaluatorName: "Dirección",
      positionId: "position",
      weekEndDate: "2026-06-14",
      indicators: [],
      source: "position-indicators" as const,
      createdAt: "2026-06-14",
      updatedAt: "2026-06-14",
    };
    const series = getPositionIndicatorTrendSeries([
      { ...baseRecord, id: "w1", week: "Semana 24", weekStartDate: "2026-06-08", weightedScore: 50, weeklyCondition: "Peligro" },
      { ...baseRecord, id: "w2", week: "Semana 25", weekStartDate: "2026-06-15", weekEndDate: "2026-06-21", weightedScore: 72, weeklyCondition: "Emergencia" },
      { ...baseRecord, id: "w3", week: "Semana 26", weekStartDate: "2026-06-22", weekEndDate: "2026-06-28", weightedScore: 96, weeklyCondition: "Afluencia" },
    ], "week");

    expect(series.map((point) => point.score)).toEqual([50, 72, 96]);
    expect(series.at(-1)?.condition).toBe("Afluencia");
    expect(series.at(-1)?.delta).toBe(24);
  });
});
