import { createPositionId, hasOfficialKpis } from "../../lib/catalog";
import type { BusinessUnit, Kpi, Position } from "../../types";
import { getEvaluationDocumentFormats } from "./evaluationDocumentFormats";

export const AXEN_ENERGY_UNIT_ID = "axen-energy";
export const AXEN_HEALTH_UNIT_ID = "axen-health";

type GuidePositionDefinition = {
  slug: string;
  name: string;
  area: string;
  rep: string;
  aliases?: string[];
};

const normalize = (value: string) =>
  value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es-MX");

const kpi = (name: string, description: string): Kpi => ({ name, description });

function formatIdsFor(unitId: string, name: string, aliases: string[] = []) {
  const targets = new Set([name, ...aliases].map(normalize));
  return getEvaluationDocumentFormats(unitId)
    .filter((format) => format.appliesTo.some((item) => targets.has(normalize(item))))
    .map((format) => format.id);
}

function positionFromGuide(unitId: string, definition: GuidePositionDefinition): Position {
  const kpis = [
    kpi("Cumplimiento del REP", `% de cumplimiento del REP basado en el Focus Diario de ${definition.name}.`),
  ];
  const physicalFormatIds = formatIdsFor(unitId, definition.name, definition.aliases);
  return {
    id: createPositionId(unitId, definition.slug),
    businessUnitId: unitId,
    area: definition.area,
    name: definition.name,
    rep: definition.rep,
    kpis,
    physicalFormatIds,
    suggestedFrequency: "Diaria / Semanal",
    suggestedEvidence: "Focus Diario, seguimiento operativo y evidencia documental del REP.",
    suggestedEvaluator: "Responsable directo del área",
    status: "active",
    isEvaluable: Boolean(definition.rep.trim() && hasOfficialKpis(kpis)),
  };
}

function businessUnit(id: string, name: string, description: string, observations: string): BusinessUnit {
  return {
    id,
    name,
    description,
    status: "active",
    createdAt: "2026-06-17",
    responsible: "Director General UDN",
    observations,
  };
}

export const axenEnergyBusinessUnit = businessUnit(
  AXEN_ENERGY_UNIT_ID,
  "Axen Energy",
  "Unidad de energía limpia y renovable de Axen Capital.",
  "Unidad integrada desde guia_operativa_axen_energy_V001.pdf con organigrama, REP y Focus Diario por puesto.",
);

export const axenHealthBusinessUnit = businessUnit(
  AXEN_HEALTH_UNIT_ID,
  "Axen Health",
  "Centro de bienestar integral de Axen Capital.",
  "Unidad integrada desde guia_operativa_axen_health_V001.pdf con organigrama, REP y Focus Diario por puesto.",
);

