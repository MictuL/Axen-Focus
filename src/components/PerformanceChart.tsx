import { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getIndividualTrendSeries, getTrendSeries } from "../lib/analytics";
import { chartAxisMaximum, withZeroBaseline } from "../lib/chartSeries";
import { formatChartPointDate } from "../lib/dateLabels";
import { average, getEvaluationProfileKey, getEvaluationTrendScore } from "../lib/evaluation";
import type { BusinessUnit, Evaluation, Position, TrendCadence } from "../types";
import { ChartZoomControls } from "./ChartZoomControls";
import { ConditionBadge } from "./ConditionBadge";
import { Icon } from "./Icon";
import { getOperationalLevel, groupByOperationalLevel, isPositionReady } from "../lib/catalog";
import { Panel } from "./ui/Panel";

const ALL_PEOPLE = "__all_people__";
const unique = (values: string[]) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));

type PerformanceChartPoint = {
  period: string;
  date: string;
  score?: number;
  previousScore?: number;
  delta?: number;
  compareScore?: number;
  positionAverage?: number;
  status?: Evaluation["status"];
  condition?: Evaluation["condition"];
  trend?: Evaluation["trend"];
  evaluatedPersonName?: string;
  positionName?: string;
  observations?: string;
};

function getComparisonSeries(evaluations: Evaluation[], primaryProfileId: string, compareProfileId: string, cadence: TrendCadence): PerformanceChartPoint[] {
  const primary = getIndividualTrendSeries(evaluations, primaryProfileId, cadence);
  const comparison = getIndividualTrendSeries(evaluations, compareProfileId, cadence);
  const byKey = new Map<string, PerformanceChartPoint>();
  primary.forEach((point) => byKey.set(point.key, point));
  comparison.forEach((point) => {
    byKey.set(point.key, { ...(byKey.get(point.key) ?? { period: point.period, date: point.date }), compareScore: point.score });
  });
  return [...byKey.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function PerformanceChart({
  evaluations,
  fixedProfileId,
  fixedProfileOptions = [],
  onFixedProfileChange,
  includeAllOperationalLevels = false,
  positions,
  title,
  units,
}: {
  evaluations: Evaluation[];
  fixedProfileId?: string;
  fixedProfileOptions?: Array<{ id: string; name: string; positionName: string }>;
  onFixedProfileChange?: (profileId: string) => void;
  includeAllOperationalLevels?: boolean;
  positions: Position[];
  title?: string;
  units: BusinessUnit[];
}) {
  const fixedUnitId = units.length === 1 ? units[0]?.id ?? "" : "";
  const allowedUnitIds = new Set(units.map((unit) => unit.id));
  const shouldShowAllLevels = Boolean(fixedProfileId || includeAllOperationalLevels);
  const scopedPositions = positions.filter((item) => allowedUnitIds.has(item.businessUnitId) && (shouldShowAllLevels || getOperationalLevel(item) === "Ejecución"));
  const positionById = new Map(scopedPositions.map((position) => [position.id, position]));
  const scopedEvaluations = evaluations.filter((item) =>
    allowedUnitIds.has(item.businessUnitId)
    && item.subjectType !== "unit"
    && (shouldShowAllLevels || getOperationalLevel(positionById.get(item.positionId)?.name ?? item.positionName) === "Ejecución")
  );
  const [filters, setFilters] = useState({ name: fixedProfileId ?? ALL_PEOPLE, compareName: "", unit: fixedUnitId, area: "", position: "", cadence: "week" as TrendCadence });
  const unitEvaluations = scopedEvaluations.filter((item) => !filters.unit || item.businessUnitId === filters.unit);
  const availableAreas = unique(unitEvaluations.map((item) => item.area));
  const showAreaFilter = !fixedProfileId && availableAreas.length > 1;
  const availablePositions = scopedPositions.filter((item) => isPositionReady(item) && (!filters.unit || item.businessUnitId === filters.unit) && (!filters.area || item.area === filters.area));
  const showPositionFilter = !fixedProfileId && availablePositions.length > 1;
  const availablePositionGroups = groupByOperationalLevel(availablePositions, (item) => item.name);
  const relevant = scopedEvaluations.filter((item) => (!filters.unit || item.businessUnitId === filters.unit) && (!filters.area || item.area === filters.area) && (!filters.position || item.positionId === filters.position));
  const profileMap = new Map<string, { id: string; name: string; positionName: string }>();
  [...relevant]
    .sort((left, right) => left.date.localeCompare(right.date))
    .forEach((item) => profileMap.set(getEvaluationProfileKey(item), {
      id: getEvaluationProfileKey(item),
      name: item.evaluatedPersonName,
      positionName: item.positionName,
    }));
  const profileOptions = [...profileMap.values()].sort((left, right) => left.name.localeCompare(right.name, "es-MX") || left.positionName.localeCompare(right.positionName, "es-MX"));
  const profileIds = profileOptions.map((profile) => profile.id);
  const selectedProfileName = profileMap.get(filters.name)?.name ?? "";
  const comparisonProfileName = profileMap.get(filters.compareName)?.name ?? "";
  const isAllPeople = filters.name === ALL_PEOPLE;
  const visibleEvaluations = (isAllPeople ? relevant : relevant.filter((item) => getEvaluationProfileKey(item) === filters.name))
    .sort((a, b) => a.date.localeCompare(b.date) || a.evaluatedPersonName.localeCompare(b.evaluatedPersonName, "es"));
  const chartData: PerformanceChartPoint[] = isAllPeople
    ? getTrendSeries(relevant, filters.cadence)
    : filters.compareName
      ? getComparisonSeries(relevant, filters.name, filters.compareName, filters.cadence)
      : getIndividualTrendSeries(relevant, filters.name, filters.cadence);
  const [visibleCount, setVisibleCount] = useState(chartData.length);
  useEffect(() => setVisibleCount(chartData.length), [chartData.length, filters.name, filters.compareName, filters.unit, filters.area, filters.position, filters.cadence]);
  const activeVisibleCount = visibleCount || chartData.length;
  const visibleData = chartData.slice(Math.max(0, chartData.length - activeVisibleCount));
  const chartVisibleData = withZeroBaseline(visibleData, ["score", "compareScore", "positionAverage"]);
  const axisMaximum = chartAxisMaximum(chartVisibleData, ["score", "compareScore", "positionAverage"]);
  const latest = visibleEvaluations.at(-1);
  const latestTrendPoint = chartData.at(-1);
  const visiblePeople = new Set(relevant.map(getEvaluationProfileKey)).size;
  useEffect(() => {
    if (fixedUnitId && filters.unit !== fixedUnitId) setFilters((current) => ({ ...current, unit: fixedUnitId, area: "", position: "", name: ALL_PEOPLE, compareName: "" }));
  }, [fixedUnitId, filters.unit]);
  useEffect(() => {
    if (fixedProfileId && filters.name !== fixedProfileId) setFilters((current) => ({ ...current, name: fixedProfileId, compareName: "" }));
  }, [filters.name, fixedProfileId]);
  useEffect(() => {
    if (fixedProfileId) return;
    if (!isAllPeople && !profileIds.includes(filters.name)) setFilters((current) => ({ ...current, name: ALL_PEOPLE }));
    if (filters.compareName && (!profileIds.includes(filters.compareName) || filters.compareName === filters.name)) setFilters((current) => ({ ...current, compareName: "" }));
  }, [filters.name, filters.compareName, fixedProfileId, isAllPeople, profileIds.length, evaluations.length]);
  useEffect(() => {
    if (!showAreaFilter && filters.area) setFilters((current) => ({ ...current, area: "", position: "", name: ALL_PEOPLE, compareName: "" }));
    if (!showPositionFilter && filters.position) setFilters((current) => ({ ...current, position: "", name: ALL_PEOPLE, compareName: "" }));
  }, [filters.area, filters.position, showAreaFilter, showPositionFilter]);
  const update = (name: keyof typeof filters, value: string) => setFilters((current) => {
    const next = { ...current, [name]: value };
    if (name === "unit") {
      next.area = "";
      next.position = "";
      next.name = ALL_PEOPLE;
      next.compareName = "";
    }
    if (name === "area") {
      next.position = "";
      next.name = ALL_PEOPLE;
      next.compareName = "";
    }
    if (name === "position") {
      next.name = ALL_PEOPLE;
      next.compareName = "";
    }
    if (name === "name" && value === ALL_PEOPLE) next.compareName = "";
    if (name === "name" && value === current.compareName) next.compareName = "";
    return next;
  });

  return <Panel className="chart-panel">
    <div className="panel-heading chart-heading"><div><p className="eyebrow">Seguimiento por perfil</p><h2>{title ?? (isAllPeople ? "Tendencia agregada de los perfiles" : "Evolución del perfil evaluado")}</h2><small className="chart-method-note">La gráfica inicia en 0 y cada corte muestra el avance proporcional contra la meta. La condición compara cortes {filters.cadence === "day" ? "diarios" : filters.cadence === "week" ? "semanales" : filters.cadence === "month" ? "mensuales" : "anuales"} consecutivos del mismo perfil.</small></div><div className="chart-heading-tools">{fixedProfileId && fixedProfileOptions.length ? <label className="chart-profile-picker"><span>Colaborador</span><select value={fixedProfileId} onChange={(event) => onFixedProfileChange?.(event.target.value)}>{fixedProfileOptions.map((profile) => <option key={profile.id} value={profile.id}>{profile.name} · {profile.positionName}</option>)}</select></label> : null}<ChartZoomControls total={chartData.length} visible={activeVisibleCount} onVisibleChange={setVisibleCount} /><span className={`trend-pill ${(latestTrendPoint?.trend ?? "Sin histórico").toLowerCase().replace(" ", "-")}`}><Icon name="chart" size={15} /> {latestTrendPoint?.trend ?? "Sin histórico"}</span></div></div>
    <div className="chart-filters">
      <label><span>Lectura de tendencia</span><select value={filters.cadence} onChange={(event) => update("cadence", event.target.value as TrendCadence)}><option value="day">Diaria</option><option value="week">Semanal</option><option value="month">Mensual</option><option value="year">Anual</option></select></label>
      {!fixedProfileId ? <label><span>Perfil evaluado</span><select value={filters.name} onChange={(event) => update("name", event.target.value)}><option value={ALL_PEOPLE}>Todos los perfiles</option>{profileOptions.map((profile) => <option key={profile.id} value={profile.id}>{profile.name} · {profile.positionName}</option>)}</select></label> : null}
      {!fixedProfileId && !isAllPeople ? <label><span>Comparar con</span><select value={filters.compareName} onChange={(event) => update("compareName", event.target.value)}><option value="">Sin comparativo</option>{profileOptions.filter((profile) => profile.id !== filters.name).map((profile) => <option key={profile.id} value={profile.id}>{profile.name} · {profile.positionName}</option>)}</select></label> : null}
      {!fixedProfileId && !fixedUnitId && <label><span>Unidad</span><select value={filters.unit} onChange={(event) => update("unit", event.target.value)}><option value="">Todas</option>{units.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}{showAreaFilter ? <label><span>Área</span><select value={filters.area} onChange={(event) => update("area", event.target.value)}><option value="">Todas</option>{availableAreas.map((area) => <option key={area}>{area}</option>)}</select></label> : null}{showPositionFilter ? <label><span>Puesto</span><select value={filters.position} onChange={(event) => update("position", event.target.value)}><option value="">Todos</option>{availablePositionGroups.map((group) => <optgroup key={group.level} label={group.level}>{group.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</optgroup>)}</select></label> : null}
    </div>
    {latest && <div className="chart-summary"><div><span>Último índice</span><strong>{latestTrendPoint?.score ?? getEvaluationTrendScore(latest)}%</strong></div><div><span>Índice anterior</span><strong>{latestTrendPoint?.previousScore === undefined ? "Sin histórico" : `${latestTrendPoint.previousScore}%`}</strong></div><div><span>Variación</span><strong>{latestTrendPoint?.delta === undefined ? "Sin comparativo" : `${latestTrendPoint.delta > 0 ? "+" : ""}${latestTrendPoint.delta} pts`}</strong></div><div><span>{isAllPeople ? "Personas visibles" : "Índice personal"}</span><strong>{isAllPeople ? visiblePeople : `${average(visibleEvaluations.map(getEvaluationTrendScore))}%`}</strong></div><div><span>Condición por tendencia</span>{latestTrendPoint?.condition ? <ConditionBadge condition={latestTrendPoint.condition} /> : <strong>Sin condición</strong>}</div></div>}
    <div className="chart-meta"><strong>{isAllPeople ? "Todos los perfiles visibles" : latest?.evaluatedPersonName ?? "Sin coincidencias"}</strong><span>{latest ? isAllPeople ? `${visibleEvaluations.length} evaluaciones · ${visiblePeople} perfiles en el filtro` : filters.compareName ? `${latest.positionName} · comparativo con ${comparisonProfileName}` : `${latest.positionName} · comparativo con promedio del puesto` : "Selecciona una unidad o guarda una evaluación"}</span></div>
    <div className="chart-wrap">{chartData.length ? <ResponsiveContainer height="100%" width="100%"><LineChart data={chartVisibleData} margin={{ bottom: 4, left: -12, right: 18, top: 12 }}><CartesianGrid stroke="#d8ddda" strokeDasharray="3 4" vertical={false} /><XAxis axisLine={false} dataKey="period" fontSize={12} stroke="#6f7b77" tickLine={false} /><YAxis axisLine={false} domain={[0, axisMaximum]} fontSize={12} stroke="#6f7b77" tickFormatter={(value) => `${value}%`} tickLine={false} width={54} /><ReferenceLine label={{ fill: "#52708b", fontSize: 11, position: "insideTopRight", value: "Meta 100%" }} stroke="#7891a7" strokeDasharray="5 5" y={100} /><Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #d8e4ef", borderRadius: 8 }} formatter={(value, name) => [`${Number(value ?? 0)}%`, name === "positionAverage" ? "Promedio del puesto" : name === "compareScore" ? comparisonProfileName : isAllPeople ? "Promedio del corte" : selectedProfileName]} labelFormatter={(_, payload) => { const point = payload[0]?.payload; return point?.isBaseline ? "Base 0 · contra meta" : `${formatChartPointDate(point?.date)} · ${point?.condition ?? ""} · ${point?.trend ?? ""}`; }} /><Legend formatter={(value) => value === "positionAverage" ? "Promedio del puesto" : value === "compareScore" ? comparisonProfileName : isAllPeople ? "Promedio por corte" : selectedProfileName} /><Line activeDot={{ r: 6 }} connectNulls dataKey="score" dot={{ r: 4 }} stroke="#0071ce" strokeWidth={3} type="monotone" />{filters.compareName && <Line activeDot={{ r: 6 }} connectNulls dataKey="compareScore" dot={{ r: 4 }} stroke="#f07c00" strokeWidth={3} type="monotone" />}{!isAllPeople && !filters.compareName && <Line dataKey="positionAverage" dot={false} stroke="#061a33" strokeDasharray="6 6" strokeWidth={2} type="monotone" />}</LineChart></ResponsiveContainer> : <div className="empty-state"><Icon name="chart" size={26} /><strong>Sin datos visibles</strong><span>Los dashboards se construyen únicamente desde evaluaciones capturadas en el filtro activo.</span></div>}</div>
  </Panel>;
}
