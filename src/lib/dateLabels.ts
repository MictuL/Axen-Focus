const chartPointDateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatChartPointDate(value?: string) {
  if (!value) return "Sin fecha";
  const isoDate = value.slice(0, 10);
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return chartPointDateFormatter.format(date);
}
