import type { DocumentRecord, FocusCondition, FocusConfiguration, FocusConditionFormula, FocusDailyGoalScore, FocusDailyGoalSnapshot, FocusSettings, FocusTrendCondition, MetricSource, OperationSemaphore } from "../types";

export const FOCUS_DAILY_TABLE_TITLE = "Actividades del día";
export const FOCUS_DAILY_MEASUREMENT_RULE = "El cumplimiento diario se calcula automáticamente con el avance y la prioridad de cada actividad.";
export const FOCUS_DAILY_PRIORITIES = ["Importante – urgente", "Importante – no urgente", "No importante – urgente", "No importante – no urgente"] as const;
export const FOCUS_DAILY_STATUSES = ["No iniciado", "En proceso", "Completado"] as const;
export const FOCUS_DAILY_ROW_COUNT_KEY = "focusDaily::rowCount";
export const FOCUS_DAILY_MIN_ROWS = 1;
export const FOCUS_DAILY_MAX_ROWS = 20;
export const FOCUS_DAILY_COLUMNS = ["#", "Actividad", "Estado", "Prioridad", "Deadline", "Semáforo", "Avance %", "Motivo / avance"] as const;
export const FOCUS_DAILY_COLUMN_INDEX = {
  rowNumber: 0,
  activity: 1,
  status: 2,
  priority: 3,
  deadline: 4,
  semaphore: 5,
  progress: 6,
  blockageReason: 7,
} as const;
export const FOCUS_FIELD_COLLABORATOR = "field::Colaborador";
export const FOCUS_FIELD_DATE = "field::Fecha";
export const FOCUS_FIELD_INDICATOR = "field::Indicador fundamental";
export const FOCUS_FIELD_PRODUCT = "field::Producto diario terminado";
export const FOCUS_FIELD_PRODUCT_STATUS = "field::Estatus del producto";
export const FOCUS_FIELD_GOAL_TYPE = "field::Tipo de meta";
export const FOCUS_FIELD_GOAL = "field::Meta del día";
export const FOCUS_FIELD_RESULT = "field::Resultado del día";
export const FOCUS_FIELD_PERCENTAGE = "field::Porcentaje de cumplimiento";
export const FOCUS_SUMMARY_PRELIMINARY = "summary::Condición preliminar";
export const FOCUS_SUMMARY_SEMAPHORE = "summary::Semáforo general";
export const FOCUS_SUMMARY_CAUSE = "summary::Causa real a manejar";
export const FOCUS_SUMMARY_ACTION = "summary::Siguiente acción";

export const DEFAULT_FOCUS_CONFIGURATION: FocusConfiguration = {
  riseThreshold: 40,
  fallThreshold: 25,
  flatTolerance: 1,
  prolongedFlatPeriods: 3,
  minimumWeeklyEntries: 3,
  powerMinimumWeeks: 14,
  powerMinimumMonths: 3,
};

export const DEFAULT_FOCUS_FORMULAS: FocusConditionFormula[] = [
  {
    condition: "Inexistencia",
    active: true,
    updatedAt: "2026-06-13",
    steps: [
      "Encontrar una línea de comunicación.",
      "Darse a conocer.",
      "Averiguar qué se necesita o se desea.",
      "Hacerlo, producirlo y/o entregarlo.",
    ],
  },
  {
    condition: "Peligro",
    active: true,
    updatedAt: "2026-06-13",
    steps: [
      "Saltarte rutinas o hábitos y atender la situación tú mismo.",
      "Manejar la situación y el peligro en ella.",
      "Asignarte la condición de Peligro.",
      "Poner en orden tu propia ética: detectar qué estás haciendo mal y corregirlo con autodisciplina.",
      "Reorganizar tu operación para que la situación peligrosa deje de repetirse.",
      "Adoptar una política firme que en adelante detecte y prevenga la recurrencia.",
    ],
  },
  {
    condition: "Emergencia",
    active: true,
    updatedAt: "2026-06-13",
    steps: [
      "Producir (promocionar).",
      "Cambiar tu base de operación.",
      "Economizar.",
      "Prepararte para entregar.",
      "Endurecer tu disciplina y ética.",
    ],
  },
  {
    condition: "Normal",
    active: true,
    updatedAt: "2026-06-13",
    steps: [
      "No cambies nada.",
      "Cuando la estadística sube, averigua qué la hizo subir y haz más de eso sin abandonar lo anterior.",
      "Cuando baja ligeramente, encuentra qué cambió y corrígelo de inmediato.",
      "Ética suave: no investigues ni golpees nada estando en Normal.",
    ],
  },
  {
    condition: "Afluencia",
    active: true,
    updatedAt: "2026-06-13",
    steps: [
      "Economizar (no comprometas el excedente a largo plazo).",
      "Pagar y cerrar todo lo pendiente primero.",
      "Invertir lo demás en capacidad para producir y entregar más.",
      "Descubrir qué causó la Afluencia y reforzarlo.",
    ],
  },
  {
    condition: "Poder",
    active: true,
    updatedAt: "2026-06-13",
    steps: [
      "La primera ley de una condición de Poder es no perder el contacto.",
      "Dejar constancia de todas las líneas de comunicación del trabajo o actividad.",
      "Escribir el conocimiento de la actividad y ponerlo en manos de la persona que va a ocuparse de ella.",
      "Hacer todo lo posible para que alguien pueda ocuparse correctamente de la actividad que se deja.",
    ],
  },
];

export const DEFAULT_FOCUS_SETTINGS: FocusSettings = {
  configuration: DEFAULT_FOCUS_CONFIGURATION,
  formulas: DEFAULT_FOCUS_FORMULAS,
};

