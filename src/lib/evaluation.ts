import type {
  BusinessUnit,
  Evaluation,
  EvaluationMeasurementMode,
  EvaluationStatistic,
  EvaluationStatisticDraft,
  OperationalCondition,
  PerformanceAlert,
  PerformanceStatus,
  Position,
  Trend,
} from "../types";
import { hasOfficialKpis } from "./catalog";

export const normalizeName = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase("es-MX");
type CollaboratorIdentity = Pick<Evaluation, "businessUnitId" | "positionId" | "evaluatedPersonName"> & { collaboratorProfileId?: string };

export function getEvaluationProfileKey(identity: CollaboratorIdentity) {
  return identity.collaboratorProfileId?.trim()
    || `LEGACY|${identity.businessUnitId}|${identity.positionId}|${normalizeName(identity.evaluatedPersonName)}`;
}

export function isSameCollaboratorProfile(left: CollaboratorIdentity, right: CollaboratorIdentity) {
  return getEvaluationProfileKey(left) === getEvaluationProfileKey(right);
}

export const OPERATIONAL_CONDITIONS: OperationalCondition[] = ["Inexistencia", "Peligro", "Emergencia", "Normal", "Afluencia", "Poder"];

export const DEFAULT_TREND_CONFIGURATION = {
  riseThreshold: 40,
  fallThreshold: 25,
  flatTolerance: 1,
  prolongedFlatPeriods: 3,
  powerMinimumPeriods: 14,
  powerMinimumMonths: 3,
};

type TrendConditionOptions = {
  hasPrevious?: boolean;
  recentScores?: number[];
  sustainedPower?: boolean;
  riseThreshold?: number;
  fallThreshold?: number;
  flatTolerance?: number;
  prolongedFlatPeriods?: number;
};

export function calculateFinalScore(kpiScores: number[], complianceScore: number, evidenceScore: number): number {
  if (!kpiScores.length) throw new Error("El puesto necesita al menos un KPI para calcular la evaluación.");
  [...kpiScores, complianceScore, evidenceScore].forEach((score) => {
    if (!Number.isFinite(score) || score < 1 || score > 5) throw new Error("Las calificaciones deben estar entre 1 y 5.");
  });
  const kpis = (kpiScores.reduce((sum, value) => sum + value, 0) / (kpiScores.length * 5)) * 70;
  return Math.round((kpis + (complianceScore / 5) * 20 + (evidenceScore / 5) * 10) * 10) / 10;
}

export function getPerformanceStatus(score: number): PerformanceStatus {
  if (score >= 90) return "Excelente";
  if (score >= 80) return "Bueno";
  if (score >= 70) return "En observación";
  if (score >= 60) return "Riesgo";
  return "Crítico";
}

const round = (value: number) => Math.round(value * 10) / 10;
export const clampPercentage = (value: number) => Math.max(0, Math.min(100, round(value)));

const trafficLightScores: Record<string, number> = {
  Rojo: 0,
  Amarillo: 50,
  Verde: 100,
};

const complianceScores: Record<string, number> = {
  "No cumple": 0,
  "Medio cumple": 50,
  Cumple: 100,
};

export const measurementModeLabels: Record<EvaluationMeasurementMode, string> = {
  numeric: "Cantidad",
  "scale-1-5": "Escala del 1 al 5",
  percentage: "Porcentaje",
  "traffic-light": "Semáforo",
  compliance: "Cumplimiento",
};

export function getMeasurementScore(input: Pick<EvaluationStatisticDraft, "measurementMode" | "currentValue" | "currentSelection">): number {
  const mode = input.measurementMode ?? "numeric";
  if (mode === "scale-1-5") return clampPercentage((input.currentValue / 5) * 100);
  if (mode === "percentage") return clampPercentage(input.currentValue);
  if (mode === "traffic-light") return trafficLightScores[input.currentSelection ?? ""] ?? input.currentValue;
  if (mode === "compliance") return complianceScores[input.currentSelection ?? ""] ?? input.currentValue;
  return clampPercentage(input.currentValue);
}

function getPreviousMeasurementScore(input: EvaluationStatisticDraft): number {
  const mode = input.measurementMode ?? "numeric";
  if (mode === "scale-1-5") return clampPercentage((input.previousValue / 5) * 100);
  return clampPercentage(input.previousValue);
}

