import { createPositionId, hasOfficialKpis } from "../../lib/catalog";
import type { BusinessUnit, Kpi, PhysicalChecklistFormat, Position } from "../../types";
import type { FocusDailyUnitSource } from "./focusDailySources";

export const AXEN_BROKER_UNIT_ID = "axen-broker";

type AxenBrokerPositionDefinition = {
  id: string;
  name: string;
  area: string;
  objective: string;
  description: string;
  rep: string;
  kpis: Kpi[];
  evaluator?: string;
};

const kpi = (name: string, description: string): Kpi => ({ name, description });

const definitions: AxenBrokerPositionDefinition[] = [
  {
    id: "director-general-udn",
    name: "Director General UDN",
    area: "Dirección",
    objective: "Dirigir y supervisar la estrategia integral de Axen Broker asegurando crecimiento comercial, rentabilidad, seguridad operativa, cumplimiento regulatorio y posicionamiento en el ecosistema financiero y cripto.",
    description: "Es responsable de liderar la visión estratégica de la organización asegurando el cumplimiento de los objetivos comerciales, financieros, operativos y tecnológicos, promoviendo el crecimiento sostenible y la generación de valor para inversionistas, clientes y accionistas.",
    rep: "Un broker rentable, regulatoriamente sólido, tecnológicamente confiable y en crecimiento sostenido dentro del mercado latino.",
    evaluator: "Corporativo Axen Capital",
    kpis: [
      kpi("Crecimiento institucional", "Nivel de crecimiento de usuarios, cuentas activas y volumen operado."),
      kpi("Rentabilidad institucional", "Cumplimiento de metas financieras y generación de utilidades sostenibles."),
      kpi("Cumplimiento estratégico", "Nivel de cumplimiento de objetivos, proyectos e iniciativas estratégicas."),
    ],
  },
  {
    id: "gerente-administrativo",
    name: "Gerente Administrativo",
    area: "Administración",
    objective: "Administrar los recursos financieros, administrativos y de control interno asegurando eficiencia operativa y cumplimiento de la unidad.",
    description: "Es responsable de dirigir los procesos administrativos y financieros garantizando el adecuado control de recursos, cumplimiento de obligaciones y disponibilidad de información para la toma de decisiones.",
    rep: "Una administración eficiente, controlada y sostenible que soporte el crecimiento y la estabilidad institucional.",
    kpis: [
      kpi("Control administrativo", "Nivel de cumplimiento de procesos administrativos y financieros."),
      kpi("Eficiencia financiera", "Uso adecuado y controlado de los recursos institucionales."),
      kpi("Cumplimiento organizacional", "Atención oportuna de obligaciones administrativas y corporativas."),
    ],
  },
  {
    id: "gerente-operativo",
    name: "Gerente Operativo",
    area: "Operaciones",
    objective: "Dirigir la operación integral de las plataformas y servicios garantizando continuidad, productividad y satisfacción de los usuarios.",
    description: "Es responsable de supervisar las áreas operativas y tecnológicas asegurando la correcta ejecución de los procesos relacionados con trading, plataformas digitales, atención al cliente y servicios financieros.",
    rep: "Una operación tecnológica y comercial estable, eficiente y alineada a los estándares de servicio y crecimiento del broker.",
    kpis: [
      kpi("Eficiencia operativa", "Nivel de cumplimiento de procesos y tiempos operativos establecidos."),
      kpi("Productividad institucional", "Cumplimiento de metas operativas de las áreas bajo su responsabilidad."),
      kpi("Continuidad operativa", "Disponibilidad y funcionamiento adecuado de servicios y plataformas."),
    ],
  },
  {
    id: "ejecutivo-cuentas-finanzas",
    name: "Ejecutivo de Cuentas y Finanzas",
    area: "Finanzas",
    objective: "Administrar cuentas, flujos financieros, conciliación de cuentas, pagos y control administrativo asegurando estabilidad financiera y soporte a la operación.",
    description: "Es responsable de gestionar inventarios, ingresos, egresos, presupuestos, pagos y reportes financieros garantizando control financiero, orden administrativo y disponibilidad de recursos para la operación.",
    rep: "Recursos financieros administrados con control, liquidez y cumplimiento para la continuidad operativa del corporativo.",
    evaluator: "Gerente Administrativo",
    kpis: [
      kpi("Disponibilidad financiera", "Nivel de disponibilidad de recursos financieros para garantizar la continuidad operativa."),
      kpi("Cumplimiento administrativo y contable", "Nivel de exactitud y cumplimiento en registros, conciliaciones, pagos y procesos financieros."),
      kpi("Liquidez operativa", "Capacidad financiera para cubrir oportunamente las obligaciones y necesidades operativas."),
    ],
  },
  {
    id: "analista-cuentas-finanzas",
    name: "Analista de Cuentas de Finanzas",
    area: "Finanzas",
    objective: "Ejecutar y dar seguimiento a los procesos de control, conciliación, análisis y registro financiero, garantizando integridad, confiabilidad y oportunidad de la información económica y operativa de la unidad.",
    description: "Es responsable de analizar, registrar, conciliar y monitorear las operaciones financieras, movimientos de clientes, proveedores y plataformas financieras, asegurando la correcta integración de la información financiera y el cumplimiento de los controles internos establecidos.",
    rep: "Información financiera precisa, conciliada y disponible oportunamente para soportar la operación y la toma de decisiones de Axen Broker.",
    evaluator: "Gerente Administrativo",
    kpis: [
      kpi("Calidad de información financiera", "Nivel de precisión, integridad y confiabilidad de los registros y reportes financieros generados."),
      kpi("Conciliación y control de cuentas", "Cumplimiento oportuno de conciliaciones financieras, identificación de diferencias y seguimiento hasta su regularización."),
      kpi("Oportunidad de información financiera", "Disponibilidad y entrega puntual de información financiera requerida para la operación y toma de decisiones."),
    ],
  },
  {
    id: "coordinador-riesgos",
    name: "Coordinador de Riesgos",
    area: "Riesgos",
    objective: "Gestionar los riesgos institucionales protegiendo la estabilidad, liquidez, continuidad y seguridad del broker.",
    description: "Es responsable de identificar, evaluar y monitorear riesgos asociados a la operación, inversiones, plataformas, clientes y procesos internos, proponiendo acciones preventivas y correctivas.",
    rep: "Riesgos operativos, financieros, regulatorios y tecnológicos identificados, mitigados y controlados oportunamente.",
    evaluator: "Gerente Administrativo",
    kpis: [
      kpi("Gestión integral de riesgos", "Nivel de identificación y monitoreo de riesgos relevantes."),
      kpi("Mitigación de incidentes", "Atención oportuna de eventos y vulnerabilidades detectadas."),
      kpi("Cumplimiento de controles", "Aplicación efectiva de políticas y mecanismos de control institucional."),
    ],
  },
  {
    id: "coordinador-plataformas",
    name: "Coordinador de Plataformas",
    area: "Tecnología",
    objective: "Coordinar la operación, mantenimiento y evolución de las plataformas digitales de Axen Broker garantizando disponibilidad, funcionalidad y experiencia de usuario.",
    description: "Es responsable de supervisar el funcionamiento integral de las plataformas de trading, inversión, atención al cliente y servicios digitales, asegurando la correcta ejecución de procesos, implementación de mejoras y continuidad operativa para los usuarios.",
    rep: "Plataformas digitales estables, funcionales y alineadas a las necesidades operativas y comerciales del broker.",
    evaluator: "Gerente Operativo",
    kpis: [
      kpi("Disponibilidad de plataformas", "Nivel de funcionamiento continuo y estabilidad de las plataformas digitales del broker."),
      kpi("Eficiencia operativa de plataformas", "Cumplimiento de requerimientos, mejoras y procesos operativos asociados a las plataformas."),
      kpi("Experiencia del usuario digital", "Nivel de satisfacción y funcionalidad percibida por los usuarios de las plataformas."),
    ],
  },
  {
    id: "especialista-servidores",
    name: "Especialista de Servidores",
    area: "Tecnología",
    objective: "Administrar y garantizar el funcionamiento, seguridad y capacidad de la infraestructura de servidores y servicios tecnológicos de la organización.",
    description: "Es responsable de supervisar los servidores, redes, ambientes productivos, respaldos y recursos de infraestructura tecnológica, asegurando estabilidad, seguridad de la información y continuidad de los servicios críticos de Axen Broker.",
    rep: "Infraestructura tecnológica segura, disponible y escalable que soporte la operación continua del broker.",
    evaluator: "Coordinador de Plataformas",
    kpis: [
      kpi("Disponibilidad de infraestructura", "Nivel de operación continua de servidores y servicios tecnológicos críticos."),
      kpi("Seguridad tecnológica", "Cumplimiento de controles de seguridad, respaldos y protección de la información institucional."),
      kpi("Continuidad tecnológica", "Capacidad de respuesta y recuperación ante incidentes o contingencias tecnológicas."),
    ],
  },
  {
    id: "desarrollador-quan",
    name: "Desarrollador Quan",
    area: "Tecnología",
    objective: "Diseñar y desarrollar modelos cuantitativos, algoritmos y herramientas de análisis para la organización.",
    description: "Es responsable de crear soluciones matemáticas, financieras y tecnológicas que optimicen procesos de trading, inversión y análisis de mercados.",
    rep: "Herramientas cuantitativas y soluciones analíticas que fortalezcan la operación financiera y la toma de decisiones.",
    evaluator: "Coordinador de Plataformas",
    kpis: [
      kpi("Desarrollo de modelos cuantitativos", "Cumplimiento de proyectos y soluciones analíticas especializadas."),
      kpi("Innovación tecnológica", "Generación de mejoras para procesos y plataformas financieras."),
      kpi("Calidad de soluciones implementadas", "Confiabilidad y desempeño de los desarrollos realizados."),
    ],
  },
  {
    id: "desarrollador-jr",
    name: "Desarrollador Jr",
    area: "Tecnología",
    objective: "Apoyar el desarrollo, mantenimiento y mejora continua de aplicaciones y plataformas institucionales.",
    description: "Es responsable de participar en actividades de programación, pruebas, documentación y soporte de soluciones tecnológicas para la organización.",
    rep: "Aplicaciones y funcionalidades desarrolladas conforme a las necesidades operativas y tecnológicas del negocio.",
    evaluator: "Coordinador de Plataformas",
    kpis: [
      kpi("Cumplimiento de desarrollo", "Atención de requerimientos y tareas asignadas."),
      kpi("Calidad técnica", "Apego a estándares y buenas prácticas de programación."),
      kpi("Soporte a herramientas y algoritmos", "Contribución a la estabilidad y mejora de aplicaciones institucionales."),
    ],
  },
  {
    id: "coordinador-go-pay",
    name: "Coordinador de Go Pay",
    area: "Activos Digitales",
    objective: "Coordinar la operación de procesamiento de activos digitales garantizando seguridad, precisión y cumplimiento de los niveles de servicio establecidos.",
    description: "Es responsable de supervisar la ejecución, monitoreo y control de las operaciones relacionadas con depósitos, retiros, transferencias, conversiones y procesamiento de activos digitales, asegurando la continuidad operativa y la integridad de las transacciones dentro del ecosistema de Axen Broker.",
    rep: "Procesamiento seguro, eficiente y confiable de operaciones con activos digitales.",
    evaluator: "Gerente Operativo",
    kpis: [
      kpi("Eficiencia de procesamiento cripto", "Nivel de cumplimiento y correcta ejecución de operaciones con activos digitales."),
      kpi("Seguridad transaccional", "Integridad y confiabilidad de las transacciones procesadas dentro de la plataforma."),
      kpi("Continuidad operativa de la criptoprocesadora", "Disponibilidad y funcionamiento estable de los servicios de procesamiento de activos digitales."),
    ],
  },
  {
    id: "coordinador-exchange",
    name: "Coordinador de Exchange",
    area: "Activos Digitales",
    objective: "Administrar la operación del exchange garantizando liquidez, estabilidad y experiencia positiva para los usuarios.",
    description: "Es responsable de supervisar los procesos relacionados con la compra, venta e intercambio de activos digitales dentro de la plataforma.",
    rep: "Operaciones de intercambio de activos digitales ejecutadas de forma segura, eficiente y confiable.",
    evaluator: "Gerente Operativo",
    kpis: [
      kpi("Eficiencia operativa del exchange", "Correcta ejecución de operaciones de intercambio."),
      kpi("Experiencia del usuario", "Calidad y confiabilidad del servicio brindado."),
      kpi("Continuidad de la plataforma", "Disponibilidad y estabilidad de la operación."),
    ],
  },
  {
    id: "coordinador-brokerage",
    name: "Coordinador de Brokerage",
    area: "Brokerage",
    objective: "Facilitar operaciones de inversión asegurando una experiencia segura, transparente y rentable para los clientes.",
    description: "Es responsable de coordinar y gestionar la intermediación entre inversionistas y mercados financieros, promoviendo la confianza y el crecimiento de la cartera de clientes.",
    rep: "Inversionistas conectados eficientemente con oportunidades de inversión en mercados digitales.",
    evaluator: "Gerente Operativo",
    kpis: [
      kpi("Volumen operado", "Nivel de operaciones gestionadas a través del broker."),
      kpi("Crecimiento de inversionistas", "Desarrollo y expansión de la base de usuarios activos."),
      kpi("Calidad del servicio financiero", "Experiencia y satisfacción de los inversionistas atendidos."),
    ],
  },
  {
    id: "coordinador-axen-academy",
    name: "Coordinador de Axen Academy",
    area: "Academia",
    objective: "Diseñar y desarrollar programas educativos que impulsen el conocimiento financiero y la adopción de inversiones.",
    description: "Es responsable de coordinar contenidos, capacitaciones y programas formativos relacionados con trading, inversiones y criptomonedas.",
    rep: "Usuarios capacitados para participar responsablemente en los mercados financieros y de activos digitales.",
    evaluator: "Gerente Operativo",
    kpis: [
      kpi("Participación educativa", "Nivel de operaciones gestionadas a través del broker."),
      kpi("Desarrollo de contenidos", "Generación de materiales educativos relevantes y actualizados."),
      kpi("Impacto formativo", "Contribución al aprendizaje y desarrollo financiero de los usuarios."),
    ],
  },
  {
    id: "soporte-atencion-cliente",
    name: "Soporte y Atención al Cliente",
    area: "Atención al Cliente",
    objective: "Brindar soporte y atención a usuarios garantizando una experiencia positiva, eficiente y orientada a soluciones.",
    description: "Es responsable de atender consultas, incidencias y requerimientos relacionados con cuentas, operaciones, plataformas y servicios del broker.",
    rep: "Usuarios atendidos oportunamente con soluciones efectivas que fortalezcan la confianza y permanencia en la plataforma.",
    evaluator: "Gerente Operativo",
    kpis: [
      kpi("Satisfacción del usuario", "Nivel de satisfacción respecto a la atención recibida."),
      kpi("Resolución de incidencias", "Efectividad en la solución de requerimientos y problemas reportados."),
      kpi("Oportunidad de atención", "Rapidez en la respuesta y seguimiento de solicitudes."),
    ],
  },
];