function numericOrDefault(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeFocusConfiguration(configuration: Partial<FocusConfiguration> = {}): FocusConfiguration {
  const merged = { ...DEFAULT_FOCUS_CONFIGURATION, ...configuration };
  return {
    riseThreshold: Math.max(DEFAULT_FOCUS_CONFIGURATION.riseThreshold, numericOrDefault(merged.riseThreshold, DEFAULT_FOCUS_CONFIGURATION.riseThreshold)),
    fallThreshold: DEFAULT_FOCUS_CONFIGURATION.fallThreshold,
    flatTolerance: Math.max(0, numericOrDefault(merged.flatTolerance, DEFAULT_FOCUS_CONFIGURATION.flatTolerance)),
    prolongedFlatPeriods: Math.max(2, Math.round(numericOrDefault(merged.prolongedFlatPeriods, DEFAULT_FOCUS_CONFIGURATION.prolongedFlatPeriods))),
    minimumWeeklyEntries: Math.max(1, Math.round(numericOrDefault(merged.minimumWeeklyEntries, DEFAULT_FOCUS_CONFIGURATION.minimumWeeklyEntries))),
    powerMinimumWeeks: Math.max(2, Math.round(numericOrDefault(merged.powerMinimumWeeks, DEFAULT_FOCUS_CONFIGURATION.powerMinimumWeeks))),
    powerMinimumMonths: Math.max(1, Math.round(numericOrDefault(merged.powerMinimumMonths, DEFAULT_FOCUS_CONFIGURATION.powerMinimumMonths))),
  };
}

export type FocusDailyStatus = typeof FOCUS_DAILY_STATUSES[number];
export type FocusDailyPriority = typeof FOCUS_DAILY_PRIORITIES[number];

export type FocusDailyActivityInput = {
  id?: string;
  name?: string;
  activity?: string;
  description?: string;
  blockageReason?: string;
  goalAssignmentId?: string;
  goalLabel?: string;
  goalTargetValue?: number;
  goalMetricSource?: MetricSource;
  goalEffectiveDate?: string;
  goalCadence?: FocusDailyGoalSnapshot["cadence"];
  goalPeriodStartDate?: string;
  goalPeriodEndDate?: string;
  goalUnitIndicatorId?: string;
  goalUnitIndicatorName?: string;
  goalValueKind?: FocusDailyGoalSnapshot["valueKind"];
  activityStatus?: string;
  status?: string;
  activityPriority?: string;
  priority?: string;
  deadline?: string;
  previousValue?: number;
  currentValue?: number;
  progress?: number;
};

export type FocusDailyCalculatedActivity = FocusDailyActivityInput & {
  name: string;
  activityStatus: FocusDailyStatus;
  activityPriority: FocusDailyPriority;
  deadline: string;
  currentValue: number;
  blockageReason: string;
  calculatedSemaphore: OperationSemaphore;
  internalPriorityWeight: number;
  internalWeightedValue: number;
};

export type FocusDailyProgress = {
  registered: number;
  done: number;
  inProgress: number;
  pending: number;
  blocked: number;
  goalCount?: number;
  goalBreakdown?: FocusDailyGoalScore[];
  score?: number;
  semaphore?: OperationSemaphore;
  trendCondition?: FocusTrendCondition;
  trendDeltaPP?: number;
  previousWeightedScore?: number;
  rollingAverageLast4?: number;
  rollingMinimumLast4?: number;
  isPowerCondition?: boolean;
  peakStreakCount?: number;
  isPeakRecoveryPower?: boolean;
  activitiesWithCalculatedFields?: FocusDailyCalculatedActivity[];
};

export type FocusDailyPreviousEvaluation = {
  date?: string;
  createdAt?: string;
  score?: number;
  weightedScore?: number;
  finalScore?: number;
  focusDaily?: {
    weightedScore?: number;
  };
};

export type FocusDailyScoreResult = Required<Pick<FocusDailyProgress, "registered" | "done" | "inProgress" | "pending" | "blocked">> & {
  totalActivities: number;
  completedActivities: number;
  inProgressActivities: number;
  pendingActivities: number;
  blockedActivities: number;
  weightedScore: number;
  score: number;
  goalCount: number;
  goalBreakdown: FocusDailyGoalScore[];
  generalStatus: OperationSemaphore;
  semaphore: OperationSemaphore;
  trendCondition: FocusTrendCondition;
  trendDeltaPP?: number;
  previousWeightedScore?: number;
  rollingAverageLast4?: number;
  rollingMinimumLast4?: number;
  isPowerCondition: boolean;
  peakStreakCount: number;
  isPeakRecoveryPower: boolean;
  activitiesWithCalculatedFields: FocusDailyCalculatedActivity[];
};

const priorityWeights: Record<FocusDailyPriority, number> = {
  "Importante – urgente": 4,
  "Importante – no urgente": 3,
  "No importante – urgente": 2,
  "No importante – no urgente": 1,
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const round2 = (value: number) => Math.round(value * 100) / 100;
const roundInteger = (value: number) => Math.round(value);
const FOCUS_PEAK_SCORE = 100;
const FOCUS_PEAK_FLOOR = 80;

export function focusDailyValueKey(...parts: Array<string | number>) {
  return parts.map(String).join("::");
}

export function focusDailyTableKey(rowIndex: number, columnIndex: number) {
  return focusDailyValueKey("table", FOCUS_DAILY_TABLE_TITLE, rowIndex, columnIndex);
}

export function getFocusDailyRowCount(values: Record<string, string>, fallback = 5) {
  const stored = Number(values[FOCUS_DAILY_ROW_COUNT_KEY]);
  if (Number.isFinite(stored) && stored > 0) {
    return clamp(Math.round(stored), FOCUS_DAILY_MIN_ROWS, FOCUS_DAILY_MAX_ROWS);
  }

  const prefix = `table::${FOCUS_DAILY_TABLE_TITLE}::`;
  const inferred = Object.keys(values).reduce((highest, key) => {
    if (!key.startsWith(prefix)) return highest;
    const rowIndex = Number(key.slice(prefix.length).split("::")[0]);
    return Number.isFinite(rowIndex) ? Math.max(highest, rowIndex + 1) : highest;
  }, 0);

  return clamp(Math.max(fallback, inferred), FOCUS_DAILY_MIN_ROWS, FOCUS_DAILY_MAX_ROWS);
}

export function parseFocusDailyPercent(value: string) {
  const parsed = Number(value.replace("%", "").trim());
  return Number.isFinite(parsed) ? clamp(parsed, 0, 100) : 0;
}

export function inferFocusDailyPercent(status: string, currentValue = "") {
  const normalized = normalizeFocusDailyStatus(status);
  if (normalized === "Completado") return "100";
  if (normalized === "No iniciado") {
    const current = parseFocusDailyPercent(currentValue);
    return current >= 100 ? "99" : String(current);
  }
  if (normalized === "En proceso") {
    const current = parseFocusDailyPercent(currentValue);
    return current > 0 && current < 100 ? String(current) : "50";
  }
  return currentValue;
}

export function inferFocusDailyStatus(percentValue: string) {
  const percent = parseFocusDailyPercent(percentValue);
  if (percent >= 100) return "Completado";
  if (percent <= 0) return "No iniciado";
  return "En proceso";
}

export function normalizeFocusDailyStatus(value?: string): FocusDailyStatus {
  if (value === "Hecho") return "Completado";
  if (value === "Proceso") return "En proceso";
  if (value === "Pendiente") return "No iniciado";
  if (value?.trim().toLocaleLowerCase("es-MX") === "bloqueado") return "No iniciado";
  if (value && (FOCUS_DAILY_STATUSES as readonly string[]).includes(value)) return value as FocusDailyStatus;
  return "No iniciado";
}

export function normalizeFocusDailyPriority(value?: string): FocusDailyPriority {
  if (value === "Crítica") return "Importante – urgente";
  if (value === "Alta") return "Importante – urgente";
  if (value === "Media") return "Importante – no urgente";
  if (value === "Baja") return "No importante – no urgente";
  if (value && (FOCUS_DAILY_PRIORITIES as readonly string[]).includes(value)) return value as FocusDailyPriority;
  return "Importante – urgente";
}

export function getFocusDailyPriorityWeight(priority?: string) {
  return priorityWeights[normalizeFocusDailyPriority(priority)];
}

function normalizeActivityProgress(activity: FocusDailyActivityInput, status: FocusDailyStatus) {
  const raw = typeof activity.currentValue === "number" ? activity.currentValue : activity.progress ?? 0;
  const bounded = clamp(Number.isFinite(raw) ? raw : 0, 0, status === "No iniciado" ? 99 : 100);
  if (status === "Completado") return 100;
  return bounded;
}

export function getFocusDailyActivitySemaphore(activity: FocusDailyActivityInput): { semaphore: OperationSemaphore; label: string; tone: "green" | "yellow" | "red"; helper: string } {
  const status = normalizeFocusDailyStatus(activity.activityStatus ?? activity.status);
  const progress = normalizeActivityProgress(activity, status);
  if (status === "No iniciado") return { semaphore: "Rojo", label: "Rojo", tone: "red", helper: "No iniciado" };
  if (progress >= 100) return { semaphore: "Verde", label: "Verde", tone: "green", helper: "Completado" };
  if (progress > 0) return { semaphore: "Amarillo", label: "Amarillo", tone: "yellow", helper: "En proceso" };
  return { semaphore: "Rojo", label: "Rojo", tone: "red", helper: "No iniciado" };
}

export function getFocusDailySemaphore(score: number): OperationSemaphore {
  if (score >= 80) return "Verde";
  if (score >= 50) return "Amarillo";
  return "Rojo";
}

function getPreviousFocusScore(record: FocusDailyPreviousEvaluation) {
  const candidates = [record.focusDaily?.weightedScore, record.weightedScore, record.score, record.finalScore];
  return candidates.find((value): value is number => typeof value === "number" && Number.isFinite(value));
}

function sortPreviousFocusEvaluations(previousEvaluations: FocusDailyPreviousEvaluation[]) {
  return [...previousEvaluations].sort((left, right) =>
    (left.date ?? left.createdAt ?? "").localeCompare(right.date ?? right.createdAt ?? "")
  );
}

function hasConsecutiveDropGreaterThan(values: number[], threshold: number) {
  return values.slice(1).some((value, index) => value - values[index] < -threshold);
}

function peakStreakFromScores(previousScores: number[], currentScore: number) {
  if (currentScore < FOCUS_PEAK_SCORE) return 0;
  let consecutivePreviousPeaks = 0;
  for (let index = previousScores.length - 1; index >= 0; index -= 1) {
    if (previousScores[index] < FOCUS_PEAK_SCORE) break;
    consecutivePreviousPeaks += 1;
  }
  return consecutivePreviousPeaks;
}

function hasPeakRecoveryPower(previousScores: number[], currentScore: number) {
  if (currentScore < FOCUS_PEAK_SCORE) return false;
  const lastPriorPeakIndex = previousScores.map((score, index) => score >= FOCUS_PEAK_SCORE ? index : -1).filter((index) => index >= 0).at(-1);
  if (typeof lastPriorPeakIndex !== "number") return false;
  const tail = [...previousScores.slice(lastPriorPeakIndex), currentScore];
  return tail.length >= 3 && tail.every((score) => score >= FOCUS_PEAK_FLOOR);
}

export function calculateTrendCondition(currentScore: number, previousEvaluations: FocusDailyPreviousEvaluation[], totalActivities: number) {
  if (totalActivities === 0) {
    return {
      trendCondition: "Inexistencia" as FocusTrendCondition,
      isPowerCondition: false,
      peakStreakCount: 0,
      isPeakRecoveryPower: false,
    };
  }

  const previousScores = sortPreviousFocusEvaluations(previousEvaluations).map(getPreviousFocusScore).filter((value): value is number => typeof value === "number");
  const previousWeightedScore = previousScores.at(-1);
  if (typeof previousWeightedScore !== "number") {
    return {
      trendCondition: "Sin histórico suficiente" as FocusTrendCondition,
      isPowerCondition: false,
      peakStreakCount: 0,
      isPeakRecoveryPower: false,
    };
  }
  if (currentScore === 0) {
    return { trendCondition: "Peligro" as FocusTrendCondition, trendDeltaPP: round2(currentScore - previousWeightedScore), previousWeightedScore, isPowerCondition: false, peakStreakCount: 0, isPeakRecoveryPower: false };
  }

  const trendDeltaPP = round2(currentScore - previousWeightedScore);
  const consecutivePeakStreak = peakStreakFromScores(previousScores, currentScore);
  const isPeakRecoveryPower = hasPeakRecoveryPower(previousScores, currentScore) && consecutivePeakStreak < 2;
  const peakStreakCount = isPeakRecoveryPower ? 2 : consecutivePeakStreak;
  const last4Scores = [...previousScores.slice(-3), currentScore];
  const rollingAverageLast4 = last4Scores.length >= 4 ? round2(last4Scores.reduce((sum, value) => sum + value, 0) / last4Scores.length) : undefined;
  const rollingMinimumLast4 = last4Scores.length >= 4 ? Math.min(...last4Scores) : undefined;
  const hasStrongDrop = last4Scores.length >= 4 && hasConsecutiveDropGreaterThan(last4Scores, 5);
  const hasStrongCurrentIncrease = trendDeltaPP >= DEFAULT_FOCUS_CONFIGURATION.riseThreshold;
  const highProductionPlateau = currentScore >= 90
    && previousWeightedScore >= 90
    && Math.abs(trendDeltaPP) <= DEFAULT_FOCUS_CONFIGURATION.flatTolerance;
  const scoreTwoPeriodsAgo = previousScores.at(-2);
  const consolidatesRecentHighRise = highProductionPlateau
    && typeof scoreTwoPeriodsAgo === "number"
    && previousWeightedScore - scoreTwoPeriodsAgo >= DEFAULT_FOCUS_CONFIGURATION.riseThreshold;
  const isPowerCondition = last4Scores.length >= 4
    && typeof rollingAverageLast4 === "number"
    && typeof rollingMinimumLast4 === "number"
    && rollingAverageLast4 >= 90
    && rollingMinimumLast4 >= 85
    && !hasStrongDrop
    && trendDeltaPP > -5
    && !hasStrongCurrentIncrease;

  if (isPowerCondition || peakStreakCount >= 2 || isPeakRecoveryPower) {
    return { trendCondition: "Poder" as FocusTrendCondition, trendDeltaPP, previousWeightedScore, rollingAverageLast4, rollingMinimumLast4, isPowerCondition: true, peakStreakCount, isPeakRecoveryPower };
  }
  if (peakStreakCount === 1) {
    return { trendCondition: "Afluencia" as FocusTrendCondition, trendDeltaPP, previousWeightedScore, rollingAverageLast4, rollingMinimumLast4, isPowerCondition: false, peakStreakCount, isPeakRecoveryPower };
  }
  if (trendDeltaPP <= -DEFAULT_FOCUS_CONFIGURATION.fallThreshold) return { trendCondition: "Peligro" as FocusTrendCondition, trendDeltaPP, previousWeightedScore, rollingAverageLast4, rollingMinimumLast4, isPowerCondition: false, peakStreakCount, isPeakRecoveryPower };
  if (highProductionPlateau || consolidatesRecentHighRise) return { trendCondition: "Normal" as FocusTrendCondition, trendDeltaPP, previousWeightedScore, rollingAverageLast4, rollingMinimumLast4, isPowerCondition: false, peakStreakCount, isPeakRecoveryPower };
  if (trendDeltaPP <= 0) return { trendCondition: "Emergencia" as FocusTrendCondition, trendDeltaPP, previousWeightedScore, rollingAverageLast4, rollingMinimumLast4, isPowerCondition: false, peakStreakCount, isPeakRecoveryPower };
  if (trendDeltaPP < DEFAULT_FOCUS_CONFIGURATION.riseThreshold) return { trendCondition: "Normal" as FocusTrendCondition, trendDeltaPP, previousWeightedScore, rollingAverageLast4, rollingMinimumLast4, isPowerCondition: false, peakStreakCount, isPeakRecoveryPower };
  return { trendCondition: "Afluencia" as FocusTrendCondition, trendDeltaPP, previousWeightedScore, rollingAverageLast4, rollingMinimumLast4, isPowerCondition: false, peakStreakCount, isPeakRecoveryPower };
}

export function calculateWeightedScore(activities: FocusDailyActivityInput[]) {
  const normalized = activities
    .map(normalizeFocusActivity)
    .filter((activity) => Boolean(activity.name || activity.currentValue || activity.activityStatus !== "No iniciado" || activity.blockageReason));
  const totalPossibleWeight = normalized.reduce((sum, activity) => sum + activity.internalPriorityWeight, 0);
  const totalEarnedWeight = normalized.reduce((sum, activity) => sum + activity.internalWeightedValue, 0);
  return totalPossibleWeight > 0 ? roundInteger((totalEarnedWeight / totalPossibleWeight) * 100) : 0;
}

function normalizeGoalTargets(goals: FocusDailyGoalSnapshot[]) {
  const unique = new Map<string, FocusDailyGoalSnapshot>();
  goals.forEach((goal) => {
    if (!goal.id) return;
    unique.set(goal.id, {
      ...goal,
      label: goal.label.trim() || "Meta sin nombre",
    });
  });
  return [...unique.values()];
}

function inferGoalTargetsFromActivities(activities: FocusDailyCalculatedActivity[]) {
  const inferred = new Map<string, FocusDailyGoalSnapshot>();
  activities.forEach((activity) => {
    if (!activity.goalAssignmentId) return;
    inferred.set(activity.goalAssignmentId, {
      id: activity.goalAssignmentId,
      label: activity.goalLabel?.trim() || "Meta asociada",
      targetValue: activity.goalTargetValue,
      effectiveDate: activity.goalEffectiveDate,
      metricSource: activity.goalMetricSource,
      cadence: activity.goalCadence,
      periodEndDate: activity.goalPeriodEndDate,
      periodStartDate: activity.goalPeriodStartDate,
      unitIndicatorId: activity.goalUnitIndicatorId,
      unitIndicatorName: activity.goalUnitIndicatorName,
      valueKind: activity.goalValueKind,
    });
  });
  return [...inferred.values()];
}

function calculateGoalBreakdown(activities: FocusDailyCalculatedActivity[], goals: FocusDailyGoalSnapshot[]) {
  const targets = normalizeGoalTargets(goals.length ? goals : inferGoalTargetsFromActivities(activities));
  if (!targets.length) return { goalBreakdown: [] as FocusDailyGoalScore[], goalScore: calculateWeightedScore(activities) };
  const goalBreakdown = targets.map((goal) => {
    const goalActivities = activities.filter((activity) => activity.goalAssignmentId === goal.id);
    return {
      ...goal,
      activityCount: goalActivities.length,
      score: goalActivities.length ? calculateWeightedScore(goalActivities) : 0,
    };
  });
  const goalScore = roundInteger(goalBreakdown.reduce((sum, goal) => sum + goal.score, 0) / goalBreakdown.length);
  return { goalBreakdown, goalScore };
}

export const calculateGeneralStatus = getFocusDailySemaphore;
export const calculateActivitySemaphore = getFocusDailyActivitySemaphore;

export function validateFocusActivity(activity: FocusDailyActivityInput) {
  const normalized = normalizeFocusActivity(activity);
  const errors: string[] = [];
  if (!normalized.name.trim()) errors.push("La actividad necesita nombre.");
  if (normalized.currentValue < 0 || normalized.currentValue > 100) errors.push("El avance debe estar entre 0 y 100.");
  if (normalized.activityStatus === "No iniciado" && normalized.currentValue >= 100) errors.push("Una actividad no iniciada no puede estar al 100%.");
  if (focusDailyActivityRequiresReason(normalized) && !normalized.blockageReason.trim()) errors.push("Agrega motivo / avance.");
  return { activity: normalized, errors };
}

function normalizeFocusActivity(activity: FocusDailyActivityInput): FocusDailyCalculatedActivity {
  const activityStatus = normalizeFocusDailyStatus(activity.activityStatus ?? activity.status);
  const activityPriority = normalizeFocusDailyPriority(activity.activityPriority ?? activity.priority);
  const currentValue = normalizeActivityProgress(activity, activityStatus) as number;
  const internalPriorityWeight = getFocusDailyPriorityWeight(activityPriority);
  const internalWeightedValue = round2(internalPriorityWeight * (currentValue / 100));
  const calculated = getFocusDailyActivitySemaphore({ ...activity, activityStatus, currentValue });
  return {
    ...activity,
    name: (activity.name ?? activity.activity ?? "").trim(),
    description: activity.description ?? "",
    activityStatus,
    status: activityStatus,
    activityPriority,
    priority: activityPriority,
    deadline: activity.deadline ?? "",
    currentValue,
    progress: currentValue,
    blockageReason: (activity.blockageReason ?? activity.description ?? "").trim(),
    calculatedSemaphore: calculated.semaphore,
    internalPriorityWeight,
    internalWeightedValue,
  };
}

export function focusDailyActivityRequiresReason(activity: FocusDailyActivityInput) {
  const status = normalizeFocusDailyStatus(activity.activityStatus ?? activity.status);
  const progress = normalizeActivityProgress(activity, status) as number;
  return status === "No iniciado" || progress < 100;
}

export function calculateFocusDailyScore(
  activities: FocusDailyActivityInput[],
  previousEvaluations: FocusDailyPreviousEvaluation[] = [],
  goalTargets: FocusDailyGoalSnapshot[] = [],
): FocusDailyScoreResult {
  const activitiesWithCalculatedFields = activities
    .map(normalizeFocusActivity)
    .filter((activity) => Boolean(activity.name || activity.currentValue || activity.activityStatus !== "No iniciado" || activity.blockageReason));
  const { goalBreakdown, goalScore } = calculateGoalBreakdown(activitiesWithCalculatedFields, goalTargets);
  const weightedScore = goalScore;
  const trend = calculateTrendCondition(weightedScore, previousEvaluations, activitiesWithCalculatedFields.length);

  return {
    registered: activitiesWithCalculatedFields.length,
    done: activitiesWithCalculatedFields.filter((activity) => activity.activityStatus === "Completado").length,
    inProgress: activitiesWithCalculatedFields.filter((activity) => activity.activityStatus === "En proceso").length,
    pending: activitiesWithCalculatedFields.filter((activity) => activity.activityStatus === "No iniciado").length,
    blocked: activitiesWithCalculatedFields.filter((activity) => activity.activityStatus === "No iniciado").length,
    totalActivities: activitiesWithCalculatedFields.length,
    completedActivities: activitiesWithCalculatedFields.filter((activity) => activity.activityStatus === "Completado").length,
    inProgressActivities: activitiesWithCalculatedFields.filter((activity) => activity.activityStatus === "En proceso").length,
    pendingActivities: activitiesWithCalculatedFields.filter((activity) => activity.activityStatus === "No iniciado").length,
    blockedActivities: activitiesWithCalculatedFields.filter((activity) => activity.activityStatus === "No iniciado").length,
    weightedScore,
    score: weightedScore,
    goalCount: goalBreakdown.length,
    goalBreakdown,
    generalStatus: getFocusDailySemaphore(weightedScore),
    semaphore: getFocusDailySemaphore(weightedScore),
    trendCondition: trend.trendCondition,
    trendDeltaPP: trend.trendDeltaPP,
    previousWeightedScore: trend.previousWeightedScore,
    rollingAverageLast4: trend.rollingAverageLast4,
    rollingMinimumLast4: trend.rollingMinimumLast4,
    isPowerCondition: trend.isPowerCondition,
    peakStreakCount: trend.peakStreakCount,
    isPeakRecoveryPower: trend.isPeakRecoveryPower,
    activitiesWithCalculatedFields,
  };
}

export function calculateFocusPercentage(values: Record<string, string>) {
  const manual = values[FOCUS_FIELD_PERCENTAGE]?.trim();
  if (manual) return round2(parseFocusDailyPercent(manual));
  const goal = Number(values[FOCUS_FIELD_GOAL]);
  const result = Number(values[FOCUS_FIELD_RESULT]);
  if (Number.isFinite(goal) && goal > 0 && Number.isFinite(result)) return round2((result / goal) * 100);
  return undefined;
}

function getFocusDailyActivityFromValues(values: Record<string, string>, rowIndex: number): FocusDailyActivityInput {
  const newActivity = values[focusDailyTableKey(rowIndex, FOCUS_DAILY_COLUMN_INDEX.activity)]?.trim();
  const oldActivity = values[focusDailyTableKey(rowIndex, 0)]?.trim();
  const hasNewShape = Boolean(
    newActivity
    || values[focusDailyTableKey(rowIndex, FOCUS_DAILY_COLUMN_INDEX.progress)]
    || values[focusDailyTableKey(rowIndex, FOCUS_DAILY_COLUMN_INDEX.blockageReason)]
  );
  if (hasNewShape) {
    return {
      name: newActivity ?? "",
      activityStatus: values[focusDailyTableKey(rowIndex, FOCUS_DAILY_COLUMN_INDEX.status)]?.trim(),
      activityPriority: values[focusDailyTableKey(rowIndex, FOCUS_DAILY_COLUMN_INDEX.priority)]?.trim(),
      deadline: values[focusDailyTableKey(rowIndex, FOCUS_DAILY_COLUMN_INDEX.deadline)]?.trim(),
      currentValue: parseFocusDailyPercent(values[focusDailyTableKey(rowIndex, FOCUS_DAILY_COLUMN_INDEX.progress)] ?? ""),
      description: values[focusDailyTableKey(rowIndex, FOCUS_DAILY_COLUMN_INDEX.blockageReason)]?.trim() ?? "",
    };
  }

  return {
    name: oldActivity ?? "",
    activityPriority: values[focusDailyTableKey(rowIndex, 1)]?.trim(),
    activityStatus: values[focusDailyTableKey(rowIndex, 2)]?.trim(),
    currentValue: parseFocusDailyPercent(values[focusDailyTableKey(rowIndex, 3)] ?? ""),
    description: values[focusDailyTableKey(rowIndex, 4)]?.trim() ?? "",
  };
}

export function calculateFocusDailyProgress(values: Record<string, string>, rowCount = 5): FocusDailyProgress {
  const directPercentage = calculateFocusPercentage(values);
  const rows = Array.from({ length: rowCount }, (_, rowIndex) => getFocusDailyActivityFromValues(values, rowIndex));
  const result = calculateFocusDailyScore(rows);

  if (typeof directPercentage === "number") {
    const bounded = clamp(directPercentage, 0, 100);
    return {
      registered: result.totalActivities || 1,
      done: bounded >= 100 ? 1 : 0,
      inProgress: bounded > 0 && bounded < 100 ? 1 : 0,
      pending: bounded <= 0 ? 1 : 0,
      blocked: 0,
      goalCount: result.goalCount,
      goalBreakdown: result.goalBreakdown,
      score: bounded,
      semaphore: getFocusDailySemaphore(bounded),
      trendCondition: result.trendCondition,
      peakStreakCount: result.peakStreakCount,
      isPeakRecoveryPower: result.isPeakRecoveryPower,
      activitiesWithCalculatedFields: result.activitiesWithCalculatedFields,
    };
  }

  if (!result.totalActivities) {
    return { registered: 0, done: 0, inProgress: 0, pending: 0, blocked: 0, goalCount: result.goalCount, goalBreakdown: result.goalBreakdown, score: 0, semaphore: "Rojo", trendCondition: "Inexistencia", activitiesWithCalculatedFields: [] };
  }

  return {
    registered: result.totalActivities,
    done: result.completedActivities,
    inProgress: result.inProgressActivities,
    pending: result.pendingActivities,
    blocked: result.blockedActivities,
    goalCount: result.goalCount,
    goalBreakdown: result.goalBreakdown,
    score: result.weightedScore,
    semaphore: result.generalStatus,
    trendCondition: result.trendCondition,
    trendDeltaPP: result.trendDeltaPP,
    previousWeightedScore: result.previousWeightedScore,
    rollingAverageLast4: result.rollingAverageLast4,
    rollingMinimumLast4: result.rollingMinimumLast4,
    isPowerCondition: result.isPowerCondition,
    peakStreakCount: result.peakStreakCount,
    isPeakRecoveryPower: result.isPeakRecoveryPower,
    activitiesWithCalculatedFields: result.activitiesWithCalculatedFields,
  };
}

export function getFocusFormula(condition: FocusCondition, formulas = DEFAULT_FOCUS_FORMULAS) {
  return formulas.find((formula) => formula.condition === condition && formula.active)?.steps ?? [];
}

export function getFocusSuggestedAction(condition: FocusCondition, formulas = DEFAULT_FOCUS_FORMULAS) {
  return (getFocusFormula(condition, formulas)[0] ?? "").slice(0, 180);
}

export function focusDailySummaryValues(progress: FocusDailyProgress, current: Record<string, string> = {}) {
  return {
    [focusDailyValueKey("summary", "Total de actividades")]: progress.registered ? String(progress.registered) : "0",
    [focusDailyValueKey("summary", "Actividades completadas")]: progress.registered ? String(progress.done) : "0",
    [focusDailyValueKey("summary", "Actividades en proceso")]: progress.registered ? String(progress.inProgress) : "0",
    [focusDailyValueKey("summary", "Actividades pendientes")]: progress.registered ? String(progress.pending) : "0",
    [focusDailyValueKey("summary", "Actividades no iniciadas")]: progress.registered ? String(progress.blocked) : "0",
    [focusDailyValueKey("summary", "Cumplimiento diario")]: typeof progress.score === "number" ? `${progress.score}%` : "0%",
    [focusDailyValueKey("summary", "Avance total")]: typeof progress.score === "number" ? `${progress.score}%` : "0%",
    [focusDailyValueKey("summary", "Semáforo general")]: progress.semaphore ?? "",
    [focusDailyValueKey("summary", "Condición de tendencia")]: progress.trendCondition ?? "Sin histórico suficiente",
    [focusDailyValueKey("summary", "Racha de 100")]: progress.peakStreakCount ? `Racha ${progress.peakStreakCount}` : "",
    [FOCUS_SUMMARY_PRELIMINARY]: progress.trendCondition ?? "",
    [FOCUS_SUMMARY_CAUSE]: current[FOCUS_SUMMARY_CAUSE] ?? "",
    [FOCUS_SUMMARY_ACTION]: current[FOCUS_SUMMARY_ACTION] ?? "",
  };
}

export function isFocusDailyValues(values: Record<string, string>) {
  return Object.keys(values).some((key) => key.startsWith(`table::${FOCUS_DAILY_TABLE_TITLE}::`));
}

export function isFocusCauseRequired(values: Record<string, string>, score?: number) {
  const productStatus = values[FOCUS_FIELD_PRODUCT_STATUS]?.trim().toLocaleLowerCase("es-MX");
  return (typeof score === "number" && score < 100) || productStatus === "bloqueado" || productStatus === "no iniciado";
}

export function getFocusDailyValidationErrors(values: Record<string, string>, rowCount = 5) {
  const rows = Array.from({ length: rowCount }, (_, rowIndex) => ({ rowIndex, activity: getFocusDailyActivityFromValues(values, rowIndex) }))
    .map(({ rowIndex, activity }) => ({ rowIndex, activity: normalizeFocusActivity(activity) }))
    .filter(({ activity }) => Boolean(activity.name || activity.currentValue || activity.activityStatus !== "No iniciado" || activity.blockageReason));
  return rows.flatMap(({ rowIndex, activity }) => {
    if (!activity.name.trim()) return [`Fila ${rowIndex + 1}: escribe la actividad.`];
    if (focusDailyActivityRequiresReason(activity) && !activity.blockageReason.trim()) return [`Fila ${rowIndex + 1}: agrega motivo / avance.`];
    return [];
  });
}

export function getFocusCauseAnchor(condition?: FocusCondition) {
  if (condition === "Peligro") return "Maneja la situación y el peligro en ella.";
  if (condition === "Emergencia") return "Cambia tu base de operación.";
  return "";
}

type FocusWeeklyTrendPoint = {
  year: number;
  isoWeek: number;
  stat: number;
  approvedEntries?: number;
};

function getIsoWeekStart(year: number, isoWeek: number) {
  const januaryFourth = new Date(Date.UTC(year, 0, 4));
  const januaryFourthDay = januaryFourth.getUTCDay() || 7;
  const monday = new Date(januaryFourth);
  monday.setUTCDate(januaryFourth.getUTCDate() - januaryFourthDay + 1 + ((isoWeek - 1) * 7));
  return monday;
}

function hasSustainedFocusPower(points: FocusWeeklyTrendPoint[], configuration: FocusConfiguration) {
  const minimumWeeks = Math.max(2, Math.round(configuration.powerMinimumWeeks));
  const sustainedTail = [...points]
    .sort((a, b) => a.year - b.year || a.isoWeek - b.isoWeek)
    .slice(-minimumWeeks);
  if (sustainedTail.length < minimumWeeks) return false;
  if (sustainedTail.some((point) => typeof point.approvedEntries === "number" && point.approvedEntries < configuration.minimumWeeklyEntries)) return false;

  const firstDate = getIsoWeekStart(sustainedTail[0].year, sustainedTail[0].isoWeek);
  const lastDate = getIsoWeekStart(sustainedTail.at(-1)!.year, sustainedTail.at(-1)!.isoWeek);
  const minimumDurationEnd = new Date(firstDate);
  minimumDurationEnd.setUTCMonth(minimumDurationEnd.getUTCMonth() + Math.max(1, Math.round(configuration.powerMinimumMonths)));
  if (lastDate < minimumDurationEnd) return false;

  const deltas = sustainedTail.slice(1).map((point, index) => point.stat - sustainedTail[index].stat);
  const isContinuous = sustainedTail.every((point, index) => {
    if (index === 0) return true;
    const previousDate = getIsoWeekStart(sustainedTail[index - 1].year, sustainedTail[index - 1].isoWeek);
    const currentDate = getIsoWeekStart(point.year, point.isoWeek);
    const elapsedDays = (currentDate.getTime() - previousDate.getTime()) / 86400000;
    return elapsedDays > 0 && elapsedDays <= 14;
  });
  const staysInNormalMovement = deltas.every((delta) =>
    delta > -configuration.flatTolerance
    && delta < configuration.riseThreshold
  );
  const gradualGain = sustainedTail.at(-1)!.stat - sustainedTail[0].stat >= configuration.riseThreshold;
  const holdsPeakProduction = sustainedTail.every((point) => point.stat >= 100);
  return isContinuous && staysInNormalMovement && (gradualGain || holdsPeakProduction);
}

export function getFocusWeeklyCondition({
  approvedEntries,
  currentStat,
  previousStat,
  recentStats = [],
  recentPeriods = [],
  configuration = DEFAULT_FOCUS_CONFIGURATION,
}: {
  approvedEntries: number;
  currentStat: number;
  previousStat?: number;
  recentStats?: number[];
  recentPeriods?: FocusWeeklyTrendPoint[];
  configuration?: FocusConfiguration;
}): FocusCondition {
  const normalizedConfiguration = normalizeFocusConfiguration(configuration);
  if (approvedEntries < normalizedConfiguration.minimumWeeklyEntries || typeof previousStat !== "number") return "Inexistencia";
  const delta = round2(currentStat - previousStat);
  const values = recentStats.length ? recentStats : [previousStat, currentStat];
  const valuesWithCurrent = values.at(-1) === currentStat ? values : [...values, currentStat];
  const previousValues = valuesWithCurrent.slice(0, -1);
  const peakStreakCount = peakStreakFromScores(previousValues, currentStat);
  const isPeakRecoveryPower = hasPeakRecoveryPower(previousValues, currentStat) && peakStreakCount < 2;
  if (hasSustainedFocusPower(recentPeriods, normalizedConfiguration) || peakStreakCount >= 2 || isPeakRecoveryPower) return "Poder";
  if (peakStreakCount === 1) return "Afluencia";
  const recentDeltas = values.slice(1).map((value, index) => value - values[index]);
  const highProductionPlateau = currentStat >= 90
    && previousStat >= 90
    && Math.abs(delta) <= normalizedConfiguration.flatTolerance;
  const scoreTwoPeriodsAgo = values.length >= 3 ? values.at(-3) : undefined;
  const consolidatesRecentHighRise = highProductionPlateau
    && typeof scoreTwoPeriodsAgo === "number"
    && previousStat - scoreTwoPeriodsAgo >= normalizedConfiguration.riseThreshold;
  const isProlongedFlat = recentDeltas.length >= normalizedConfiguration.prolongedFlatPeriods
    && recentDeltas.slice(-normalizedConfiguration.prolongedFlatPeriods).every((change) => Math.abs(change) <= normalizedConfiguration.flatTolerance);
  if (isProlongedFlat && !highProductionPlateau) return "Peligro";
  if (highProductionPlateau || consolidatesRecentHighRise) return "Normal";
  if (delta >= normalizedConfiguration.riseThreshold) return "Afluencia";
  if (delta <= -normalizedConfiguration.fallThreshold) return "Peligro";
  if (delta <= 0) return "Emergencia";
  return "Normal";
}

export type FocusDailyEntry = {
  folio: string;
  businessUnitId: string;
  positionId: string;
  positionName: string;
  collaborator: string;
  date: string;
  indicator: string;
  product: string;
  productStatus: string;
  cause: string;
  action: string;
  score: number;
  semaphore: OperationSemaphore;
  preliminaryCondition?: FocusTrendCondition;
  trendDeltaPP?: number;
  previousWeightedScore?: number;
  rollingAverageLast4?: number;
  rollingMinimumLast4?: number;
  isPowerCondition?: boolean;
  peakStreakCount?: number;
  isPeakRecoveryPower?: boolean;
  validationStatus: "Pendiente" | "Aprobado" | "Requiere ajuste";
};

export type FocusWeeklySummary = {
  key: string;
  collaborator: string;
  positionId: string;
  positionName: string;
  year: number;
  isoWeek: number;
  label: string;
  currentStat: number;
  previousStat?: number;
  delta?: number;
  approvedEntries: number;
  completedProducts: number;
  blockedProducts: number;
  mainIndicator: string;
  condition: FocusCondition;
  formula: string[];
};

function getRecordDate(record: DocumentRecord) {
  return record.values?.[FOCUS_FIELD_DATE] || record.digitalCapturedAt || record.printedAt || record.updatedAt || record.createdAt;
}

export function getIsoWeek(value: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return { year: utc.getUTCFullYear(), week: Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7) };
}

export function getFocusDailyEntries(documents: DocumentRecord[]): FocusDailyEntry[] {
  return documents.flatMap((record) => {
    if (record.type !== "operation" || typeof record.score !== "number") return [];
    const values = record.values ?? {};
    const date = getRecordDate(record);
    const collaborator = values[FOCUS_FIELD_COLLABORATOR]?.trim() || values["field::Responsable directo"]?.trim() || "Sin colaborador";
    const score = round2(record.score);
    return [{
      folio: record.folio,
      businessUnitId: record.businessUnitId,
      positionId: record.positionId ?? record.positionName ?? "sin-puesto",
      positionName: record.positionName ?? "Puesto operativo",
      collaborator,
      date,
      indicator: values[FOCUS_FIELD_INDICATOR]?.trim() || "Indicador sin especificar",
      product: values[FOCUS_FIELD_PRODUCT]?.trim() || "",
      productStatus: values[FOCUS_FIELD_PRODUCT_STATUS]?.trim() || (score >= 100 ? "Terminado" : "En proceso"),
      cause: values[FOCUS_SUMMARY_CAUSE]?.trim() || "",
      action: values[FOCUS_SUMMARY_ACTION]?.trim() || "",
      score,
      semaphore: record.semaphore ?? getFocusDailySemaphore(score),
      preliminaryCondition: record.focusTrendCondition ?? record.focusPreliminaryCondition,
      trendDeltaPP: record.focusTrendDeltaPP,
      previousWeightedScore: record.focusPreviousWeightedScore,
      rollingAverageLast4: record.focusRollingAverageLast4,
      rollingMinimumLast4: record.focusRollingMinimumLast4,
      isPowerCondition: record.focusIsPowerCondition,
      peakStreakCount: record.focusPeakStreakCount,
      isPeakRecoveryPower: record.focusIsPeakRecoveryPower,
      validationStatus: record.focusValidationStatus ?? (record.status === "printed" ? "Pendiente" : "Aprobado"),
    }];
  }).sort((a, b) => a.date.localeCompare(b.date));
}

export function buildFocusWeeklySummaries(documents: DocumentRecord[], settings = DEFAULT_FOCUS_SETTINGS): FocusWeeklySummary[] {
  const entries = getFocusDailyEntries(documents).filter((entry) => entry.validationStatus === "Aprobado");
  const grouped = new Map<string, FocusDailyEntry[]>();
  entries.forEach((entry) => {
    const { year, week } = getIsoWeek(entry.date);
    const key = `${entry.positionId}::${entry.collaborator.toLocaleLowerCase("es-MX")}::${year}-${week}`;
    grouped.set(key, [...(grouped.get(key) ?? []), entry]);
  });

  const base = [...grouped.entries()].map(([key, weekEntries]) => {
    const { year, week } = getIsoWeek(weekEntries[0].date);
    const indicatorCounts = weekEntries.reduce<Record<string, number>>((counts, entry) => ({ ...counts, [entry.indicator]: (counts[entry.indicator] ?? 0) + 1 }), {});
    return {
      key,
      collaborator: weekEntries[0].collaborator,
      positionId: weekEntries[0].positionId,
      positionName: weekEntries[0].positionName,
      year,
      isoWeek: week,
      label: `S${String(week).padStart(2, "0")} ${year}`,
      currentStat: round2(weekEntries.reduce((sum, entry) => sum + entry.score, 0) / weekEntries.length),
      approvedEntries: weekEntries.length,
      completedProducts: weekEntries.filter((entry) => entry.productStatus.toLocaleLowerCase("es-MX") === "terminado").length,
      blockedProducts: weekEntries.filter((entry) => ["bloqueado", "no iniciado"].includes(entry.productStatus.toLocaleLowerCase("es-MX"))).length,
      mainIndicator: Object.entries(indicatorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Sin indicador",
    };
  }).sort((a, b) => a.collaborator.localeCompare(b.collaborator, "es-MX") || a.year - b.year || a.isoWeek - b.isoWeek);

  return base.map((summary, index) => {
    const previous = [...base.slice(0, index)].reverse().find((item) => item.positionId === summary.positionId && item.collaborator === summary.collaborator);
    const recentPeriods = base
      .slice(0, index + 1)
      .filter((item) => item.positionId === summary.positionId && item.collaborator === summary.collaborator)
      .map((item) => ({
        year: item.year,
        isoWeek: item.isoWeek,
        stat: item.currentStat,
        approvedEntries: item.approvedEntries,
      }));
    const condition = getFocusWeeklyCondition({
      approvedEntries: summary.approvedEntries,
      currentStat: summary.currentStat,
      previousStat: previous?.currentStat,
      recentStats: recentPeriods.map((item) => item.stat),
      recentPeriods,
      configuration: settings.configuration,
    });
    return {
      ...summary,
      previousStat: previous?.currentStat,
      delta: typeof previous?.currentStat === "number" ? round2(summary.currentStat - previous.currentStat) : undefined,
      condition,
      formula: getFocusFormula(condition, settings.formulas),
    };
  });
}
