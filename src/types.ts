export type PerformanceStatus = "Excelente" | "Bueno" | "En observación" | "Riesgo" | "Crítico";
export type Trend = "Mejora" | "Estable" | "Baja" | "Sin histórico";
export type CaptureSource = "Físico" | "Digital";
export type EvaluationSubjectType = "unit" | "collaborator";
export type OperationalCondition = "Inexistencia" | "Peligro" | "Emergencia" | "Normal" | "Afluencia" | "Poder";
export type EvaluationMeasurementMode = "numeric" | "scale-1-5" | "percentage" | "traffic-light" | "compliance";
export type TrendCadence = "day" | "week" | "month" | "year";
export type OperationalLevel = "Planeación" | "Supervisión" | "Ejecución";
export type CatalogStatus = "active" | "inactive";
export type DocumentType = "evaluation" | "operation";
export type DocumentStatus = "printed" | "digital" | "printed-digital";
export type OperationSemaphore = "Verde" | "Amarillo" | "Rojo" | "Azul";
export type FocusCondition = "Inexistencia" | "Peligro" | "Emergencia" | "Normal" | "Afluencia" | "Poder";
export type FocusTrendCondition = FocusCondition | "Sin histórico suficiente";
export type FocusValidationStatus = "Pendiente" | "Aprobado" | "Requiere ajuste";
export type PlatformRole = "Colaborador" | "Gerente" | "Coordinador" | "Director de Unidad" | "Administrador";
export type MetricSource = "focus-daily" | "position-indicators";
export type IndicatorMeasurementKind = "rep-compliance" | "goal-target" | "unit-indicator" | "quantity";
export type IndicatorValueKind = "percentage" | "quantity";
export type GoalCadence = "week" | "month" | "year";
export type IndicatorProgressStatus = "No Cumplió" | "Medio Cumplió" | "Cumplió";
export type IndicatorStatusColor = "red" | "orange" | "yellow" | "green";
export type IndicatorConditionColor = IndicatorStatusColor | "blue";
export type FocusRelationshipType =
  | "Reporta directamente a"
  | "Apoya operativamente a"
  | "Reporte compartido"
  | "Responsable temporal"
  | "Responsable secundario";
export type RelationshipStatus = "active" | "inactive";