const formatId = (definition: AxenBrokerPositionDefinition) =>
  `${AXEN_BROKER_UNIT_ID}-evaluacion-${definition.id}`;

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

export const axenBrokerBusinessUnit: BusinessUnit = {
  id: AXEN_BROKER_UNIT_ID,
  name: "Axen Broker",
  description: "Intermediario de Axen Capital entre inversionistas y mercados financieros en fiat y cripto.",
  status: "active",
  createdAt: "2026-06-13",
  responsible: "Director General UDN",
  observations: "Unidad integrada desde guia_operativa_BROKER_V001 (1).pdf con 15 puestos evaluables y formatos REP/KPI oficiales.",
};

export const axenBrokerChecklistFormats: PhysicalChecklistFormat[] = definitions.map((definition, index) => ({
  id: formatId(definition),
  businessUnitId: AXEN_BROKER_UNIT_ID,
  code: `EV-AB-${String(index + 1).padStart(2, "0")}`,
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

const positionFromDefinition = (definition: AxenBrokerPositionDefinition): Position => ({
  id: createPositionId(AXEN_BROKER_UNIT_ID, definition.id),
  businessUnitId: AXEN_BROKER_UNIT_ID,
  area: definition.area,
  name: definition.name,
  rep: definition.rep,
  kpis: definition.kpis,
  physicalFormatIds: [formatId(definition)],
  suggestedFrequency: "Semanal",
  suggestedEvidence: "Reporte del periodo, bitácora operativa, tablero de plataforma y evidencia documental de los indicadores.",
  suggestedEvaluator: definition.evaluator ?? "Director General UDN",
  status: "active",
  isEvaluable: Boolean(definition.rep.trim() && hasOfficialKpis(definition.kpis)),
});

export const axenBrokerPositions: Position[] = definitions.map(positionFromDefinition);

export const axenBrokerOperationSource: FocusDailyUnitSource = {
  unitId: AXEN_BROKER_UNIT_ID,
  unitName: "Axen Broker",
  sourceFile: "guia_operativa_BROKER_V001 (1).pdf",
  positions: definitions.map((definition) => ({
    positionName: definition.name,
    objective: definition.objective,
    description: definition.description,
    rep: definition.rep,
  })),
};
