import type { CollaboratorProfile, Evaluation, FocusHierarchyRelationship, FocusTrendCondition, OperationSemaphore, Position } from "../types";
import { getEvaluationProfileKey } from "./evaluation";
import { calculateGeneralStatus, calculateTrendCondition } from "./focusDaily";

export interface FundacionHierarchyPoint {
  date: string;
  score: number;
  condition: FocusTrendCondition;
}

export interface FundacionHierarchyNode {
  profile: CollaboratorProfile;
  position?: Position;
  ownFocusScore?: number;
  ownFocusCondition?: FocusTrendCondition;
  ownFocusSemaphore?: OperationSemaphore;
  ownHistory: FundacionHierarchyPoint[];
  consolidatedScore: number;
  consolidatedCondition: FocusTrendCondition;
  consolidatedSemaphore: OperationSemaphore;
  history: FundacionHierarchyPoint[];
  children: FundacionHierarchyNode[];
  ready: boolean;
}

export interface FundacionUnitFocusSummary {
  score: number;
  condition: FocusTrendCondition;
  semaphore: OperationSemaphore;
  history: FundacionHierarchyPoint[];
  ready: boolean;
  sourceCount: number;
  missingDirectorFocus: boolean;
}

function average(values: number[]) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

function getFocusScore(evaluation: Evaluation) {
  const score = evaluation.focusDaily?.weightedScore ?? evaluation.finalScore;
  return Number.isFinite(score) ? Math.round(score) : 0;
}

function focusHistoryByProfile(evaluations: Evaluation[], businessUnitId: string) {
  const grouped = new Map<string, Evaluation[]>();
  evaluations
    .filter((evaluation) => evaluation.businessUnitId === businessUnitId && evaluation.subjectType !== "unit")
    .forEach((evaluation) => {
      const profileId = getEvaluationProfileKey(evaluation);
      grouped.set(profileId, [...(grouped.get(profileId) ?? []), evaluation]);
    });

  return new Map([...grouped.entries()].map(([profileId, profileEvaluations]) => [
    profileId,
    profileEvaluations
      .sort((left, right) => left.date.localeCompare(right.date) || left.id.localeCompare(right.id))
      .map((evaluation) => ({
        date: evaluation.date,
        score: getFocusScore(evaluation),
        condition: evaluation.focusDaily?.trendCondition ?? evaluation.condition ?? "Sin histórico suficiente",
      })),
  ]));
}

function latestAt(history: FundacionHierarchyPoint[], date: string) {
  return history.filter((point) => point.date <= date).at(-1);
}

function consolidateChildHistory(children: FundacionHierarchyNode[]) {
  const dates = [...new Set(children.flatMap((child) => child.history.map((point) => point.date)))].sort();
  const consolidated: FundacionHierarchyPoint[] = [];

  dates.forEach((date) => {
    const latestChildPoints = children
      .map((child) => latestAt(child.history, date))
      .filter((point): point is FundacionHierarchyPoint => Boolean(point));
    if (!latestChildPoints.length) return;

    const score = average(latestChildPoints.map((point) => point.score));
    const trend = calculateTrendCondition(
      score,
      consolidated.map((point) => ({ date: point.date, weightedScore: point.score })),
      latestChildPoints.length,
    );
    const condition = latestChildPoints.length === 1 && trend.trendCondition === "Sin histórico suficiente"
      ? latestChildPoints[0].condition
      : trend.trendCondition;

    consolidated.push({ date, score, condition });
  });

  return consolidated;
}

function combinePointHistories(histories: FundacionHierarchyPoint[], ownHistory: FundacionHierarchyPoint[], requireOwnFocus: boolean) {
  const dates = [...new Set([...histories, ...ownHistory].map((point) => point.date))].sort();
  const combined: FundacionHierarchyPoint[] = [];

  dates.forEach((date) => {
    const directorPoint = latestAt(histories, date);
    const ownPoint = latestAt(ownHistory, date);
    if (requireOwnFocus && (!directorPoint || !ownPoint)) return;
    const points = [directorPoint, ownPoint].filter((point): point is FundacionHierarchyPoint => Boolean(point));
    if (!points.length) return;
    const score = average(points.map((point) => point.score));
    const trend = calculateTrendCondition(
      score,
      combined.map((point) => ({ date: point.date, weightedScore: point.score })),
      points.length,
    );
    combined.push({ date, score, condition: trend.trendCondition });
  });

  return combined;
}

