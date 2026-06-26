import { average, clampPercentage, DEFAULT_TREND_CONFIGURATION, getBusinessUnitScore, getCollaboratorEvaluations, getConditionFromTrend, getEvaluationProfileKey, getEvaluationTrendScore, getPerformanceStatus, getTrend, normalizeName } from "./evaluation";
import type { BusinessUnit, Evaluation, Position, TrendCadence } from "../types";

const getPeriodKey = (item: Evaluation) => `${item.season}|${item.date.slice(0, 7)}|${item.period}`;
const getPeriodLabel = (item: Evaluation) => {
  const year = item.date.slice(0, 4);
  return item.period.includes(year) ? item.period : `${item.period} ${year}`;
};

function getIsoWeek(value: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return { year: utc.getUTCFullYear(), week: Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7) };
}

function cadenceMeta(dateValue: string, cadence: TrendCadence) {
  const date = new Date(`${dateValue.slice(0, 10)}T12:00:00`);
  if (cadence === "day") {
    const key = dateValue.slice(0, 10);
    return {
      key,
      label: date.toLocaleDateString("es-MX", { day: "2-digit", month: "short" }),
      date: key,
    };
  }
  if (cadence === "year") {
    const year = date.getFullYear();
    return { key: String(year), label: String(year), date: `${year}-01-01` };
  }
  if (cadence === "month") {
    const key = dateValue.slice(0, 7);
    return {
      key,
      label: date.toLocaleDateString("es-MX", { month: "short", year: "numeric" }),
      date: `${key}-01`,
    };
  }
  const { year, week } = getIsoWeek(dateValue);
  const monday = new Date(date);
  const day = monday.getDay() || 7;
  monday.setDate(monday.getDate() - day + 1);
  return {
    key: `${year}-W${String(week).padStart(2, "0")}`,
    label: `S${String(week).padStart(2, "0")} ${year}`,
    date: monday.toISOString().slice(0, 10),
  };
}

function hasPowerTrend(points: Array<{ date: string; score: number }>, cadence: TrendCadence) {
  const minimumPeriods = cadence === "day" ? 90 : cadence === "week" ? 14 : cadence === "month" ? 4 : 2;
  const tail = points.slice(-minimumPeriods);
  if (tail.length < minimumPeriods) return false;
  const first = new Date(`${tail[0].date}T12:00:00`);
  const last = new Date(`${tail.at(-1)!.date}T12:00:00`);
  const threeMonthsLater = new Date(first);
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  if (last <= threeMonthsLater) return false;
  const deltas = tail.slice(1).map((point, index) => point.score - tail[index].score);
  const holdsPeakProduction = tail.every((point) => point.score >= 100);
  return deltas.every((delta) =>
    delta > -DEFAULT_TREND_CONFIGURATION.flatTolerance
    && delta < DEFAULT_TREND_CONFIGURATION.riseThreshold
  ) && (tail.at(-1)!.score - tail[0].score >= DEFAULT_TREND_CONFIGURATION.riseThreshold || holdsPeakProduction);
}

export type PeriodicTrendValue = {
  period: string;
  date: string;
  key: string;
  score: number;
  count?: number;
  people?: number;
};

export function getTrendSeriesFromValues(points: PeriodicTrendValue[], cadence: TrendCadence = "week") {
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map((point, index) => {
    const previous = sorted[index - 1];
    const throughCurrent = sorted.slice(0, index + 1);
    return {
      ...point,
      previousScore: previous?.score,
      delta: previous ? Math.round((point.score - previous.score) * 10) / 10 : undefined,
      trend: getTrend(point.score, previous?.score),
      condition: getConditionFromTrend(point.score, previous?.score, {
        hasPrevious: Boolean(previous),
        recentScores: throughCurrent.map((item) => item.score),
        sustainedPower: hasPowerTrend(throughCurrent, cadence),
      }),
    };
  });
}

