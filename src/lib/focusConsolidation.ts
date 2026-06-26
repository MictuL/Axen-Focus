import type {
  ConsolidatedFocusCondition,
  ConsolidatedFocusInput,
  FocusHierarchyRelationship,
  FocusRelationshipType,
  FocusTrendCondition,
  OperationSemaphore,
} from "../types";
import { calculateGeneralStatus, calculateTrendCondition, type FocusDailyPreviousEvaluation } from "./focusDaily";

export const FOCUS_RELATIONSHIP_TYPES: FocusRelationshipType[] = [
  "Reporta directamente a",
  "Apoya operativamente a",
  "Reporte compartido",
  "Responsable temporal",
  "Responsable secundario",
];

export interface FocusScoreSnapshot {
  profileId: string;
  businessUnitId: string;
  date: string;
  score: number;
  trendCondition: FocusTrendCondition;
  generalStatus: OperationSemaphore;
  source: "own_focus" | "consolidated_focus";
}

type ConsolidatedParams = {
  businessUnitId: string;
  date: string;
  availableConsolidatedResults?: ConsolidatedFocusCondition[];
  focusResults: FocusScoreSnapshot[];
  ownWeight?: number;
  previousConsolidatedResults?: Array<Pick<ConsolidatedFocusCondition, "date" | "consolidatedScore">>;
  relationships: FocusHierarchyRelationship[];
  userProfileId: string;
};

const roundScore = (value: number) => Math.round(value);
const activeOnDate = (relationship: FocusHierarchyRelationship, date?: string) => {
  if (relationship.status !== "active") return false;
  if (!date) return true;
  if (relationship.startDate && relationship.startDate > date) return false;
  if (relationship.endDate && relationship.endDate < date) return false;
  return true;
};

export function getActiveRelatedUsersReportingTo(targetProfileId: string, relationships: FocusHierarchyRelationship[], date?: string) {
  return relationships.filter((relationship) =>
    relationship.targetProfileId === targetProfileId
    && activeOnDate(relationship, date)
  );
}

export function preventDuplicateCounting(inputs: ConsolidatedFocusInput[]) {
  const unique = new Map<string, ConsolidatedFocusInput>();
  inputs.forEach((input) => {
    const existing = unique.get(input.sourceProfileId);
    if (!existing || input.weight > existing.weight || input.sourceType === "own_focus") {
      unique.set(input.sourceProfileId, input);
    }
  });
  return [...unique.values()];
}

export function getBestAvailableConditionScore(
  profileId: string,
  date: string,
  focusResults: FocusScoreSnapshot[],
  consolidatedResults: ConsolidatedFocusCondition[] = [],
) {
  const consolidated = consolidatedResults
    .filter((result) => result.userProfileId === profileId && result.date <= date)
    .sort((left, right) => right.date.localeCompare(left.date))[0];
  if (consolidated) {
    return {
      profileId,
      score: consolidated.consolidatedScore,
      trendCondition: consolidated.trendCondition,
      generalStatus: consolidated.generalStatus,
      source: "consolidated_focus" as const,
      date: consolidated.date,
    };
  }

  return focusResults
    .filter((result) => result.profileId === profileId && result.date <= date)
    .sort((left, right) => right.date.localeCompare(left.date))[0];
}