function getTargetMeasurementScore(input: EvaluationStatisticDraft): number {
  const mode = input.measurementMode ?? "numeric";
  if (mode === "scale-1-5") return clampPercentage((input.targetValue / 5) * 100);
  return clampPercentage(input.targetValue);
}

export function getStatisticPerformanceIndex(input: EvaluationStatisticDraft): number {
  const mode = input.measurementMode ?? "numeric";
  const currentScore = mode === "numeric" ? input.currentValue : getMeasurementScore(input);
  const targetScore = mode === "numeric" ? input.targetValue : getTargetMeasurementScore(input);
  return targetScore > 0 ? round((currentScore / targetScore) * 100) : 0;
}

export function getConditionFromTrend(
  currentScore: number,
  previousScore?: number,
  options: TrendConditionOptions = {},
): OperationalCondition {
  const {
    hasPrevious = typeof previousScore === "number",
    recentScores = [],
    sustainedPower = false,
    riseThreshold = DEFAULT_TREND_CONFIGURATION.riseThreshold,
    fallThreshold = DEFAULT_TREND_CONFIGURATION.fallThreshold,
    flatTolerance = DEFAULT_TREND_CONFIGURATION.flatTolerance,
    prolongedFlatPeriods = DEFAULT_TREND_CONFIGURATION.prolongedFlatPeriods,
  } = options;
  if (!hasPrevious || typeof previousScore !== "number") return "Inexistencia";
  if (currentScore <= 0) return "Peligro";
  if (sustainedPower) return "Poder";

  const values = recentScores.length ? recentScores : [previousScore, currentScore];
  const valuesWithCurrent = values.at(-1) === currentScore ? values : [...values, currentScore];
  const previousValues = valuesWithCurrent.slice(0, -1);
  let peakStreakCount = 0;
  if (currentScore >= 100) {
    for (let index = previousValues.length - 1; index >= 0; index -= 1) {
      if (previousValues[index] < 100) break;
      peakStreakCount += 1;
    }
  }
  const lastPriorPeakIndex = previousValues.map((score, index) => score >= 100 ? index : -1).filter((index) => index >= 0).at(-1);
  const peakRecoveryTail = typeof lastPriorPeakIndex === "number" ? [...previousValues.slice(lastPriorPeakIndex), currentScore] : [];
  const peakRecoveryPower = currentScore >= 100
    && peakRecoveryTail.length >= 3
    && peakRecoveryTail.every((score) => score >= 80)
    && peakStreakCount < 2;
  if (peakStreakCount >= 2 || peakRecoveryPower) return "Poder";
  if (peakStreakCount === 1) return "Afluencia";
  const recentDeltas = values.slice(1).map((value, index) => value - values[index]);
  const delta = round(currentScore - previousScore);
  const scoreTwoPeriodsAgo = values.length >= 3 ? values.at(-3) : undefined;
  const highProductionPlateau = currentScore >= 90
    && previousScore >= 90
    && Math.abs(delta) <= flatTolerance;
  const consolidatesRecentImprovement = Math.abs(delta) <= flatTolerance
    && typeof scoreTwoPeriodsAgo === "number"
    && currentScore > scoreTwoPeriodsAgo + flatTolerance;
  const isProlongedFlat = recentDeltas.length >= prolongedFlatPeriods
    && recentDeltas.slice(-prolongedFlatPeriods).every((delta) => Math.abs(delta) <= flatTolerance);
  if (isProlongedFlat && !highProductionPlateau) return "Peligro";
  if (consolidatesRecentImprovement || highProductionPlateau) return "Normal";

  if (delta >= riseThreshold) return "Afluencia";
  if (delta <= -fallThreshold) return "Peligro";
  if (delta <= 0) return "Emergencia";
  return "Normal";
}

export function getOperationalCondition(previousValue: number, currentValue: number, targetValue: number): OperationalCondition {
  const previousAttainment = targetValue > 0 ? clampPercentage((previousValue / targetValue) * 100) : previousValue;
  const currentAttainment = targetValue > 0 ? clampPercentage((currentValue / targetValue) * 100) : currentValue;
  return getConditionFromTrend(currentAttainment, previousAttainment, { hasPrevious: true });
}

