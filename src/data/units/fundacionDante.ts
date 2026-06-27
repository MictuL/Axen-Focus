import { createPositionId, hasOfficialKpis } from "../../lib/catalog";
import type { BusinessUnit, Kpi, Position } from "../../types";
import {
  FUNDACION_DANTE_FORMAT_DIRECTIVE,
  FUNDACION_DANTE_FORMAT_FUNDRAISING_ACTIVATIONS,
  FUNDACION_DANTE_FORMAT_SOCIAL_FINANCE,
  FUNDACION_DANTE_FORMAT_VOLUNTEERS,
} from "./fundacionDanteChecklistFormats";

export const FUNDACION_DANTE_UNIT_ID = "fundacion-dante-eludier";

export const fundacionDanteBusinessUnit: BusinessUnit = {
  id: FUNDACION_DANTE_UNIT_ID,
  name: "Fundación Dante Eludier",
  description: "Asociación civil de Axen Capital enfocada en apoyar a niñas, niños y adolescentes con discapacidad auditiva.",
  status: "active",
  createdAt: "2026-06-05",
  responsible: "Director General UDN",
  observations: "Unidad integrada con base en Guía Operativa Fundación Dante Eludier V.001 y checklist de evaluación v1.",
};

const defaults = {
  suggestedFrequency: "Mensual",
  suggestedEvidence: "Reportes de gestión, registros de beneficiarios, evidencias de campaña y documentación institucional",
  suggestedEvaluator: "Responsable directo del área",
  status: "active" as const,
  isEvaluable: true,
};

const GUIDE_VERSION = "guia-operativa-fundacion-dante-eludier-v001";
const FDE_UNIT_INDICATORS = {
  fundraising: "Cantidad de procuración de fondos",
  audiometries: "Cantidad de audiometrías realizadas",
  hearingDevices: "Cantidad de aparatos auditivos colocados",
  languageTherapies: "Cantidad de terapias de lenguaje ejecutadas",
  profitability: "Porcentaje de rentabilidad",
  satisfaction: "Porcentaje de satisfacción",
} as const;
const kpi = (name: string, description: string, measurementKind: Kpi["measurementKind"] = "rep-compliance", sourceNote?: string): Kpi => ({
  name,
  description,
  measurementKind,
  sourceNote,
});
const repCompliance = () => kpi(
  "Cumplimiento del REP",
  "% de cumplimiento del REP basado en el Focus del puesto.",
  "rep-compliance",
  "Guía Operativa FDE V.001 · Indicador de Puesto",
);
const fundraisingGoal = () => kpi(
  "Meta de procuración de fondos",
  "% de cumplimiento de la meta de procuración de fondos asignada para el periodo.",
  "goal-target",
  "Guía Operativa FDE V.001 · Indicador de Puesto medible contra meta",
);
const unitIndicator = (name: string) => kpi(
  name,
  "Indicador general de la unidad que debe leerse contra la meta definida por Dirección.",
  name.toLocaleLowerCase("es-MX").startsWith("cantidad") ? "quantity" : "unit-indicator",
  "Guía Operativa FDE V.001 · Indicador general de la unidad",
);
const physicalFormats = (...ids: string[]) => ({ physicalFormatIds: ids });
const unitLinks = (...unitIndicatorLinks: string[]) => ({ unitIndicatorLinks });

const position = (
  id: string,
  name: string,
  area: string,
  rep: string,
  kpis: Kpi[],
  overrides: Partial<Position> = {},
): Position => ({
  ...defaults,
  id: createPositionId(FUNDACION_DANTE_UNIT_ID, id),
  businessUnitId: FUNDACION_DANTE_UNIT_ID,
  area,
  name,
  rep,
  kpis,
  definitionSource: GUIDE_VERSION,
  ...overrides,
  isEvaluable: overrides.isEvaluable ?? Boolean(rep.trim() && hasOfficialKpis(kpis)),
});