const axenEnergyGuidePositions: GuidePositionDefinition[] = [
  {
    slug: "director-general",
    name: "Director General UDN",
    area: "Dirección",
    rep: "Una Unidad de Negocio en condición de poder, asegurando una cultura organizacional sólida.",
  },
  {
    slug: "gerente-productos",
    name: "Gerente de Productos",
    area: "Productos",
    rep: "Un portafolio de productos innovadores, viables y alineados a las necesidades del mercado que impulse el crecimiento, diferenciación y competitividad de la organización.",
    aliases: ["Gerente de Desarrollo de Negocios"],
  },
  {
    slug: "coordinador-alianzas",
    name: "Coordinador de Alianzas",
    area: "Desarrollo comercial",
    rep: "Alianzas estratégicas activas que generen oportunidades comerciales y crecimiento de la UDN.",
    aliases: ["Coordinador de Alianzas Comerciales"],
  },
  {
    slug: "coordinador-b2b",
    name: "Coordinador B2B",
    area: "Desarrollo comercial",
    rep: "Empresas prospectadas y convertidas en clientes que incrementan la rentabilidad de la UDN.",
  },
  {
    slug: "coordinador-b2c",
    name: "Coordinador B2C",
    area: "Desarrollo comercial",
    rep: "Prospectos convertidos en clientes que incrementan la rentabilidad de la UDN.",
  },
  {
    slug: "ejecutivo-cuentas-finanzas",
    name: "Ejecutivo de Cuentas de Finanzas",
    area: "Finanzas",
    rep: "Cuentas administradas y reportadas con transparencia, que genera expansión de la UDN.",
  },
  {
    slug: "coordinador-investigacion-desarrollo",
    name: "Coordinador de Investigación y Desarrollo",
    area: "Investigación y Desarrollo",
    rep: "Propuestas viables, innovadoras, eficientes y alineadas a la evolución tecnológica del mercado, que incrementan el portafolio de productos de la UDN.",
    aliases: ["Coordinador I+D"],
  },
  {
    slug: "gerente-operativo",
    name: "Gerente Operativo",
    area: "Operación",
    rep: "Una operación eficiente y alineada, que optimiza el desempeño de la UDN.",
  },
  {
    slug: "servicio-cliente",
    name: "Servicio al Cliente",
    area: "Atención al Cliente",
    rep: "Clientes atendidos oportunamente, satisfechos y fidelizados mediante una experiencia de valor.",
    aliases: ["Experiencia al Cliente"],
  },
  {
    slug: "coordinador-mantenimiento-correccion",
    name: "Coordinador de Mantenimiento y Corrección",
    area: "Mantenimiento",
    rep: "Sistemas energéticos funcionales, seguros y operando efectivamente, que garantizan la satisfacción del cliente.",
  },
];

const axenHealthGuidePositions: GuidePositionDefinition[] = [
  {
    slug: "director-general",
    name: "Director General UDN",
    area: "Dirección",
    rep: "Una Unidad de Negocio en condición de poder, asegurando una cultura organizacional sólida.",
  },
  {
    slug: "gerente-administrativo",
    name: "Gerente Administrativo",
    area: "Administración",
    rep: "Una administración ordenada y eficiente, que soporte el crecimiento de la UDN.",
  },
  {
    slug: "gerente-operativo",
    name: "Gerente Operativo",
    area: "Operación",
    rep: "Una operación eficiente y alineada, que optimiza el desempeño de la UDN.",
  },
  {
    slug: "servicio-cliente",
    name: "Servicio al Cliente",
    area: "Servicio",
    rep: "Clientes totalmente satisfechos con seguimiento oportuno que garantiza los estándares de servicio de la UDN.",
  },
  {
    slug: "host",
    name: "Host",
    area: "Servicio",
    rep: "Conversión de prospectos a clientes que garantizan la rentabilidad de la UDN.",
  },
  {
    slug: "ejecutivo-cuentas-finanzas",
    name: "Ejecutivo de Cuentas de Finanzas",
    area: "Finanzas",
    rep: "Cuentas administradas y reportadas con transparencia, que genera expansión de la UDN.",
  },
  {
    slug: "coordinador-servicios-produccion",
    name: "Coordinador de Servicios de Producción",
    area: "Servicios de Producción",
    rep: "Infraestructura y equipos disponibles, en óptimas condiciones que facilitan la operación de la UDN.",
  },
  {
    slug: "coordinador-produccion",
    name: "Coordinador de Producción",
    area: "Producción",
    rep: "Coaches y especialistas productivos, éticos y organizados, que fortalecen el posicionamiento y expansión de la UDN.",
  },
  {
    slug: "coach-interno",
    name: "Coach Interno",
    area: "Producción",
    rep: "Sesiones ejecutadas con calidad y puntualidad, para incrementar la afluencia de usuarios.",
    aliases: ["Especialista Interno"],
  },
  {
    slug: "especialista-externo",
    name: "Especialista Externo",
    area: "Producción",
    rep: "Sesiones ejecutadas con calidad y puntualidad, para incrementar la afluencia de usuarios.",
  },
];

export const axenEnergyPositions = axenEnergyGuidePositions.map((definition) =>
  positionFromGuide(AXEN_ENERGY_UNIT_ID, definition),
);

export const axenHealthPositions = axenHealthGuidePositions.map((definition) =>
  positionFromGuide(AXEN_HEALTH_UNIT_ID, definition),
);