export function calculateStatistic(
  input: EvaluationStatisticDraft,
  trendContext: {
    hasPrevious?: boolean;
    previousScore?: number;
    recentScores?: number[];
    sustainedPower?: boolean;
  } = {},
): EvaluationStatistic {
  const values = [input.previousValue, input.currentValue, input.targetValue];
  if (values.some((value) => !Number.isFinite(value) || value < 0)) throw new Error("Las estadísticas deben contener valores numéricos iguales o mayores a cero.");
  if (!input.name.trim() || !input.measurementUnit.trim()) throw new Error("Cada estadística necesita nombre y unidad de medida.");
  const mode = input.measurementMode ?? "numeric";
  if (mode === "scale-1-5" && (input.currentValue < 1 || input.currentValue > 5)) throw new Error("Las evaluaciones de escala deben estar entre 1 y 5.");
  if (mode === "scale-1-5" && (input.targetValue < 1 || input.targetValue > 5)) throw new Error("La meta de escala debe estar entre 1 y 5.");
  if (mode === "percentage" && input.currentValue > 100) throw new Error("El porcentaje debe estar entre 0 y 100.");
  if (mode === "percentage" && (input.targetValue <= 0 || input.targetValue > 100)) throw new Error("La meta porcentual debe estar entre 1 y 100.");
  if (mode === "traffic-light" && !(input.currentSelection && input.currentSelection in trafficLightScores)) throw new Error("Selecciona un color del semáforo.");
  if (mode === "traffic-light" && (input.targetValue <= 0 || input.targetValue > 100 || (input.targetSelection && !(input.targetSelection in trafficLightScores)))) throw new Error("Selecciona una meta válida para el semáforo.");
  if (mode === "compliance" && !(input.currentSelection && input.currentSelection in complianceScores)) throw new Error("Selecciona el nivel de cumplimiento.");
  if (mode === "compliance" && (input.targetValue <= 0 || input.targetValue > 100 || (input.targetSelection && !(input.targetSelection in complianceScores)))) throw new Error("Selecciona una meta válida de cumplimiento.");
  if (mode === "numeric" && input.targetValue <= 0) throw new Error("La meta de cada estadística debe ser mayor a cero.");
  const isFlexibleMode = mode !== "numeric";
  const currentScore = isFlexibleMode ? getMeasurementScore(input) : input.currentValue;
  const previousScore = isFlexibleMode ? getPreviousMeasurementScore(input) : input.previousValue;
  const targetScore = isFlexibleMode ? getTargetMeasurementScore(input) : input.targetValue;
  const variation = currentScore - previousScore;
  const variationPercentage = previousScore > 0 ? (variation / previousScore) * 100 : currentScore > 0 ? 100 : 0;
  const performanceIndex = getStatisticPerformanceIndex(input);
  const targetAttainment = clampPercentage(performanceIndex);
  const previousTargetAttainment = trendContext.previousScore
    ?? (targetScore > 0 ? round((previousScore / targetScore) * 100) : previousScore);
  const recentScores = [...(trendContext.recentScores ?? []), performanceIndex];
  return {
    ...input,
    name: input.name.trim(),
    description: input.description.trim(),
    measurementUnit: input.measurementUnit.trim(),
    variation: round(variation),
    variationPercentage: round(variationPercentage),
    targetAttainment: round(targetAttainment),
    performanceIndex,
    condition: getConditionFromTrend(performanceIndex, previousTargetAttainment, {
      hasPrevious: trendContext.hasPrevious ?? false,
      recentScores,
      sustainedPower: trendContext.sustainedPower,
    }),
  };
}

export function getOverallCondition(
  statistics: EvaluationStatistic[],
  previousScore?: number,
  recentScores: number[] = [],
  sustainedPower = false,
): OperationalCondition {
  if (!statistics.length) return "Inexistencia";
  const currentScore = calculatePerformanceIndex(statistics);
  return getConditionFromTrend(currentScore, previousScore, {
    hasPrevious: typeof previousScore === "number",
    recentScores: [...recentScores, currentScore],
    sustainedPower,
  });
}

export function calculateTargetAttainment(statistics: EvaluationStatistic[]): number {
  return statistics.length ? clampPercentage(statistics.reduce((sum, item) => sum + clampPercentage(item.targetAttainment), 0) / statistics.length) : 0;
}

export function calculatePerformanceIndex(statistics: EvaluationStatistic[]): number {
  return statistics.length
    ? round(statistics.reduce((sum, item) => sum + (item.performanceIndex ?? getStatisticPerformanceIndex(item)), 0) / statistics.length)
    : 0;
}