export function getTrendSeries(evaluations: Evaluation[], cadence: TrendCadence = "week") {
  const groups = new Map<string, Evaluation[]>();
  getCollaboratorEvaluations(evaluations).forEach((item) => {
    const meta = cadenceMeta(item.date, cadence);
    groups.set(meta.key, [...(groups.get(meta.key) ?? []), item]);
  });
  const points = [...groups.values()]
    .map((items) => {
      const meta = cadenceMeta(items[0].date, cadence);
      return {
        period: meta.label,
        date: meta.date,
        key: meta.key,
        count: items.length,
        people: new Set(items.map(getEvaluationProfileKey)).size,
        score: Math.round(average(items.map(getEvaluationTrendScore)) * 10) / 10,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
  return getTrendSeriesFromValues(points, cadence);
}

export function getOverviewSeries(evaluations: Evaluation[], cadence: TrendCadence = "week") {
  return getTrendSeries(evaluations, cadence);
}

export function getLatestProfileTrendStates(evaluations: Evaluation[], cadence: TrendCadence = "week") {
  const groups = new Map<string, Evaluation[]>();
  getCollaboratorEvaluations(evaluations).forEach((evaluation) => {
    const key = getEvaluationProfileKey(evaluation);
    groups.set(key, [...(groups.get(key) ?? []), evaluation]);
  });
  return [...groups.entries()].flatMap(([profileId, history]) => {
    const latest = getTrendSeries(history, cadence).at(-1);
    return latest ? [{ profileId, ...latest }] : [];
  });
}

function evaluationsForProfile(evaluations: Evaluation[], profileIdOrName: string) {
  const hasProfileId = evaluations.some((item) => getEvaluationProfileKey(item) === profileIdOrName);
  return evaluations.filter((item) => hasProfileId
    ? getEvaluationProfileKey(item) === profileIdOrName
    : normalizeName(item.evaluatedPersonName) === normalizeName(profileIdOrName));
}

export function getIndividualTrendSeries(evaluations: Evaluation[], profileIdOrName: string, cadence: TrendCadence = "week") {
  const collaboratorEvaluations = getCollaboratorEvaluations(evaluations);
  const personEvaluations = evaluationsForProfile(collaboratorEvaluations, profileIdOrName);
  const scopes = new Set(personEvaluations.map((item) => `${item.businessUnitId}|${item.positionId}`));
  const peerSeries = getTrendSeries(collaboratorEvaluations.filter((item) => scopes.has(`${item.businessUnitId}|${item.positionId}`)), cadence);
  const peerByKey = new Map(peerSeries.map((point) => [point.key, point.score]));
  return getTrendSeries(personEvaluations, cadence).map((point) => ({
    ...point,
    positionAverage: peerByKey.get(point.key),
  }));
}

export function getIndividualSeries(evaluations: Evaluation[], profileIdOrName: string) {
  const collaboratorEvaluations = getCollaboratorEvaluations(evaluations);
  const personEvaluations = evaluationsForProfile(collaboratorEvaluations, profileIdOrName)
    .sort((a, b) => a.date.localeCompare(b.date));
  return personEvaluations.map((item) => {
    const peers = collaboratorEvaluations.filter((peer) =>
      peer.businessUnitId === item.businessUnitId
      && peer.positionId === item.positionId
      && getPeriodKey(peer) === getPeriodKey(item));
    return {
      period: getPeriodLabel(item),
      date: item.date,
      score: getEvaluationTrendScore(item),
      positionAverage: clampPercentage(average(peers.map((peer) => clampPercentage(peer.finalScore)))),
      status: item.status,
      condition: item.condition,
      trend: item.trend,
      observations: item.observations,
    };
  });
}

export function getEvaluationPointSeries(evaluations: Evaluation[]) {
  return [...getCollaboratorEvaluations(evaluations)]
    .sort((a, b) => a.date.localeCompare(b.date) || a.evaluatedPersonName.localeCompare(b.evaluatedPersonName, "es"))
    .map((item) => ({
      period: getPeriodLabel(item),
      date: item.date,
      score: getEvaluationTrendScore(item),
      status: item.status,
      condition: item.condition,
      trend: item.trend,
      evaluatedPersonName: item.evaluatedPersonName,
      positionName: item.positionName,
      observations: item.observations,
    }));
}

export function getUnitSummaries(units: BusinessUnit[], positions: Position[], evaluations: Evaluation[]) {
  return units.filter((unit) => unit.status === "active").map((unit) => {
    const unitEvaluations = getCollaboratorEvaluations(evaluations).filter((item) => item.businessUnitId === unit.id);
    const score = getBusinessUnitScore(unitEvaluations, unit.id);
    return {
      id: unit.id,
      name: unit.name,
      description: unit.description,
      positionCount: positions.filter((item) => item.businessUnitId === unit.id).length,
      evaluationCount: unitEvaluations.length,
      score,
      status: unitEvaluations.length ? getPerformanceStatus(score) : undefined,
    };
  });
}
