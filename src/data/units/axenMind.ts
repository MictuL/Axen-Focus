import { createPositionId, hasOfficialKpis } from "../../lib/catalog";
import type { BusinessUnit, Kpi, Position } from "../../types";
import {
  AXEN_MIND_FORMAT_ACADEMIC,
  AXEN_MIND_FORMAT_COMMERCIAL,
  AXEN_MIND_FORMAT_CONTROL_FINANCE,
  AXEN_MIND_FORMAT_DIRECTIVE,
  AXEN_MIND_FORMAT_EXPERIENCE,
  AXEN_MIND_FORMAT_OPERATIONS,
  AXEN_MIND_FORMAT_WELLBEING,
} from "./axenMindChecklistFormats";

export const AXEN_MIND_UNIT_ID = "axen-mind-school";

export const axenMindBusinessUnit: BusinessUnit = {
  id: AXEN_MIND_UNIT_ID,
  name: "Axen Mind School",
  description: "Instituto educativo de nivel basico de Axen Capital enfocado en bienestar integral, aprendizaje en servicio y desarrollo evolutivo de ninos, ninas y adolescentes.",
  status: "active",
  createdAt: "2026-06-03",
  responsible: "Director General UDN",
  observations: "Unidad educativa integrada con base en Guia Operativa Axen Mind School V.001 y sistema de formatos de evaluacion REP/KPI.",
};

const defaults = {
  suggestedFrequency: "Mensual",
  suggestedEvidence: "Reportes de gestion, registros escolares, capturas de sistema y evidencia documental",
  suggestedEvaluator: "Responsable directo del area",
  status: "active" as const,
  isEvaluable: true,
};

const kpi = (name: string, description: string): Kpi => ({ name, description });
const physicalFormats = (...ids: string[]) => ({ physicalFormatIds: ids });

const position = (
  id: string,
  name: string,
  area: string,
  rep: string,
  kpis: Kpi[],
  overrides: Partial<Position> = {},
): Position => ({
  ...defaults,
  id: createPositionId(AXEN_MIND_UNIT_ID, id),
  businessUnitId: AXEN_MIND_UNIT_ID,
  area,
  name,
  rep,
  kpis,
  ...overrides,
  isEvaluable: overrides.isEvaluable ?? Boolean(rep.trim() && hasOfficialKpis(kpis)),
});