export interface FocusHierarchyRelationship {
  id: string;
  businessUnitId: string;
  sourceProfileId: string;
  targetProfileId: string;
  relationshipType: FocusRelationshipType;
  weight: number;
  startDate: string;
  endDate?: string;
  status: RelationshipStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsolidatedFocusInput {
  sourceProfileId: string;
  sourceName?: string;
  score: number;
  weight: number;
  sourceType: "own_focus" | "related_condition";
  sourceCondition?: FocusTrendCondition;
  sourceSemaphore?: OperationSemaphore;
  relationshipId?: string;
}

export interface ConsolidatedFocusCondition {
  id?: string;
  userProfileId: string;
  businessUnitId: string;
  date: string;
  ownFocusScore?: number;
  relatedScore?: number;
  consolidatedScore: number;
  generalStatus: OperationSemaphore;
  trendCondition: FocusTrendCondition;
  trendDeltaPP?: number;
  previousConsolidatedScore?: number;
  rollingAverageLast4?: number;
  rollingMinimumLast4?: number;
  isPowerCondition: boolean;
  source: "focus-consolidated";
  inputsUsed: ConsolidatedFocusInput[];
  createdAt: string;
  updatedAt: string;
}

export interface PositionIndicatorActivation {
  id: string;
  businessUnitId: string;
  collaboratorProfileId: string;
  positionId: string;
  enabled: boolean;
  evaluatorRole: PlatformRole;
  createdAt: string;
  updatedAt: string;
}

export type OperationalGoalScope = "unit" | "profile";

export interface OperationalGoalAssignment {
  id: string;
  businessUnitId: string;
  sourceProfileId: string;
  targetProfileId?: string;
  scope: OperationalGoalScope;
  metricSource: MetricSource;
  cadence?: GoalCadence;
  periodStartDate?: string;
  periodEndDate?: string;
  parentGoalId?: string;
  unitIndicatorId?: string;
  unitIndicatorName?: string;
  valueKind?: IndicatorValueKind;
  allocationPercent?: number;
  sourceTargetValue?: number;
  targetValue: number;
  goalLabel: string;
  notes: string;
  revision?: number;
  effectiveDate: string;
  status: CatalogStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FocusDailyGoalSnapshot {
  id: string;
  label: string;
  targetValue?: number;
  effectiveDate?: string;
  metricSource?: MetricSource;
  cadence?: GoalCadence;
  periodStartDate?: string;
  periodEndDate?: string;
  unitIndicatorId?: string;
  unitIndicatorName?: string;
  valueKind?: IndicatorValueKind;
}

export interface FocusDailyGoalScore extends FocusDailyGoalSnapshot {
  activityCount: number;
  score: number;
}

export interface WeeklyPositionIndicatorResult {
  indicatorId: string;
  indicatorName: string;
  measurementKind?: IndicatorMeasurementKind;
  valueKind?: IndicatorValueKind;
  actualValue?: number;
  targetValue?: number;
  goalAssignmentId?: string;
  goalLabel?: string;
  goalEffectiveDate?: string;
  goalCadence?: GoalCadence;
  goalUnitIndicatorName?: string;
  result: IndicatorProgressStatus;
  score: number;
  observations: string;
  evidenceUrl?: string;
  semaphore: OperationSemaphore;
  statusColor?: IndicatorStatusColor;
}

export interface WeeklyPositionIndicatorEvaluation {
  id: string;
  businessUnitId: string;
  collaboratorProfileId: string;
  evaluatorName: string;
  positionId: string;
  goalAssignmentId?: string;
  goalLabel?: string;
  goalTargetValue?: number;
  goalEffectiveDate?: string;
  week: string;
  weekStartDate: string;
  weekEndDate: string;
  indicators: WeeklyPositionIndicatorResult[];
  weightedScore: number;
  weeklyCondition: FocusTrendCondition;
  weeklyConditionColor?: IndicatorConditionColor;
  weeklyConditionDescription?: string;
  source: "position-indicators";
  createdAt: string;
  updatedAt: string;
}

export interface FocusConfiguration {
  riseThreshold: number;
  fallThreshold: number;
  flatTolerance: number;
  prolongedFlatPeriods: number;
  minimumWeeklyEntries: number;
  powerMinimumWeeks: number;
  powerMinimumMonths: number;
}

export interface FocusConditionFormula {
  condition: FocusCondition;
  steps: string[];
  active: boolean;
  updatedAt: string;
}

export interface FocusSettings {
  configuration: FocusConfiguration;
  formulas: FocusConditionFormula[];
}

export interface BusinessUnit {
  id: string;
  name: string;
  description: string;
  status: CatalogStatus;
  createdAt: string;
  responsible: string;
  observations: string;
}

export interface Kpi {
  name: string;
  description: string;
  measurementKind?: IndicatorMeasurementKind;
  sourceNote?: string;
}

export interface ChecklistItem {
  indicator: string;
  aspect: string;
  evidence: string;
}

export type ChecklistEvaluationStatus = "" | "Cumple" | "Cumple parcialmente" | "No cumple";

export interface ChecklistEvaluationResult extends ChecklistItem {
  status: ChecklistEvaluationStatus;
  notes: string;
}

export interface PhysicalChecklistFormat {
  id: string;
  businessUnitId: string;
  code: string;
  title: string;
  frequency: string;
  evaluator: string;
  appliesTo: string[];
  repInstruction: string;
  fields: string[];
  checklist: ChecklistItem[];
  statusOptions?: string[];
}

export interface OperationFormatItem {
  keyArea: string;
  format: string;
  guideDocument?: OperationGuideDocument;
  template?: OperationTemplate;
}

export interface OperationGuideRow {
  label: string;
  value: string;
}

export interface OperationGuideSection {
  title: string;
  rows?: OperationGuideRow[];
  notes?: string[];
}

export interface OperationGuideDocument {
  title: string;
  subtitle?: string;
  objective: string;
  recommendedUse: string;
  sections: OperationGuideSection[];
}

export interface OperationTemplateTable {
  title: string;
  columns: string[];
  rowLabels?: string[];
  blankRows?: number;
}

export interface OperationTemplate {
  title: string;
  subtitle: string;
  sourceFile: string;
  frequency?: string;
  purpose?: string;
  objective?: string;
  description?: string;
  rep?: string;
  measurementRule?: string;
  scoreSource?: "focus-daily";
  fields: string[];
  summaryFields?: string[];
  questions?: string[];
  tables: OperationTemplateTable[];
}

export interface OperationFormatSet {
  id: string;
  businessUnitId: string;
  positionId?: string;
  positionName: string;
  area?: string;
  formats: OperationFormatItem[];
}

export interface Position {
  id: string;
  businessUnitId: string;
  area: string;
  name: string;
  rep: string;
  kpis: Kpi[];
  unitIndicatorLinks?: string[];
  definitionSource?: string;
  physicalFormatIds?: string[];
  suggestedFrequency: string;
  suggestedEvidence: string;
  suggestedEvaluator: string;
  status: CatalogStatus;
  isEvaluable: boolean;
}

export interface CollaboratorProfile {
  id: string;
  businessUnitId: string;
  positionId: string;
  name: string;
  photoUrl?: string;
  status: CatalogStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationKpi extends Kpi {
  score: number;
}

export interface EvaluationStatisticDraft extends Kpi {
  measurementUnit: string;
  measurementMode?: EvaluationMeasurementMode;
  goalAssignmentId?: string;
  goalLabel?: string;
  goalTargetValue?: number;
  goalMetricSource?: MetricSource;
  goalEffectiveDate?: string;
  goalCadence?: GoalCadence;
  goalPeriodStartDate?: string;
  goalPeriodEndDate?: string;
  goalUnitIndicatorId?: string;
  goalUnitIndicatorName?: string;
  goalValueKind?: IndicatorValueKind;
  activityStatus?: string;
  activityPriority?: string;
  deadline?: string;
  activitySemaphore?: OperationSemaphore;
  internalPriorityWeight?: number;
  internalWeightedValue?: number;
  currentSelection?: string;
  previousSelection?: string;
  targetSelection?: string;
  previousValue: number;
  currentValue: number;
  targetValue: number;
}

export interface EvaluationStatistic extends EvaluationStatisticDraft {
  variation: number;
  variationPercentage: number;
  targetAttainment: number;
  performanceIndex?: number;
  condition: OperationalCondition;
}

export interface Evaluation {
  id: string;
  collaboratorProfileId?: string;
  documentFolio?: string;
  methodVersion?: "condition-v1" | "flexible-v2" | "condition-scale-v3" | "trend-v4" | "focus-daily-v5";
  subjectType?: EvaluationSubjectType;
  businessUnitId: string;
  area: string;
  positionId: string;
  positionName: string;
  rep: string;
  evaluatedPersonName: string;
  evaluatorName: string;
  date: string;
  period: string;
  week: string;
  month: string;
  season: string;
  evaluatedActivity: string;
  captureSource: CaptureSource;
  physicalFormatId?: string;
  physicalFormatCode?: string;
  physicalFormatTitle?: string;
  checklistResults?: ChecklistEvaluationResult[];
  kpis: EvaluationKpi[];
  generalComplianceScore: number;
  evidenceIncidentScore: number;
  observations: string;
  incidents: string;
  improvementAction: string;
  followUpDate: string;
  productDefinition?: string;
  statistics?: EvaluationStatistic[];
  condition?: OperationalCondition;
  conditionFormula?: string[];
  problemStatement?: string;
  dataAnalysis?: string;
  solutionPlan?: string;
  nextTarget?: number;
  finalScore: number;
  performanceIndex?: number;
  focusDaily?: FocusDailyEvaluationMetrics;
  status: PerformanceStatus;
  trend: Trend;
  digitalCaptureDate: string;
}

export interface FocusDailyEvaluationMetrics {
  totalActivities: number;
  completedActivities: number;
  inProgressActivities: number;
  pendingActivities: number;
  blockedActivities: number;
  weightedScore: number;
  goalCount?: number;
  goalBreakdown?: FocusDailyGoalScore[];
  generalStatus: OperationSemaphore;
  trendCondition: FocusTrendCondition;
  trendDeltaPP?: number;
  previousWeightedScore?: number;
  rollingAverageLast4?: number;
  rollingMinimumLast4?: number;
  isPowerCondition: boolean;
  peakStreakCount?: number;
  isPeakRecoveryPower?: boolean;
  updatedAt: string;
}

export interface EvaluationDraft {
  collaboratorProfileId?: string;
  documentFolio?: string;
  subjectType: EvaluationSubjectType;
  businessUnitId: string;
  area: string;
  positionId: string;
  evaluatedPersonName: string;
  evaluatorName: string;
  date: string;
  period: string;
  week: string;
  month: string;
  season: string;
  captureSource: CaptureSource;
  physicalFormatId?: string;
  physicalFormatCode?: string;
  physicalFormatTitle?: string;
  productDefinition: string;
  focusGoalTargets?: FocusDailyGoalSnapshot[];
  statistics: EvaluationStatisticDraft[];
  problemStatement: string;
  dataAnalysis: string;
  solutionPlan: string;
  nextTarget: number;
  observations: string;
  followUpDate: string;
}

export interface UnitConditionReview {
  id: string;
  businessUnitId: string;
  operationalLevel: "Supervisión" | "Planeación";
  positionId: string;
  positionName: string;
  sourceLevel: OperationalLevel;
  score: number;
  condition: OperationalCondition;
  evaluationIds: string[];
  sourceReviewIds: string[];
  reviewerName: string;
  date: string;
  period: string;
  finalComments: string;
  detectedCauses: string;
  actionPlan: string;
  followUpDate: string;
  createdAt: string;
}

export type UnitConditionReviewDraft = Omit<UnitConditionReview, "id" | "createdAt">;

export interface DocumentRecord {
  folio: string;
  type: DocumentType;
  status: DocumentStatus;
  businessUnitId: string;
  businessUnitName: string;
  positionId?: string;
  positionName?: string;
  formatId?: string;
  formatCode?: string;
  formatTitle: string;
  createdAt: string;
  updatedAt: string;
  printedAt?: string;
  digitalCapturedAt?: string;
  linkedEvaluationId?: string;
  values?: Record<string, string>;
  score?: number;
  semaphore?: OperationSemaphore;
  focusPreliminaryCondition?: FocusCondition;
  focusTrendCondition?: FocusTrendCondition;
  focusTrendDeltaPP?: number;
  focusPreviousWeightedScore?: number;
  focusRollingAverageLast4?: number;
  focusRollingMinimumLast4?: number;
  focusIsPowerCondition?: boolean;
  focusPeakStreakCount?: number;
  focusIsPeakRecoveryPower?: boolean;
  focusValidationStatus?: FocusValidationStatus;
  focusValidationComment?: string;
  focusValidatedAt?: string;
}

export type DocumentRecordInput = Omit<DocumentRecord, "createdAt" | "updatedAt" | "folio"> & {
  folio?: string;
};

export interface PerformanceAlert {
  id: string;
  evaluationId?: string;
  businessUnitId: string;
  positionId?: string;
  evaluatedPersonName?: string;
  alertType:
    | "low-score"
    | "decline"
    | "risk-streak"
    | "low-kpi"
    | "repeated-incidence"
    | "missing-recent"
    | "low-position"
    | "low-unit"
    | "missing-rep"
    | "missing-kpis";
  severity: "critical" | "warning" | "notice";
  message: string;
  status: "active" | "resolved";
  createdAt: string;
  dueDate: string;
}