export function getEvaluationTrendScore(evaluation: Evaluation): number {
  if (typeof evaluation.performanceIndex === "number") return evaluation.performanceIndex;
  return evaluation.statistics?.length ? calculatePerformanceIndex(evaluation.statistics) : evaluation.finalScore;
}

export function conditionToStatus(condition: OperationalCondition): PerformanceStatus {
  return ({
    Inexistencia: "Crítico",
    Peligro: "Riesgo",
    Emergencia: "En observación",
    Normal: "Bueno",
    Afluencia: "Excelente",
    Poder: "Excelente",
  })[condition] as PerformanceStatus;
}

export function conditionTone(condition: OperationalCondition): string {
  return ({
    Inexistencia: "critical",
    Peligro: "risk",
    Emergencia: "watch",
    Normal: "good",
    Afluencia: "excellent",
    Poder: "power",
  })[condition];
}

export const conditionFormula: Record<OperationalCondition, string[]> = {
  Inexistencia: [
    "Encontrar o restablecer la línea de comunicación.",
    "Detectar la necesidad real y producir una entrega visible.",
    "Presentar el producto y comenzar a medir semanalmente.",
  ],
  Peligro: [
    "Atender directamente el riesgo que está reduciendo la producción.",
    "Reorganizar responsabilidades, disciplina y recursos.",
    "Definir una acción inmediata con responsable y fecha.",
  ],
  Emergencia: [
    "Promover y producir para romper el estancamiento.",
    "Cambiar la base operativa que no está generando avance.",
    "Economizar y preparar un servicio mejor.",
  ],
  Normal: [
    "No cambiar lo que está produciendo el incremento.",
    "Reforzar las acciones que mejoran la estadística.",
    "Corregir rápidamente cualquier deterioro menor.",
  ],
  Afluencia: [
    "Consolidar la causa del aumento y documentarla.",
    "Economizar, pagar compromisos e invertir en servicio.",
    "Preparar capacidad para sostener el nuevo volumen.",
  ],
  Poder: [
    "Documentar y estandarizar el nivel alto que sostuvo una tendencia Normal durante más de tres meses.",
    "Transferir capacidad y buenas prácticas sin deteriorar la operación actual.",
    "Definir una expansión medible con responsables, recursos y fechas.",
  ],
};

type EvaluationScorePoint = Pick<Evaluation, "businessUnitId" | "positionId" | "evaluatedPersonName" | "date" | "finalScore"> & { collaboratorProfileId?: string };

const dayMs = 24 * 60 * 60 * 1000;
const scoreDate = (value: string) => new Date(`${value}T12:00:00`);

export function hasSustainedPower(evaluations: EvaluationScorePoint[], candidate: EvaluationScorePoint): boolean {
  const comparable = evaluations.filter((item) =>
    isSameCollaboratorProfile(item, candidate)
    && item.date <= candidate.date
  );
  const byDate = new Map<string, EvaluationScorePoint>();
  [...comparable, candidate]
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((item) => byDate.set(item.date, item));
  const series = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  const sustainedTail = series.slice(-DEFAULT_TREND_CONFIGURATION.powerMinimumPeriods);
  if (sustainedTail.length < DEFAULT_TREND_CONFIGURATION.powerMinimumPeriods) return false;
  const firstDate = scoreDate(sustainedTail[0].date);
  const lastDate = scoreDate(sustainedTail.at(-1)!.date);
  const threeMonthsLater = new Date(firstDate);
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + DEFAULT_TREND_CONFIGURATION.powerMinimumMonths);
  if (lastDate < threeMonthsLater) return false;
  const deltas = sustainedTail.slice(1).map((item, index) => item.finalScore - sustainedTail[index].finalScore);
  const isContinuous = sustainedTail.every((item, index) =>
    index === 0 || (scoreDate(item.date).getTime() - scoreDate(sustainedTail[index - 1].date).getTime()) / dayMs <= 14
  );
  const staysInNormalMovement = deltas.every((delta) =>
    delta > -DEFAULT_TREND_CONFIGURATION.flatTolerance
    && delta < DEFAULT_TREND_CONFIGURATION.riseThreshold
  );
  const gradualGain = sustainedTail.at(-1)!.finalScore - sustainedTail[0].finalScore >= DEFAULT_TREND_CONFIGURATION.riseThreshold;
  return isContinuous && staysInNormalMovement && gradualGain;
}