export const axenMindPositions: Position[] = [
  position("director-general", "Director General UDN", "Direccion", "Una institucion educativa sostenible, reconocida y en crecimiento constante.", [
    kpi("Crecimiento institucional", "Mide incremento en matricula, retencion y posicionamiento institucional."),
    kpi("Rentabilidad y sostenibilidad", "Mide cumplimiento financiero y estabilidad operativa de la institucion."),
    kpi("Cumplimiento estrategico institucional", "Mide avance de objetivos y metas estrategicas anuales."),
  ], physicalFormats(AXEN_MIND_FORMAT_DIRECTIVE)),
  position("gerente-experiencia-comunidad", "Gerente de Experiencia y Comunidad", "Experiencia y Comunidad", "Una comunidad estudiantil integrada, feliz y alineada a la cultura institucional.", [
    kpi("Satisfaccion de comunidad educativa", "Mide satisfaccion de alumnos, padres y comunidad educativa."),
    kpi("Participacion e integracion estudiantil", "Mide participacion en actividades y programas institucionales."),
    kpi("Incidencias conductuales y convivencia", "Mide incidencias disciplinarias, conflictos escolares y convivencia."),
  ], physicalFormats(AXEN_MIND_FORMAT_DIRECTIVE, AXEN_MIND_FORMAT_EXPERIENCE)),
  position("gerente-administrativo", "Gerente Administrativo", "Administracion", "Una administracion ordenada, eficiente y sostenible que soporte el crecimiento institucional.", [
    kpi("Control presupuestal", "Mide cumplimiento y desviacion presupuestal institucional."),
    kpi("Eficiencia administrativa", "Mide tiempo y cumplimiento de procesos administrativos clave."),
    kpi("Salud financiera operativa", "Mide liquidez y cumplimiento de obligaciones financieras."),
  ], physicalFormats(AXEN_MIND_FORMAT_DIRECTIVE)),
  position("gerente-operativo", "Gerente Operativo", "Operaciones", "Una operacion eficiente, segura y funcional.", [
    kpi("Continuidad operativa", "Mide disponibilidad y funcionamiento de instalaciones y servicios."),
    kpi("Cumplimiento de mantenimiento preventivo", "Mide mantenimientos ejecutados en tiempo y forma."),
    kpi("Incidencias operativas", "Mide fallas o incidentes operativos registrados y atendidos."),
  ], physicalFormats(AXEN_MIND_FORMAT_DIRECTIVE, AXEN_MIND_FORMAT_OPERATIONS)),
  position("gerente-academico", "Gerente Academico", "Academica", "Un modelo academico de excelencia que garantice el aprendizaje en servicio.", [
    kpi("Desempeno academico estudiantil y docente", "Mide promedio general y cumplimiento de objetivos academicos."),
    kpi("Calidad educativa", "Mide satisfaccion academica de alumnos y padres."),
    kpi("Cumplimiento metodologico", "Mide cumplimiento de programas, planeaciones y estandares academicos."),
  ], physicalFormats(AXEN_MIND_FORMAT_DIRECTIVE)),
  position("psicopedagogo", "Psicopedagogo", "Bienestar y Acompanamiento", "Una comunidad educativa libre de violencia y educada para la paz.", [
    kpi("Seguimiento psicopedagogico efectivo", "Mide alumnos atendidos y con seguimiento activo."),
    kpi("Mejora conductual y adaptacion escolar", "Mide mejora en conducta, integracion y adaptacion escolar."),
    kpi("Atencion y resolucion de incidencias", "Mide tiempo y efectividad en atencion de casos psicopedagogicos."),
  ], physicalFormats(AXEN_MIND_FORMAT_WELLBEING)),
  position("enfermera", "Enfermera", "Bienestar y Acompanamiento", "Estudiantes atendidos oportunamente con seguridad, prevencion y bienestar fisico dentro del entorno escolar.", [
    kpi("Tiempo de atencion medica", "Mide tiempo promedio de respuesta ante incidencias medicas."),
    kpi("Control preventivo de salud", "Mide seguimiento y cumplimiento de protocolos preventivos."),
    kpi("Registro y control de incidencias", "Mide control y documentacion de incidencias medicas escolares."),
  ], physicalFormats(AXEN_MIND_FORMAT_WELLBEING)),
  position("host", "Host", "Experiencia y Comunidad", "Prospectos y visitantes atendidos optimamente, alineados a los protocolos de institucion.", [
    kpi("Satisfaccion de atencion inicial", "Mide satisfaccion de visitantes y prospectos."),
    kpi("Canalizacion efectiva", "Mide visitantes correctamente dirigidos y atendidos."),
    kpi("Tiempo de atencion y recepcion", "Mide tiempo promedio de atencion y respuesta en recepcion."),
  ], physicalFormats(AXEN_MIND_FORMAT_EXPERIENCE)),
  position("coordinador-estudiantil", "Coordinador Estudiantil", "Bienestar y Acompanamiento", "Estudiantes integrados, participativos y alineados a la cultura institucional.", [
    kpi("Participacion estudiantil", "Mide participacion en actividades y programas escolares."),
    kpi("Disciplina y convivencia", "Mide incidencias disciplinarias y cumplimiento normativo."),
    kpi("Integracion institucional", "Mide alineacion y participacion estudiantil en cultura institucional."),
  ], physicalFormats(AXEN_MIND_FORMAT_WELLBEING)),
  position("ejecutivo-finanzas", "Ejecutivo de Cuentas de Finanzas", "Finanzas", "Libros, cuentas y reportes generados y entregados en tiempo y forma.", [
    kpi("Recuperacion y cobranza", "Mide colegiaturas y pagos recuperados en tiempo."),
    kpi("Seguimiento administrativo", "Mide atencion y seguimiento economico administrativo a padres de familia."),
    kpi("Control de cuentas", "Mide cuentas actualizadas y conciliadas correctamente."),
  ], physicalFormats(AXEN_MIND_FORMAT_CONTROL_FINANCE)),
  position("coordinador-control-escolar", "Coordinador de Control Escolar", "Control Escolar", "Informacion academica y administrativa organizada, actualizada y controlada en tiempo y forma.", [
    kpi("Cumplimiento administrativo y actualizacion documental", "Mide expedientes y registros actualizados correctamente."),
    kpi("Tasa de conversion de matriculas", "Mide conversion de prospectos a alumnos."),
    kpi("Precision de informacion", "Mide errores o incidencias en documentacion y registros."),
  ], physicalFormats(AXEN_MIND_FORMAT_CONTROL_FINANCE)),
  position("coordinador-servicios-generales", "Coordinador de Servicios Generales", "Operaciones", "Instalaciones funcionales, limpias y seguras para la operacion educativa.", [
    kpi("Condiciones de instalaciones", "Mide limpieza, orden y funcionalidad de espacios."),
    kpi("Cumplimiento operativo diario", "Mide actividades operativas ejecutadas conforme a programacion."),
    kpi("Incidencias de infraestructura", "Mide reportes o fallas operativas detectadas, registradas y atendidas."),
  ], physicalFormats(AXEN_MIND_FORMAT_OPERATIONS)),
  position("soporte-tecnico-ti", "Soporte Tecnico TI", "Tecnologia", "Infraestructura tecnologica funcional, segura y disponible para la operacion academica y administrativa.", [
    kpi("Disponibilidad tecnologica", "Mide funcionamiento de sistemas y plataformas."),
    kpi("Tiempo de solucion de incidencias TI", "Mide tiempo promedio de atencion y resolucion tecnologica."),
    kpi("Mantenimiento y actualizacion tecnologica", "Mide mantenimientos y actualizaciones ejecutadas."),
  ], physicalFormats(AXEN_MIND_FORMAT_OPERATIONS)),
  position("docentes", "Docentes", "Academica", "Estudiantes formados con aprendizaje al servicio, competencias y desarrollo integral.", [
    kpi("Desempeno academico del grupo", "Mide aprovechamiento y cumplimiento academico estudiantil."),
    kpi("Cumplimiento academico", "Mide planeaciones, evaluaciones y contenidos ejecutados."),
    kpi("Experiencia educativa", "Mide satisfaccion y participacion de los estudiantes."),
  ], physicalFormats(AXEN_MIND_FORMAT_ACADEMIC)),
  position("minders", "Minders", "Academica", "Estudiantes acompanados en su desarrollo integral y formativo.", [
    kpi("Seguimiento y retencion de alumnos", "Mide permanencia de alumnos y seguimiento activo."),
    kpi("Desarrollo de habilidades y habitos", "Mide avance en habitos, habilidades y desempeno integral."),
    kpi("Impacto metodologico", "Mide efectividad de talleres y dinamicas formativas."),
  ], physicalFormats(AXEN_MIND_FORMAT_ACADEMIC)),
  position("guardian-escolar", "Guardian Escolar", "Seguridad", "Comunidad estudiantil resguardada en un entorno seguro, ordenado y bajo control institucional.", [
    kpi("Control y seguridad institucional", "Mide incidencias de riesgo y disciplina."),
    kpi("Cumplimiento de protocolos de acceso", "Mide cumplimiento de protocolos de seguridad y control."),
    kpi("Supervision preventiva", "Mide recorridos, monitoreo y prevencion realizados."),
  ], physicalFormats(AXEN_MIND_FORMAT_OPERATIONS)),
  position("encargado-mantenimiento", "Encargado de Mantenimiento", "Operaciones", "Infraestructura y equipos funcionales, seguros y en optimas condiciones.", [
    kpi("Cumplimiento de mantenimiento preventivo", "Mide mantenimientos realizados conforme a programacion."),
    kpi("Tiempo de resolucion de fallas", "Mide tiempo promedio de atencion y correccion de incidencias."),
    kpi("Disponibilidad de infraestructura", "Mide espacios y equipos funcionando correctamente."),
  ], physicalFormats(AXEN_MIND_FORMAT_OPERATIONS)),
  position("enlace-comercial", "Enlace Comercial", "Comercial", "Una institucion educativa sostenible, reconocida y en crecimiento constante.", [
    kpi("Seguimiento a prospectos e inscripciones", "Mide seguimiento activo y conversion de prospectos a inscripciones."),
    kpi("Vinculacion con aliados y comunidad", "Mide acciones de vinculacion con aliados, escuelas o comunidad."),
    kpi("Generacion de prospectos", "Mide prospectos generados por acciones comerciales."),
  ], physicalFormats(AXEN_MIND_FORMAT_COMMERCIAL)),
  position("ejecutivo-cuenta-mkt", "Ejecutivo de Cuenta MKT", "Marketing", "Una institucion educativa sostenible, reconocida y en crecimiento constante.", [
    kpi("Cumplimiento de campanas y contenidos", "Mide entregables de campana, contenidos y solicitudes de otras areas."),
    kpi("Generacion de prospectos", "Mide leads generados contra la meta del periodo."),
    kpi("Posicionamiento institucional", "Mide presencia institucional, alcance y alineacion de marca."),
  ], physicalFormats(AXEN_MIND_FORMAT_COMMERCIAL)),
];
