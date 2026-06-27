import { FOCUS_DAILY_COLUMNS, FOCUS_DAILY_MEASUREMENT_RULE, FOCUS_DAILY_TABLE_TITLE } from "../../lib/focusDaily";
import type { BusinessUnit, OperationFormatSet, OperationTemplate, OperationTemplateTable, Position } from "../../types";
import { AXEN_LIFE_UNIT_ID, focusDailyUnitSources, VITAL_XTATION_UNIT_ID, type FocusDailySourcePosition, type FocusDailyUnitSource } from "./focusDailySources";

const forbiddenPositionPattern = /\b(ceo|dueno|dueño|patronato)\b/i;
const positionDrivenFocusUnits = new Set(["axen-energy", "axen-health"]);

const table = (title: string, columns: string[], rowLabels?: string[], blankRows?: number): OperationTemplateTable => ({ title, columns, rowLabels, blankRows });

const normalize = (value: string) =>
  value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es-MX").replace(/[^a-z0-9]+/g, " ").trim();

const slug = (value: string) =>
  normalize(value).replace(/\s+/g, "-").replace(/^-|-$/g, "") || "puesto";

function isForbiddenPosition(value: string) {
  return forbiddenPositionPattern.test(normalize(value));
}

function findPosition(unitId: string, sourcePosition: FocusDailySourcePosition, positions: Position[]) {
  const sourceName = normalize(sourcePosition.positionName);
  const sourceRep = normalize(sourcePosition.rep);
  return positions.find((position) => position.businessUnitId === unitId && normalize(position.name) === sourceName)
    ?? positions.find((position) => position.businessUnitId === unitId && sourceRep && normalize(position.rep) === sourceRep);
}

function buildTemplate(unit: FocusDailyUnitSource, sourcePosition: FocusDailySourcePosition, linkedPosition: Position | undefined): OperationTemplate {
  const rep = sourcePosition.rep || linkedPosition?.rep || "Pendiente de REP.";
  const objective = sourcePosition.objective || linkedPosition?.rep || "Registrar el foco operativo diario del puesto.";
  const description = sourcePosition.description || "Formato diario para priorizar actividades, dar seguimiento a avance y dejar evidencia operativa por colaborador.";

  return {
    title: "Focus Diario",
    subtitle: `${sourcePosition.positionName} · Actividades del día`,
    sourceFile: unit.sourceFile,
    frequency: "Diaria",
    purpose: objective,
    objective,
    description,
    rep,
    measurementRule: FOCUS_DAILY_MEASUREMENT_RULE,
    scoreSource: "focus-daily",
    fields: ["Colaborador", "Fecha", "Indicador fundamental", "Producto diario terminado"],
    summaryFields: ["Total de actividades", "Actividades completadas", "Actividades en proceso", "Actividades pendientes", "Actividades no iniciadas", "Cumplimiento diario", "Semáforo general", "Condición de tendencia"],
    tables: [
      table(FOCUS_DAILY_TABLE_TITLE, [...FOCUS_DAILY_COLUMNS], undefined, 5),
    ],
  };
}

function getSourcePositionsForUnit(unit: FocusDailyUnitSource, positions: Position[]) {
  if (!positionDrivenFocusUnits.has(unit.unitId)) return unit.positions;
  const linkedPositions = positions.filter((position) => position.businessUnitId === unit.unitId && position.status === "active");
  if (!linkedPositions.length) return unit.positions;

  return linkedPositions.map((position) => {
    const source = unit.positions.find((candidate) => findPosition(unit.unitId, candidate, [position]));
    return source ?? {
      positionName: position.name,
      objective: position.rep,
      description: position.rep,
      rep: position.rep,
    };
  });
}

export function getFocusDailyOperationFormats(positions: Position[]): OperationFormatSet[] {
  return focusDailyUnitSources.flatMap((unit) => getSourcePositionsForUnit(unit, positions)
    .filter((sourcePosition) => !isForbiddenPosition(sourcePosition.positionName))
    .map((sourcePosition) => {
      const linkedPosition = findPosition(unit.unitId, sourcePosition, positions);
      const area = linkedPosition?.area ?? "Operación diaria";
      return {
        id: `${unit.unitId}:focus-diario:${linkedPosition?.id.split(":").at(-1) ?? slug(sourcePosition.positionName)}`,
        businessUnitId: unit.unitId,
        positionId: linkedPosition?.id,
        positionName: linkedPosition?.name ?? sourcePosition.positionName,
        area,
        formats: [{
          keyArea: "Focus diario",
          format: "Focus Diario",
          template: buildTemplate(unit, sourcePosition, linkedPosition),
        }],
      };
    }));
}

export function getFocusOnlyBusinessUnits(): BusinessUnit[] {
  return focusDailyUnitSources
    .filter((unit) => unit.unitId === AXEN_LIFE_UNIT_ID || unit.unitId === VITAL_XTATION_UNIT_ID)
    .map((unit) => ({
      id: unit.unitId,
      name: unit.unitName,
      description: unit.unitId === AXEN_LIFE_UNIT_ID
        ? "Unidad financiera de Axen Capital con puestos, REP, KPIs y formatos operativos integrados desde su guía oficial."
        : "Unidad de alimentos saludables de Axen Capital con formatos operativos Focus Diario por puesto.",
      status: "active",
      createdAt: "2026-06-09",
      responsible: "Director General UDN",
      observations: `Unidad integrada desde ${unit.sourceFile}; formatos de evaluación REP/KPI pendientes de documento oficial.`,
      ...(unit.unitId === AXEN_LIFE_UNIT_ID ? {
        observations: `Unidad integrada desde guia_operativa_axen_life_V001.pdf y ${unit.sourceFile} con 14 puestos evaluables y formatos REP/KPI oficiales.`,
      } : {}),
    }));
}

export function getFocusDailySource(unitId: string) {
  return focusDailyUnitSources.find((unit) => unit.unitId === unitId);
}

export { AXEN_LIFE_UNIT_ID, VITAL_XTATION_UNIT_ID };
