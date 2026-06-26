type BaselineCompatiblePoint = {
  date: string;
  period: string;
  key?: string;
  [key: string]: unknown;
};

export function withZeroBaseline<T extends BaselineCompatiblePoint>(
  points: T[],
  numericKeys: string[] = ["score"],
  label = "0",
) {
  if (!points.length) return points;
  const baseline = {
    date: points[0].date,
    period: label,
    key: `baseline-${points[0].key ?? points[0].date}`,
    isBaseline: true,
  } as T & { isBaseline: boolean };
  numericKeys.forEach((key) => {
    if (points.some((point) => typeof point[key] === "number")) {
      (baseline as Record<string, unknown>)[key] = 0;
    }
  });
  return [baseline, ...points];
}

export function chartAxisMaximum(points: Array<Record<string, unknown>>, numericKeys: string[] = ["score"], target = 100) {
  const visibleMaximum = Math.max(target, ...points.flatMap((point) =>
    numericKeys.map((key) => point[key]).filter((value): value is number => typeof value === "number")
  ));
  const axisStep = visibleMaximum > 300 ? 100 : visibleMaximum > 150 ? 50 : 25;
  return Math.ceil((visibleMaximum * 1.08) / axisStep) * axisStep;
}
