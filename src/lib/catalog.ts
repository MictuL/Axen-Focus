import type { Kpi, OperationalLevel, Position } from "../types";

export const createPositionId = (businessUnitId: string, localId: string) => `${businessUnitId}:${localId}`;

export const OPERATIONAL_LEVELS: OperationalLevel[] = ["Planeación", "Supervisión", "Ejecución"];

const normalizePositionName = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-MX");

export function getOperationalLevel(position: Pick<Position, "name"> | string): OperationalLevel {
  const name = normalizePositionName(typeof position === "string" ? position : position.name);
  if (/\bdirector(?:a|es|as)?\b/.test(name)) return "Planeación";
  if (/\bgerente(?:s)?\b/.test(name) || /\bcoordinador(?:a|es|as)?\b/.test(name) || /\bejecutivo de cuentas?\b/.test(name)) return "Supervisión";
  return "Ejecución";
}

export function groupByOperationalLevel<T>(items: T[], getName: (item: T) => string) {
  return OPERATIONAL_LEVELS.map((level) => ({
    level,
    items: items
      .filter((item) => getOperationalLevel(getName(item)) === level)
      .sort((a, b) => getName(a).localeCompare(getName(b), "es")),
  })).filter((group) => group.items.length);
}

export const hasOfficialKpis = (kpis: Kpi[]) =>
  kpis.length > 0 && kpis.every((item) => item.name.trim() && item.description.trim());

export const isPositionReady = (position: Position) =>
  position.status === "active" && position.isEvaluable && Boolean(position.rep.trim()) && hasOfficialKpis(position.kpis);