export function statusTone(status: PerformanceStatus): string {
  return ({ Excelente: "excellent", Bueno: "good", "En observación": "watch", Riesgo: "risk", Crítico: "critical" })[status];
}

export function getTrend(currentScore: number, previousScore?: number): Trend {
  if (previousScore === undefined) return "Sin histórico";
  const delta = currentScore - previousScore;
  if (delta > 3) return "Mejora";
  if (delta < -3) return "Baja";
  return "Estable";
}

export function average(values: number[]): number {
  return values.length ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10 : 0;
}

export const getCollaboratorEvaluations = (evaluations: Evaluation[]) =>
  evaluations.filter((item) => item.subjectType !== "unit");

export function getLatestCollaboratorEvaluations(evaluations: Evaluation[], businessUnitId?: string): Evaluation[] {
  const latestByPerson = new Map<string, Evaluation>();
  getCollaboratorEvaluations(evaluations)
    .filter((item) => !businessUnitId || item.businessUnitId === businessUnitId)
    .forEach((item) => {
      const key = getEvaluationProfileKey(item);
      const current = latestByPerson.get(key);
      if (!current || item.date > current.date || (item.date === current.date && item.digitalCaptureDate > current.digitalCaptureDate)) {
        latestByPerson.set(key, item);
      }
    });
  return [...latestByPerson.values()];
}

export function getBusinessUnitScore(evaluations: Evaluation[], businessUnitId: string): number {
  return clampPercentage(average(getLatestCollaboratorEvaluations(evaluations, businessUnitId).map((item) => clampPercentage(item.finalScore))));
}

export const getEvaluationsByPersonName = (evaluations: Evaluation[], name: string) =>
  getCollaboratorEvaluations(evaluations).filter((item) => normalizeName(item.evaluatedPersonName) === normalizeName(name));
export function getCollaboratorEvaluationHistory(
  evaluations: Evaluation[],
  businessUnitId: string,
  positionId: string,
  evaluatedPersonName: string,
  throughDate?: string,
  collaboratorProfileId?: string,
) {
  if (!collaboratorProfileId && !evaluatedPersonName.trim()) return [];
  const identity = { businessUnitId, positionId, evaluatedPersonName, collaboratorProfileId };
  return getCollaboratorEvaluations(evaluations)
    .filter((item) =>
      isSameCollaboratorProfile(item, identity)
      && (!throughDate || item.date <= throughDate)
    )
    .sort((left, right) =>
      left.date.localeCompare(right.date)
      || left.digitalCaptureDate.localeCompare(right.digitalCaptureDate)
      || left.id.localeCompare(right.id)
    );
}
export const getEvaluationsByPeriod = (evaluations: Evaluation[], period: string) => getCollaboratorEvaluations(evaluations).filter((item) => item.period === period);
export const getAverageByBusinessUnit = (evaluations: Evaluation[], businessUnitId: string) =>
  getBusinessUnitScore(evaluations, businessUnitId);
export const getAverageByPosition = (evaluations: Evaluation[], positionId: string) =>
  clampPercentage(average(getLatestCollaboratorEvaluations(evaluations).filter((item) => item.positionId === positionId).map((item) => clampPercentage(item.finalScore))));
export const getAverageByArea = (evaluations: Evaluation[], area: string) =>
  clampPercentage(average(getLatestCollaboratorEvaluations(evaluations).filter((item) => item.area === area).map((item) => clampPercentage(item.finalScore))));

const keyForPerson = (item: Evaluation) => getEvaluationProfileKey(item);
const activeAlert = (alert: Omit<PerformanceAlert, "status" | "createdAt" | "dueDate">): PerformanceAlert => ({
  ...alert,
  status: "active",
  createdAt: new Date().toISOString().slice(0, 10),
  dueDate: "",
});

