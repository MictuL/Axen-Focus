import type {
  FocusCondition,
  FocusTrendCondition,
  IndicatorConditionColor,
  IndicatorProgressStatus,
  IndicatorStatusColor,
  OperationSemaphore,
  TrendCadence,
  WeeklyPositionIndicatorEvaluation,
  WeeklyPositionIndicatorResult,
} from "../types";

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(Number.isFinite(value) ? value : 0)));
const round1 = (value: number) => Math.round(value * 10) / 10;

export const INDICATOR_STATUS_OPTIONS = ["No Cumplió", "Medio Cumplió", "Cumplió"] as const satisfies readonly IndicatorProgressStatus[];

const weeklyConditionDescriptions: Record<FocusCondition, string> = {
  Inexistencia: "Resultado insuficiente o sin avance relevante.",
  Peligro: "Resultado crítico que requiere intervención inmediata.",
  Emergencia: "Resultado bajo que requiere atención.",
  Normal: "Resultado estable y dentro del cumplimiento esperado.",
  Afluencia: "Resultado sobresaliente.",
  Poder: "Resultado sostenido en poder.",
};

const weeklyConditionColors: Record<Exclude<FocusCondition, "Poder">, IndicatorConditionColor> = {
  Inexistencia: "red",
  Peligro: "orange",
  Emergencia: "yellow",
  Normal: "blue",
  Afluencia: "green",
};

export function normalizeIndicatorScore(score: unknown) {
  return clampScore(Number(score));
}

export function normalizeIndicatorActualValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? round1(parsed) : 0;
}

export function calculateIndicatorAttainmentScore(actualValue: unknown, targetValue: unknown) {
  const actual = normalizeIndicatorActualValue(actualValue);
  const target = normalizeIndicatorActualValue(targetValue);
  if (target <= 0) return 0;
  return clampScore((actual / target) * 100);
}

export function getIndicatorStatusMeta(score: unknown): {
  status: IndicatorProgressStatus;
  color: IndicatorStatusColor;
} {
  const value = normalizeIndicatorScore(score);
  if (value <= 49) return { status: "No Cumplió", color: "red" };
  if (value <= 99) return { status: "Medio Cumplió", color: "yellow" };
  return { status: "Cumplió", color: "green" };
}

export function getIndicatorStatusMetaFromResult(result: unknown, fallbackScore = 0): {
  status: IndicatorProgressStatus;
  color: IndicatorStatusColor;
} {
  const status = normalizeIndicatorStatus(result, fallbackScore);
  if (status === "Cumplió") return { status, color: "green" };
  if (status === "Medio Cumplió") return { status, color: "yellow" };
  return { status, color: "red" };
}

export function getWeeklyIndicatorConditionMeta(score: unknown): {
  condition: Exclude<FocusCondition, "Poder">;
  color: IndicatorConditionColor;
  description: string;
} {
  const value = normalizeIndicatorScore(score);
  const condition: Exclude<FocusCondition, "Poder"> = value >= 95 ? "Afluencia"
    : value >= 80 ? "Normal"
      : value >= 60 ? "Emergencia"
        : value >= 40 ? "Peligro"
          : "Inexistencia";
  return {
    condition,
    color: weeklyConditionColors[condition],
    description: weeklyConditionDescriptions[condition],
  };
}

export function normalizeIndicatorStatus(result: unknown, fallbackScore = 0): IndicatorProgressStatus {
  const normalized = String(result ?? "").trim().toLocaleLowerCase("es-MX").normalize("NFD").replace(/\p{Diacritic}/gu, "");
  if (normalized === "cumplio" || normalized === "cumple" || normalized === "completado") return "Cumplió";
  if (normalized === "medio cumplio" || normalized === "medio cumple" || normalized === "cumplimiento parcial" || normalized === "en riesgo") return "Medio Cumplió";
  if (normalized === "no cumplio" || normalized === "no cumple" || normalized === "no iniciado" || normalized === "bloqueado" || normalized === "pendiente") return "No Cumplió";
  return getIndicatorStatusMeta(fallbackScore).status;
}

export function getIndicatorSemaphore(result: IndicatorProgressStatus): OperationSemaphore {
  const { color } = getIndicatorStatusMetaFromResult(result);
  if (color === "green") return "Verde";
  if (color === "red") return "Rojo";
  return "Amarillo";
}

export function calculateWeeklyPositionIndicatorScore(indicators: Array<Pick<WeeklyPositionIndicatorResult, "score">>) {
  if (!indicators.length) return 0;
  return clampScore(indicators.reduce((sum, indicator) => sum + normalizeIndicatorScore(indicator.score), 0) / indicators.length);
}

