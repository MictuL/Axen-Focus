import { createPositionId, hasOfficialKpis } from "../../lib/catalog";
import type { Kpi, PhysicalChecklistFormat, Position } from "../../types";
import { AXEN_LIFE_UNIT_ID } from "./focusDailySources";

type AxenLifePositionDefinition = {
  id: string;
  name: string;
  area: string;
  rep: string;
  kpis: Kpi[];
  evaluator?: string;
};

const kpi = (name: string, description: string): Kpi => ({ name, description });

const definitions: AxenLifePositionDefinition[] = [
  {
    id: "comisario",
    name: "Comisario",
    area: "Gobierno Corporativo",
    rep: "Una institución supervisada, transparente, alineada al objeto social y operando conforme al marco legal y regulatorio aplicable.",
    evaluator: "Corporativo Axen Capital",
    kpis: [
      kpi("Vigilancia y cumplimiento institucional", "Nivel de supervisión y seguimiento al cumplimiento de obligaciones legales, regulatorias y corporativas de la institución."),
      kpi("Observaciones y recomendaciones atendidas", "Grado de atención y corrección de observaciones emitidas derivadas de revisiones y actividades de vigilancia."),
      kpi("Fortalecimiento del gobierno corporativo", "Nivel de contribución al cumplimiento de prácticas de control, transparencia, rendición de cuentas y supervisión institucional."),
    ],
  },
  {
    id: "director-general-udn",
    name: "Director General UDN",
    area: "Dirección",
    rep: "Una SOFIPO rentable, sostenible, regulatoriamente sólida y en crecimiento continuo.",
    evaluator: "Corporativo Axen Capital",
    kpis: [
      kpi("Crecimiento institucional", "Nivel de crecimiento de cartera, captación y clientes."),
      kpi("Rentabilidad institucional", "Cumplimiento de metas financieras y generación de utilidades."),
      kpi("Cumplimiento estratégico", "Nivel de cumplimiento de objetivos y proyectos estratégicos institucionales."),
    ],
  },
  {
    id: "oficial-cumplimiento",
    name: "Oficial de Cumplimiento",
    area: "Cumplimiento",
    rep: "Una institución alineada al marco regulatorio y libre de riesgos de incumplimiento.",
    kpis: [
      kpi("Cumplimiento regulatorio", "Nivel de cumplimiento de obligaciones regulatorias aplicables."),
      kpi("Riesgos de cumplimiento", "Incidencias regulatorias identificadas y atendidas oportunamente."),
      kpi("Prevención de lavado de dinero", "Cumplimiento de procesos de monitoreo y control PLD/FT."),
    ],
  },
  {
    id: "director-operativo",
    name: "Director Operativo",
    area: "Operaciones",
    rep: "Una operación eficiente, segura, rentable y alineada a la estrategia institucional.",
    kpis: [
      kpi("Eficiencia operativa", "Cumplimiento de procesos y tiempos operativos."),
      kpi("Productividad institucional", "Nivel de cumplimiento de metas operativas de las áreas bajo su cargo."),
      kpi("Continuidad operativa", "Disponibilidad y funcionamiento adecuado de los procesos críticos."),
    ],
  },
  {
    id: "asesor-comercial",
    name: "Asesor Comercial",
    area: "Comercial",
    rep: "Incremento sostenible de cartera y captación mediante la generación y fidelización de nuevos clientes.",
    kpis: [
      kpi("Colocación de productos", "Cumplimiento de metas de colocación financiera."),
      kpi("Captación de clientes", "Generación de nuevos clientes y cuentas activas."),
      kpi("Calidad comercial", "Calidad y permanencia de la cartera generada."),
    ],
  },
  {
    id: "gerente-sucursal",
    name: "Gerente de Sucursal",
    area: "Operaciones",
    rep: "Una sucursal rentable, eficiente y alineada a los objetivos institucionales.",
    kpis: [
      kpi("Rentabilidad de sucursal", "Cumplimiento de metas financieras y comerciales."),
      kpi("Calidad de servicio", "Nivel de satisfacción de clientes de la sucursal."),
      kpi("Productividad operativa", "Cumplimiento de indicadores operativos y administrativos."),
    ],
  },
  {
    id: "gerente-credito",
    name: "Gerente de Crédito",
    area: "Crédito y Cobranza",
    rep: "Una cartera de crédito rentable, sana y con riesgo controlado.",
    kpis: [
      kpi("Satisfacción del cliente", "Nivel de satisfacción de usuarios atendidos."),
      kpi("Tiempo de atención", "Oportunidad en la resolución de solicitudes."),
      kpi("Gestión de incidencias", "Resolución efectiva de quejas y reclamaciones."),
    ],
  },
  {
    id: "analista-credito",
    name: "Analista de Crédito",
    area: "Crédito y Cobranza",
    rep: "Información financiera y crediticia confiable para la toma de decisiones.",
    kpis: [
      kpi("Calidad de análisis", "Precisión de evaluaciones realizadas."),
      kpi("Tiempo de respuesta", "Oportunidad en la emisión de análisis y dictámenes."),
      kpi("Cumplimiento documental", "Integridad de expedientes analizados."),
    ],
  },
  {
    id: "especialista-cobranza",
    name: "Especialista de Cobranza",
    area: "Crédito y Cobranza",
    rep: "Recuperación eficiente de cartera y reducción de morosidad.",
    kpis: [
      kpi("Recuperación de cartera", "Nivel de recuperación de saldos vencidos."),
      kpi("Morosidad", "Control de cuentas vencidas."),
      kpi("Efectividad de gestión", "Cumplimiento de compromisos de pago obtenidos."),
    ],
  },
  {
    id: "ejecutivo-atencion-finanzas",
    name: "Ejecutivo de Atención al Cliente - Área Finanzas",
    area: "Atención al Cliente",
    rep: "Clientes atendidos oportunamente en sus requerimientos financieros.",
    kpis: [
      kpi("Satisfacción del cliente", "Nivel de satisfacción de los clientes respecto a la atención y solución de sus requerimientos financieros."),
      kpi("Oportunidad de atención", "Tiempo y eficiencia en la atención y seguimiento de solicitudes financieras."),
      kpi("Resolución efectiva de casos", "Nivel de solución de aclaraciones, trámites y requerimientos financieros sin reincidencias."),
    ],
  },
  {
    id: "ejecutivo-atencion-tecnologia",
    name: "Ejecutivo de Atención al Cliente - Área Tecnología",
    area: "Atención al Cliente",
    rep: "Clientes con acceso continuo, seguro y funcional a los servicios tecnológicos de la institución.",
    kpis: [
      kpi("Satisfacción del cliente", "Nivel de satisfacción de los clientes respecto a la atención y soporte tecnológico recibido."),
      kpi("Atención de incidencias tecnológicas", "Eficiencia en la gestión y seguimiento de problemas reportados por los usuarios."),
      kpi("Resolución efectiva de requerimientos", "Nivel de solución de solicitudes tecnológicas en el primer ciclo de atención."),
    ],
  },
  {
    id: "ejecutivo-soporte-asesores",
    name: "Ejecutivo de Soporte para Asesores Comerciales",
    area: "Comercial",
    rep: "Asesores comerciales respaldados con atención, seguimiento y soporte oportuno que faciliten la colocación de productos financieros.",
    kpis: [
      kpi("Atención y soporte a asesores comerciales", "Nivel de oportunidad y calidad en la atención de requerimientos, solicitudes y necesidades operativas de los asesores comerciales."),
      kpi("Eficiencia en la gestión de procesos comerciales", "Nivel de cumplimiento y seguimiento oportuno de los procesos administrativos y operativos que respaldan la gestión comercial de la sucursal."),
      kpi("Resolución efectiva de requerimientos", "Nivel de satisfacción de los asesores comerciales respecto al apoyo recibido."),
    ],
  },
  {
    id: "ejecutivo-cuentas-finanzas",
    name: "Ejecutivo de Cuentas y Finanzas",
    area: "Finanzas",
    rep: "Recursos financieros administrados con control, liquidez y cumplimiento para la continuidad operativa del corporativo.",
    kpis: [
      kpi("Disponibilidad financiera", "Nivel de disponibilidad de recursos financieros para garantizar la continuidad operativa."),
      kpi("Cumplimiento administrativo y contable", "Nivel de exactitud y cumplimiento en registros, conciliaciones, pagos y procesos financieros."),
      kpi("Liquidez operativa", "Capacidad financiera para cubrir oportunamente las obligaciones y necesidades operativas."),
    ],
  },
  {
    id: "cajero",
    name: "Cajero",
    area: "Operaciones",
    rep: "Operaciones de caja seguras, exactas y oportunas.",
    kpis: [
      kpi("Exactitud operativa", "Correcta ejecución de transacciones."),
      kpi("Servicio al cliente", "Calidad y rapidez en la atención."),
      kpi("Control de efectivo", "Resguardo y manejo adecuado de valores."),
    ],
  },
];