export function getAlerts(evaluations: Evaluation[], catalogPositions: Position[], units: BusinessUnit[]): PerformanceAlert[] {
  const alerts: PerformanceAlert[] = [];
  const byPerson = new Map<string, Evaluation[]>();
  getCollaboratorEvaluations(evaluations).forEach((item) => byPerson.set(keyForPerson(item), [...(byPerson.get(keyForPerson(item)) ?? []), item]));

  byPerson.forEach((items) => {
    const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted.at(-1)!;
    const previous = sorted.at(-2);
    const third = sorted.at(-3);
    const base = { businessUnitId: latest.businessUnitId, positionId: latest.positionId, evaluatedPersonName: latest.evaluatedPersonName, evaluationId: latest.id };
    if (latest.finalScore < 70) alerts.push(activeAlert({ ...base, id: `low-${latest.id}`, alertType: "low-score", severity: latest.finalScore < 50 ? "critical" : "warning", message: `${latest.evaluatedPersonName}: cumplimiento de meta ${latest.finalScore}% en ${latest.period}.` }));
    if (third && previous && latest.finalScore < previous.finalScore && previous.finalScore < third.finalScore) alerts.push(activeAlert({ ...base, id: `decline-${latest.id}`, alertType: "decline", severity: "warning", message: `${latest.evaluatedPersonName}: dos evaluaciones consecutivas bajando.` }));
    if (previous && [previous, latest].every((item) => item.condition === "Peligro" || item.condition === "Inexistencia")) alerts.push(activeAlert({ ...base, id: `streak-${latest.id}`, alertType: "risk-streak", severity: "critical", message: `${latest.evaluatedPersonName}: dos periodos consecutivos en condición crítica.` }));
    (latest.statistics ?? []).forEach((item, index) => {
      if (item.condition === "Peligro" || item.condition === "Inexistencia") alerts.push(activeAlert({ ...base, id: `kpi-${latest.id}-${index}`, alertType: "low-kpi", severity: "warning", message: `${latest.evaluatedPersonName}: ${item.name} está en ${item.condition}.` }));
    });
    const latestProblem = latest.problemStatement?.trim() || latest.incidents.trim();
    const previousProblem = previous?.problemStatement?.trim() || previous?.incidents.trim() || "";
    if (previous && latestProblem && normalizeName(latestProblem) === normalizeName(previousProblem)) alerts.push(activeAlert({ ...base, id: `incident-${latest.id}`, alertType: "repeated-incidence", severity: "notice", message: `${latest.evaluatedPersonName}: problemática repetida, ${latestProblem}.` }));
  });

  const collaboratorEvaluations = getCollaboratorEvaluations(evaluations);
  const latestDate = [...collaboratorEvaluations].sort((a, b) => b.date.localeCompare(a.date))[0]?.date;
  const latestMonth = latestDate?.slice(0, 7);
  byPerson.forEach((items) => {
    const latest = [...items].sort((a, b) => b.date.localeCompare(a.date))[0];
    if (latestMonth && !latest.date.startsWith(latestMonth)) alerts.push(activeAlert({ id: `missing-${keyForPerson(latest)}`, alertType: "missing-recent", severity: "notice", businessUnitId: latest.businessUnitId, positionId: latest.positionId, evaluatedPersonName: latest.evaluatedPersonName, message: `${latest.evaluatedPersonName}: sin evaluación reciente; último registro ${latest.period}.` }));
  });

  catalogPositions.forEach((item) => {
    if (!item.rep.trim()) alerts.push(activeAlert({ id: `rep-${item.id}`, alertType: "missing-rep", severity: "notice", businessUnitId: item.businessUnitId, positionId: item.id, message: `${item.name}: pendiente de REP oficial.` }));
    if (!hasOfficialKpis(item.kpis)) alerts.push(activeAlert({ id: `kpis-${item.id}`, alertType: "missing-kpis", severity: "notice", businessUnitId: item.businessUnitId, positionId: item.id, message: `${item.name}: pendiente de KPIs oficiales.` }));
  });
  catalogPositions.filter((item) => collaboratorEvaluations.some((evaluation) => evaluation.positionId === item.id)).forEach((item) => {
    const score = getAverageByPosition(collaboratorEvaluations, item.id);
    if (score < 70) alerts.push(activeAlert({ id: `position-${item.id}`, alertType: "low-position", severity: "warning", businessUnitId: item.businessUnitId, positionId: item.id, message: `${item.name}: promedio ${score}% por debajo de 70.` }));
  });
  units.filter((unit) => collaboratorEvaluations.some((item) => item.businessUnitId === unit.id)).forEach((unit) => {
    const score = getAverageByBusinessUnit(collaboratorEvaluations, unit.id);
    if (score < 70) alerts.push(activeAlert({ id: `unit-${unit.id}`, alertType: "low-unit", severity: "critical", businessUnitId: unit.id, message: `${unit.name}: promedio ${score}% por debajo de 70.` }));
  });
  return alerts;
}