export function calculateWeeklyIndicatorCondition(
  currentScore: number,
  previousEvaluations: Array<{ weightedScore?: number; score?: number }> = [],
  _totalIndicators = 0,
): {
  weeklyCondition: FocusTrendCondition;
  weeklyConditionColor: IndicatorConditionColor;
  weeklyConditionDescription: string;
  trendDeltaPP?: number;
  previousScore?: number;
  rollingAverageLast4?: number;
  rollingMinimumLast4?: number;
  isPowerCondition: boolean;
} {
  const score = normalizeIndicatorScore(currentScore);
  const meta = getWeeklyIndicatorConditionMeta(score);
  const previous = [...previousEvaluations]
    .reverse()
    .map((item) => item.weightedScore ?? item.score)
    .find((value): value is number => typeof value === "number" && Number.isFinite(value));
  return {
    weeklyCondition: meta.condition,
    weeklyConditionColor: meta.color,
    weeklyConditionDescription: meta.description,
    trendDeltaPP: previous === undefined ? undefined : round1(score - previous),
    previousScore: previous,
    isPowerCondition: false,
  };
}

export function normalizeIndicatorResult(input: Omit<WeeklyPositionIndicatorResult, "semaphore" | "result"> & { result?: unknown }): WeeklyPositionIndicatorResult {
  const score = input.actualValue !== undefined && input.targetValue !== undefined
    ? calculateIndicatorAttainmentScore(input.actualValue, input.targetValue)
    : normalizeIndicatorScore(input.score);
  const status = getIndicatorStatusMetaFromResult(input.result, score);
  const actualValue = input.actualValue === undefined ? undefined : normalizeIndicatorActualValue(input.actualValue);
  const targetValue = input.targetValue === undefined ? undefined : normalizeIndicatorActualValue(input.targetValue);
  return {
    ...input,
    actualValue,
    targetValue,
    result: status.status,
    score,
    statusColor: status.color,
    semaphore: getIndicatorSemaphore(status.status),
  };
}

export function normalizeWeeklyPositionIndicatorRecord(record: WeeklyPositionIndicatorEvaluation): WeeklyPositionIndicatorEvaluation {
  const indicators = record.indicators.map(normalizeIndicatorResult);
  const weightedScore = calculateWeeklyPositionIndicatorScore(indicators);
  const condition = calculateWeeklyIndicatorCondition(weightedScore);
  return {
    ...record,
    indicators,
    weightedScore,
    weeklyCondition: condition.weeklyCondition,
    weeklyConditionColor: condition.weeklyConditionColor,
    weeklyConditionDescription: condition.weeklyConditionDescription,
  };
}

function dateAtNoon(value: string) {
  return new Date(`${value.slice(0, 10)}T12:00:00`);
}

function getIsoWeek(value: string) {
  const date = dateAtNoon(value);
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return { year: utc.getUTCFullYear(), week: Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7) };
}

function cadenceMeta(dateValue: string, cadence: TrendCadence) {
  const date = dateAtNoon(dateValue);
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

export function getPositionIndicatorTrendSeries(records: WeeklyPositionIndicatorEvaluation[], cadence: TrendCadence = "week") {
  const groups = new Map<string, WeeklyPositionIndicatorEvaluation[]>();
  records.forEach((record) => {
    const meta = cadenceMeta(record.weekStartDate || record.createdAt, cadence);
    groups.set(meta.key, [...(groups.get(meta.key) ?? []), record]);
  });

  const points = [...groups.values()]
    .map((items) => {
      const meta = cadenceMeta(items[0].weekStartDate || items[0].createdAt, cadence);
      return {
        key: meta.key,
        period: meta.label,
        date: meta.date,
        count: items.length,
        score: round1(items.reduce((sum, item) => sum + clampScore(item.weightedScore), 0) / items.length),
      };
    })
    .sort((left, right) => left.date.localeCompare(right.date));

  return points.map((point, index) => {
    const previous = points.slice(0, index).map((item) => ({
      date: item.date,
      weightedScore: item.score,
    }));
    const condition = calculateWeeklyIndicatorCondition(point.score, previous, point.count);
    return {
      ...point,
      previousScore: condition.previousScore,
      delta: condition.previousScore === undefined ? undefined : round1(point.score - condition.previousScore),
      condition: condition.weeklyCondition,
      conditionColor: condition.weeklyConditionColor,
      conditionDescription: condition.weeklyConditionDescription,
      isPowerCondition: condition.isPowerCondition,
      rollingAverageLast4: condition.rollingAverageLast4,
      rollingMinimumLast4: condition.rollingMinimumLast4,
    };
  });
}