const formatId = (definition: AxenLifePositionDefinition) =>
  `${AXEN_LIFE_UNIT_ID}-evaluacion-${definition.id}`;

const physicalFields = [
  "Unidad de Negocio",
  "Área",
  "Puesto Evaluado",
  "Nombre del Evaluado",
  "Evaluador",
  "Periodo Evaluado",
  "Fecha de Evaluación",
  "Folio",
];

export const axenLifeChecklistFormats: PhysicalChecklistFormat[] = definitions.map((definition, index) => ({
  id: formatId(definition),
  businessUnitId: AXEN_LIFE_UNIT_ID,
  code: `EV-AL-${String(index + 1).padStart(2, "0")}`,
  title: `Evaluación - ${definition.name}`,
  frequency: "Semanal",
  evaluator: definition.evaluator ?? "Director General UDN",
  appliesTo: [definition.name],
  repInstruction: `REP: ${definition.rep}`,
  fields: physicalFields,
  checklist: definition.kpis.map((item) => ({
    indicator: item.name,
    aspect: item.description,
    evidence: "Evidencia documental del periodo vinculada al indicador y validada por el evaluador.",
  })),
}));

const positionFromDefinition = (definition: AxenLifePositionDefinition): Position => ({
  id: createPositionId(AXEN_LIFE_UNIT_ID, definition.id),
  businessUnitId: AXEN_LIFE_UNIT_ID,
  area: definition.area,
  name: definition.name,
  rep: definition.rep,
  kpis: definition.kpis,
  physicalFormatIds: [formatId(definition)],
  suggestedFrequency: "Semanal",
  suggestedEvidence: "Reporte del periodo, expediente, tablero operativo y evidencia documental de los indicadores.",
  suggestedEvaluator: definition.evaluator ?? "Director General UDN",
  status: "active",
  isEvaluable: Boolean(definition.rep.trim() && hasOfficialKpis(definition.kpis)),
});

export const axenLifePositions: Position[] = definitions.map(positionFromDefinition);
