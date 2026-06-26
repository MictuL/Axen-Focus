import { createPositionId, hasOfficialKpis } from "../../lib/catalog";
import type { BusinessUnit, Kpi, PhysicalChecklistFormat, Position } from "../../types";

type UnitDefinition = {
  id: string;
  name: string;
  description: string;
  responsible?: string;
  observations: string;
};

const forbiddenPositionPattern = /\b(ceo|dueno|dueño|patronato)\b/i;

const normalize = (value: string) =>
  value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es-MX");

const slug = (value: string) =>
  normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "puesto";

const kpi = (name: string, description: string): Kpi => ({ name, description });

function areaFromFormat(format: PhysicalChecklistFormat) {
  const text = normalize(`${format.title} ${format.evaluator}`);
  if (text.includes("directiv") || text.includes("gerencial")) return "Dirección";
  if (text.includes("comercial") || text.includes("experiencia") || text.includes("atencion")) return "Comercial / Experiencia";
  if (text.includes("finanza") || text.includes("credito") || text.includes("cobranza")) return "Finanzas / Administración";
  if (text.includes("academ")) return "Académica";
  if (text.includes("bienestar") || text.includes("salud")) return "Bienestar";
  if (text.includes("juridic")) return "Jurídico";
  if (text.includes("produccion") || text.includes("operativ") || text.includes("construccion")) return "Operaciones";
  return "Operación";
}

function kpisFromFormat(format: PhysicalChecklistFormat) {
  const byIndicator = new Map<string, string>();
  format.checklist.forEach((item) => {
    if (!byIndicator.has(item.indicator)) byIndicator.set(item.indicator, item.aspect);
  });
  return Array.from(byIndicator.entries()).slice(0, 3).map(([name, description]) => kpi(name, description));
}

export function businessUnitFromEvaluationDocument(definition: UnitDefinition): BusinessUnit {
  return {
    id: definition.id,
    name: definition.name,
    description: definition.description,
    status: "active",
    createdAt: "2026-06-08",
    responsible: definition.responsible ?? "Director General UDN",
    observations: definition.observations,
  };
}

export function positionsFromEvaluationDocuments(unitId: string, formats: PhysicalChecklistFormat[]) {
  const byName = new Map<string, Position>();
  formats.forEach((format) => {
    format.appliesTo.filter((name) => !forbiddenPositionPattern.test(name)).forEach((name) => {
      const existing = byName.get(name);
      const physicalFormatIds = existing?.physicalFormatIds?.includes(format.id)
        ? existing.physicalFormatIds
        : [...(existing?.physicalFormatIds ?? []), format.id];
      const kpis = existing?.kpis.length ? existing.kpis : kpisFromFormat(format);
      const rep = existing?.rep || format.repInstruction.replace(/^REP:\s*/i, "");
      byName.set(name, {
        id: createPositionId(unitId, slug(name)),
        businessUnitId: unitId,
        area: existing?.area ?? areaFromFormat(format),
        name,
        rep,
        kpis,
        physicalFormatIds,
        suggestedFrequency: format.frequency,
        suggestedEvidence: "Checklist REP/KPI oficial por puesto y evidencia documental del periodo",
        suggestedEvaluator: format.evaluator,
        status: "active",
        isEvaluable: Boolean(rep.trim() && hasOfficialKpis(kpis)),
      });
    });
  });
  return Array.from(byName.values());
}
