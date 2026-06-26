import type { Evaluation, OperationalCondition, OperationalLevel, Position, TrendCadence, UnitConditionReview } from "../types";
import { getOperationalLevel } from "./catalog";
import { getTrendSeries, getTrendSeriesFromValues, type PeriodicTrendValue } from "./analytics";
import { average, clampPercentage, getEvaluationProfileKey, getLatestCollaboratorEvaluations } from "./evaluation";

export type LeadershipLevel = "Supervisión" | "Planeación";

export interface LeadershipResult {
  position: Position;
  level: LeadershipLevel;
  sourceLevel: OperationalLevel;
  score: number;
  condition: OperationalCondition;
  ready: boolean;
  sourceCount: number;
  evaluationIds: string[];
  sourceReviewIds: string[];
  review?: UnitConditionReview;
  reviewCurrent: boolean;
  scopeLabel: string;
}

export interface OperationalHierarchy {
  execution: {
    evaluations: Evaluation[];
    score: number;
    condition: OperationalCondition;
    ready: boolean;
    positionCount: number;
    peopleCount: number;
  };
  supervision: LeadershipResult[];
  planning: LeadershipResult[];
  unit: {
    score: number;
    condition: OperationalCondition;
    ready: boolean;
    pendingPlanningActions: number;
  };
}