export function deriveUnitFocusFromDirectorHierarchy(director?: FundacionHierarchyNode): FundacionUnitFocusSummary {
  if (!director) {
    return {
      score: 0,
      condition: "Inexistencia",
      semaphore: "Rojo",
      history: [],
      ready: false,
      sourceCount: 0,
      missingDirectorFocus: true,
    };
  }

  const hasReportChain = director.children.length > 0;
  const history = hasReportChain
    ? combinePointHistories(director.history, director.ownHistory, true)
    : director.ownHistory;
  const latest = history.at(-1);
  const missingDirectorFocus = hasReportChain && director.ownHistory.length === 0;

  return {
    score: latest?.score ?? 0,
    condition: latest?.condition ?? "Inexistencia",
    semaphore: calculateGeneralStatus(latest?.score ?? 0),
    history,
    ready: Boolean(latest) && !missingDirectorFocus,
    sourceCount: hasReportChain ? 2 : director.ownHistory.length ? 1 : 0,
    missingDirectorFocus,
  };
}

export function getDirectReports(profileId: string, relationships: FocusHierarchyRelationship[], date?: string) {
  return relationships.filter((relationship) => {
    if (relationship.targetProfileId !== profileId || relationship.status !== "active") return false;
    if (date && relationship.startDate && relationship.startDate > date) return false;
    if (date && relationship.endDate && relationship.endDate < date) return false;
    return true;
  });
}

export function buildFundacionHierarchy({
  businessUnitId,
  evaluations,
  positions,
  profiles,
  relationships,
  rootProfileId,
}: {
  businessUnitId: string;
  evaluations: Evaluation[];
  positions: Position[];
  profiles: CollaboratorProfile[];
  relationships: FocusHierarchyRelationship[];
  rootProfileId: string;
}): FundacionHierarchyNode | undefined {
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const positionById = new Map(positions.map((position) => [position.id, position]));
  const historyByProfile = focusHistoryByProfile(evaluations, businessUnitId);
  const today = new Date().toISOString().slice(0, 10);

  function build(profileId: string, stack = new Set<string>()): FundacionHierarchyNode | undefined {
    if (stack.has(profileId)) return undefined;
    const profile = profileById.get(profileId);
    if (!profile) return undefined;
    const nextStack = new Set(stack).add(profileId);
    const ownHistory = historyByProfile.get(profileId) ?? [];
    const own = ownHistory.at(-1);
    const childNodes = getDirectReports(profileId, relationships, today)
      .map((relationship) => build(relationship.sourceProfileId, nextStack))
      .filter((item): item is FundacionHierarchyNode => Boolean(item));
    const readyChildren = childNodes.filter((child) => child.ready);
    const ownFocusScore = own?.score;
    const ownFocusCondition = own?.condition;
    const ownFocusSemaphore = typeof ownFocusScore === "number" ? calculateGeneralStatus(ownFocusScore) : undefined;
    const hasChildren = childNodes.length > 0;
    const history = hasChildren ? consolidateChildHistory(readyChildren) : ownHistory;
    const latest = history.at(-1);
    const consolidatedScore = latest?.score ?? 0;
    const trend = calculateTrendCondition(consolidatedScore, [], latest ? 1 : 0);
    return {
      profile,
      position: positionById.get(profile.positionId),
      ownFocusScore,
      ownFocusCondition,
      ownFocusSemaphore,
      ownHistory,
      consolidatedScore,
      consolidatedCondition: latest?.condition ?? ownFocusCondition ?? trend.trendCondition,
      consolidatedSemaphore: calculateGeneralStatus(consolidatedScore),
      history,
      children: childNodes,
      ready: history.length > 0,
    };
  }

  return build(rootProfileId);
}

export function flattenFundacionHierarchy(root?: FundacionHierarchyNode): FundacionHierarchyNode[] {
  if (!root) return [];
  return [root, ...root.children.flatMap(flattenFundacionHierarchy)];
}