export function calculateConsolidatedFocusCondition({
  businessUnitId,
  date,
  availableConsolidatedResults = [],
  focusResults,
  ownWeight = 1,
  previousConsolidatedResults = [],
  relationships,
  userProfileId,
}: ConsolidatedParams): ConsolidatedFocusCondition {
  const inputs: ConsolidatedFocusInput[] = [];
  const ownFocus = getBestAvailableConditionScore(userProfileId, date, focusResults);
  if (ownFocus) {
    inputs.push({
      sourceProfileId: userProfileId,
      score: ownFocus.score,
      weight: Math.max(ownWeight, 0.01),
      sourceType: "own_focus",
      sourceCondition: ownFocus.trendCondition,
      sourceSemaphore: ownFocus.generalStatus,
    });
  }

  getActiveRelatedUsersReportingTo(userProfileId, relationships, date).forEach((relationship) => {
    const source = getBestAvailableConditionScore(relationship.sourceProfileId, date, focusResults, availableConsolidatedResults);
    if (!source) return;
    inputs.push({
      sourceProfileId: relationship.sourceProfileId,
      score: source.score,
      weight: Math.max(relationship.weight || 1, 0.01),
      sourceType: "related_condition",
      sourceCondition: source.trendCondition,
      sourceSemaphore: source.generalStatus,
      relationshipId: relationship.id,
    });
  });

  const inputsUsed = preventDuplicateCounting(inputs);
  const totalWeight = inputsUsed.reduce((sum, input) => sum + input.weight, 0);
  const consolidatedScore = totalWeight
    ? roundScore(inputsUsed.reduce((sum, input) => sum + (input.score * input.weight), 0) / totalWeight)
    : 0;
  const relatedInputs = inputsUsed.filter((input) => input.sourceType === "related_condition");
  const relatedWeight = relatedInputs.reduce((sum, input) => sum + input.weight, 0);
  const relatedScore = relatedWeight
    ? roundScore(relatedInputs.reduce((sum, input) => sum + (input.score * input.weight), 0) / relatedWeight)
    : undefined;
  const previousForTrend: FocusDailyPreviousEvaluation[] = previousConsolidatedResults
    .filter((result) => result.date < date)
    .map((result) => ({ date: result.date, weightedScore: result.consolidatedScore }));
  const trend = calculateTrendCondition(consolidatedScore, previousForTrend, inputsUsed.length);
  const now = new Date().toISOString();

  return {
    userProfileId,
    businessUnitId,
    date,
    ownFocusScore: ownFocus?.score,
    relatedScore,
    consolidatedScore,
    generalStatus: calculateGeneralStatus(consolidatedScore),
    trendCondition: trend.trendCondition,
    trendDeltaPP: trend.trendDeltaPP,
    previousConsolidatedScore: trend.previousWeightedScore,
    rollingAverageLast4: trend.rollingAverageLast4,
    rollingMinimumLast4: trend.rollingMinimumLast4,
    isPowerCondition: trend.isPowerCondition,
    source: "focus-consolidated",
    inputsUsed,
    createdAt: now,
    updatedAt: now,
  };
}

export function calculateBusinessUnitFocusCondition(
  unitId: string,
  directorProfileId: string,
  date: string,
  consolidatedResults: ConsolidatedFocusCondition[],
) {
  const directorCondition = consolidatedResults
    .filter((result) => result.businessUnitId === unitId && result.userProfileId === directorProfileId && result.date <= date)
    .sort((left, right) => right.date.localeCompare(left.date))[0];
  if (!directorCondition) {
    return {
      unitFocusScore: 0,
      unitFocusCondition: "Inexistencia" as FocusTrendCondition,
      generalStatus: "Rojo" as OperationSemaphore,
      sourceDirectorId: directorProfileId,
    };
  }

  return {
    unitFocusScore: directorCondition.consolidatedScore,
    unitFocusCondition: directorCondition.trendCondition,
    generalStatus: directorCondition.generalStatus,
    sourceDirectorId: directorProfileId,
  };
}

export function validateRelationshipConfiguration(
  relationship: Pick<FocusHierarchyRelationship, "businessUnitId" | "sourceProfileId" | "targetProfileId" | "weight" | "startDate" | "endDate" | "status"> & { id?: string },
  existingRelationships: FocusHierarchyRelationship[] = [],
) {
  const errors: string[] = [];
  if (!relationship.businessUnitId) errors.push("Selecciona una unidad de negocio.");
  if (!relationship.sourceProfileId) errors.push("Selecciona el colaborador origen.");
  if (!relationship.targetProfileId) errors.push("Selecciona el responsable destino.");
  if (relationship.sourceProfileId && relationship.sourceProfileId === relationship.targetProfileId) errors.push("Un perfil no puede reportarse a sí mismo.");
  if (!Number.isFinite(relationship.weight) || relationship.weight <= 0) errors.push("El peso debe ser mayor a cero.");
  if (!relationship.startDate) errors.push("Define fecha de inicio.");
  if (relationship.endDate && relationship.startDate && relationship.endDate < relationship.startDate) errors.push("La fecha de fin no puede ser anterior al inicio.");
  const duplicate = existingRelationships.find((item) =>
    item.id !== relationship.id
    && item.status === "active"
    && relationship.status === "active"
    && item.businessUnitId === relationship.businessUnitId
    && item.sourceProfileId === relationship.sourceProfileId
    && item.targetProfileId === relationship.targetProfileId
  );
  if (duplicate) errors.push("Ya existe una conexión activa entre esos perfiles.");
  return errors;
}