export const fundacionDantePositions: Position[] = [
  position("director-general", "Director General UDN", "Dirección", "Una Unidad de Negocio en condición de poder, asegurando una cultura organizacional sólida.", [
    unitIndicator(FDE_UNIT_INDICATORS.fundraising),
    unitIndicator(FDE_UNIT_INDICATORS.audiometries),
    unitIndicator(FDE_UNIT_INDICATORS.hearingDevices),
    unitIndicator(FDE_UNIT_INDICATORS.languageTherapies),
    unitIndicator(FDE_UNIT_INDICATORS.profitability),
    unitIndicator(FDE_UNIT_INDICATORS.satisfaction),
  ], { ...physicalFormats(FUNDACION_DANTE_FORMAT_DIRECTIVE), ...unitLinks(...Object.values(FDE_UNIT_INDICATORS)) }),
  position("coordinador-procuracion-fondos", "Coordinador de Procuración de Fondos", "Procuración de Fondos", "Procuración de fondos suficientes para garantizar la sostenibilidad financiera y la expansión del impacto de la Fundación.", [
    repCompliance(),
    fundraisingGoal(),
  ], { ...physicalFormats(FUNDACION_DANTE_FORMAT_FUNDRAISING_ACTIVATIONS), ...unitLinks(FDE_UNIT_INDICATORS.fundraising, FDE_UNIT_INDICATORS.profitability) }),
  position("coordinador-responsabilidad-social", "Coordinador de Responsabilidad Social", "Responsabilidad Social", "Familias atendidas satisfactoriamente, que generan buen nombre para la UDN.", [
    repCompliance(),
  ], { ...physicalFormats(FUNDACION_DANTE_FORMAT_SOCIAL_FINANCE), ...unitLinks(FDE_UNIT_INDICATORS.audiometries, FDE_UNIT_INDICATORS.hearingDevices, FDE_UNIT_INDICATORS.languageTherapies, FDE_UNIT_INDICATORS.satisfaction) }),
  position("ejecutivo-cuentas-finanzas", "Ejecutivo de Cuentas y Finanzas", "Finanzas", "Procuración de fondos administrados y reportados con transparencia, que genera expansión de la UDN.", [
    repCompliance(),
  ], { ...physicalFormats(FUNDACION_DANTE_FORMAT_SOCIAL_FINANCE), ...unitLinks(FDE_UNIT_INDICATORS.fundraising, FDE_UNIT_INDICATORS.profitability) }),
  position("coordinador-activaciones", "Coordinador de Activaciones", "Activaciones", "Activaciones y campañas ejecutadas con calidad, que incrementan el alcance de beneficiarios.", [
    repCompliance(),
  ], { ...physicalFormats(FUNDACION_DANTE_FORMAT_FUNDRAISING_ACTIVATIONS), ...unitLinks(FDE_UNIT_INDICATORS.fundraising, FDE_UNIT_INDICATORS.satisfaction) }),
  position("voluntariado-procuracion-fondos", "Voluntariado de Procuración de Fondos", "Voluntariado", "Recursos y apoyos gestionados que contribuyan a la expansión de la Fundación.", [
    repCompliance(),
    fundraisingGoal(),
  ], { ...physicalFormats(FUNDACION_DANTE_FORMAT_VOLUNTEERS), ...unitLinks(FDE_UNIT_INDICATORS.fundraising, FDE_UNIT_INDICATORS.profitability) }),
  position("voluntariado-activaciones", "Voluntariado de Activaciones", "Voluntariado", "Campañas ejecutadas de manera eficiente, que generan demanda de los productos y servicios.", [
    repCompliance(),
  ], { ...physicalFormats(FUNDACION_DANTE_FORMAT_VOLUNTEERS), ...unitLinks(FDE_UNIT_INDICATORS.audiometries, FDE_UNIT_INDICATORS.hearingDevices, FDE_UNIT_INDICATORS.languageTherapies, FDE_UNIT_INDICATORS.satisfaction) }),
];