function sameIds(left: string[], right: string[]) {
  const a = [...new Set(left)].sort();
  const b = [...new Set(right)].sort();
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function latestReview(
  reviews: UnitConditionReview[],
  businessUnitId: string,
  level: LeadershipLevel,
  positionId: string,
) {
  return reviews
    .filter((review) => review.businessUnitId === businessUnitId
      && review.operationalLevel === level
      && review.positionId === positionId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

function scopedByArea<T>(
  sources: T[],
  sourceArea: (source: T) => string,
  position: Position,
) {
  const sameArea = sources.filter((source) => sourceArea(source) === position.area);
  return sameArea.length ? sameArea : sources;
}

function derivedCondition(history: Evaluation[]): OperationalCondition {
  return getTrendSeries(history, "week").at(-1)?.condition ?? "Inexistencia";
}

function combineTrendSeries(
  series: ReturnType<typeof getTrendSeries>[],
  cadence: TrendCadence,
) {
  const groups = new Map<string, PeriodicTrendValue[]>();
  series.forEach((points) => points.forEach((point) => {
    groups.set(point.key, [...(groups.get(point.key) ?? []), point]);
  }));
  const combined = [...groups.values()].map((points) => ({
    key: points[0].key,
    period: points[0].period,
    date: points[0].date,
    score: Math.round(average(points.map((point) => point.score)) * 10) / 10,
    count: points.reduce((sum, point) => sum + (point.count ?? 0), 0),
    people: points.reduce((sum, point) => sum + (point.people ?? 0), 0),
  }));
  return getTrendSeriesFromValues(combined, cadence);
}

function hierarchyContext(evaluations: Evaluation[], positions: Position[], businessUnitId: string) {
  const unitPositions = positions.filter((position) => position.businessUnitId === businessUnitId && position.status === "active");
  const positionById = new Map(unitPositions.map((position) => [position.id, position]));
  const executionHistory = evaluations.filter((evaluation) =>
    evaluation.businessUnitId === businessUnitId
    && evaluation.subjectType !== "unit"
    && getOperationalLevel(positionById.get(evaluation.positionId)?.name ?? evaluation.positionName) === "Ejecución"
  );
  return {
    unitPositions,
    positionById,
    executionHistory,
    managers: unitPositions.filter((position) => getOperationalLevel(position) === "Supervisión"),
    directors: unitPositions.filter((position) => getOperationalLevel(position) === "Planeación"),
  };
}

export function getOperationalTrendSeries(
  evaluations: Evaluation[],
  positions: Position[],
  businessUnitId: string,
  target: { level: "UDN" | LeadershipLevel; positionId?: string },
  cadence: TrendCadence = "week",
) {
  const context = hierarchyContext(evaluations, positions, businessUnitId);
  const managerSeries = new Map(context.managers.map((manager) => {
    const history = scopedByArea(
      context.executionHistory,
      (evaluation) => context.positionById.get(evaluation.positionId)?.area ?? evaluation.area,
      manager,
    );
    return [manager.id, getTrendSeries(history, cadence)] as const;
  }));
  if (target.level === "Supervisión") {
    if (target.positionId) return managerSeries.get(target.positionId) ?? [];
    return combineTrendSeries([...managerSeries.values()], cadence);
  }

  const directorSeries = new Map(context.directors.map((director) => {
    const scopedManagers = scopedByArea(context.managers, (manager) => manager.area, director);
    const sources = scopedManagers.length
      ? scopedManagers.map((manager) => managerSeries.get(manager.id) ?? [])
      : [getTrendSeries(scopedByArea(
        context.executionHistory,
        (evaluation) => context.positionById.get(evaluation.positionId)?.area ?? evaluation.area,
        director,
      ), cadence)];
    return [director.id, combineTrendSeries(sources, cadence)] as const;
  }));
  if (target.level === "Planeación") {
    if (target.positionId) return directorSeries.get(target.positionId) ?? [];
    return combineTrendSeries([...directorSeries.values()], cadence);
  }
  return combineTrendSeries([...directorSeries.values()], cadence);
}

export function getOperationalHierarchy(
  evaluations: Evaluation[],
  positions: Position[],
  reviews: UnitConditionReview[],
  businessUnitId: string,
  historyEvaluations: Evaluation[] = evaluations,
): OperationalHierarchy {
  const { positionById, executionHistory, managers, directors } = hierarchyContext(evaluations, positions, businessUnitId);
  const fullHistory = hierarchyContext(historyEvaluations, positions, businessUnitId).executionHistory;
  const executionEvaluations = getLatestCollaboratorEvaluations(executionHistory, businessUnitId)
    .filter((evaluation) => getOperationalLevel(positionById.get(evaluation.positionId)?.name ?? evaluation.positionName) === "Ejecución");
  const executionScore = clampPercentage(average(executionEvaluations.map((evaluation) => evaluation.finalScore)));
  const executionReady = executionEvaluations.length > 0;

  const supervision = managers.map((position): LeadershipResult => {
    const sources = scopedByArea(
      executionEvaluations,
      (evaluation) => positionById.get(evaluation.positionId)?.area ?? evaluation.area,
      position,
    );
    const sourceHistory = scopedByArea(
      fullHistory,
      (evaluation) => positionById.get(evaluation.positionId)?.area ?? evaluation.area,
      position,
    );
    const evaluationIds = sources.map((evaluation) => evaluation.id);
    const score = clampPercentage(average(sources.map((evaluation) => evaluation.finalScore)));
    const review = latestReview(reviews, businessUnitId, "Supervisión", position.id);
    const reviewCurrent = Boolean(review && sameIds(review.evaluationIds, evaluationIds));
    return {
      position,
      level: "Supervisión",
      sourceLevel: "Ejecución",
      score,
      condition: derivedCondition(sourceHistory),
      ready: sources.length > 0,
      sourceCount: sources.length,
      evaluationIds,
      sourceReviewIds: [],
      review,
      reviewCurrent,
      scopeLabel: sources.length && sources.length !== executionEvaluations.length ? position.area : "Toda la ejecución",
    };
  });

  const planning = directors.map((position): LeadershipResult => {
    const scopedManagers = scopedByArea(supervision, (manager) => manager.position.area, position);
    const usesSupervision = scopedManagers.length > 0;
    const fallbackExecution = scopedByArea(
      executionEvaluations,
      (evaluation) => positionById.get(evaluation.positionId)?.area ?? evaluation.area,
      position,
    );
    const ready = usesSupervision
      ? scopedManagers.every((manager) => manager.ready)
      : fallbackExecution.length > 0;
    const scoreSources = usesSupervision ? scopedManagers.map((manager) => manager.score) : fallbackExecution.map((evaluation) => evaluation.finalScore);
    const evaluationIds = usesSupervision
      ? scopedManagers.flatMap((manager) => manager.evaluationIds)
      : fallbackExecution.map((evaluation) => evaluation.id);
    const sourceReviewIds = scopedManagers.flatMap((manager) => manager.reviewCurrent && manager.review ? [manager.review.id] : []);
    const score = ready ? clampPercentage(average(scoreSources)) : 0;
    const review = latestReview(reviews, businessUnitId, "Planeación", position.id);
    const reviewCurrent = Boolean(review
      && sameIds(review.evaluationIds, evaluationIds)
      && sameIds(review.sourceReviewIds, sourceReviewIds));
    return {
      position,
      level: "Planeación",
      sourceLevel: usesSupervision ? "Supervisión" : "Ejecución",
      score,
      condition: getOperationalTrendSeries(historyEvaluations, positions, businessUnitId, {
        level: "Planeación",
        positionId: position.id,
      }).at(-1)?.condition ?? "Inexistencia",
      ready,
      sourceCount: usesSupervision ? scopedManagers.length : fallbackExecution.length,
      evaluationIds,
      sourceReviewIds,
      review,
      reviewCurrent,
      scopeLabel: usesSupervision
        ? scopedManagers.length === supervision.length ? "Toda la supervisión" : position.area
        : fallbackExecution.length === executionEvaluations.length ? "Ejecución directa" : position.area,
    };
  });

  const planningReady = planning.length > 0 && planning.every((result) => result.ready);
  const unitScore = planningReady ? clampPercentage(average(planning.map((result) => result.score))) : 0;
  const executionCondition = derivedCondition(fullHistory);
  const unitCondition = getOperationalTrendSeries(historyEvaluations, positions, businessUnitId, { level: "UDN" }).at(-1)?.condition ?? "Inexistencia";

  return {
    execution: {
      evaluations: executionEvaluations,
      score: executionScore,
      condition: executionCondition,
      ready: executionReady,
      positionCount: new Set(executionEvaluations.map((evaluation) => evaluation.positionId)).size,
      peopleCount: new Set(executionEvaluations.map(getEvaluationProfileKey)).size,
    },
    supervision,
    planning,
    unit: {
      score: unitScore,
      condition: unitCondition,
      ready: planningReady,
      pendingPlanningActions: planning.filter((result) => result.ready && !result.reviewCurrent).length,
    },
  };
}
