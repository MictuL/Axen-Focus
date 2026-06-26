import { createPositionId } from "../../lib/catalog";
import type { OperationFormatItem, OperationFormatSet } from "../../types";
import { AXEN_MIND_UNIT_ID } from "./axenMind";

const positionId = (id: string) => createPositionId(AXEN_MIND_UNIT_ID, id);
const items = (rows: [string, string][]): OperationFormatItem[] => rows.map(([keyArea, format]) => ({ keyArea, format }));

const operationSet = (
  id: string,
  positionName: string,
  rows: [string, string][],
  area: string,
  linkedPositionId: string,
): OperationFormatSet => ({
  id: `${AXEN_MIND_UNIT_ID}:operation:${id}`,
  businessUnitId: AXEN_MIND_UNIT_ID,
  positionId: positionId(linkedPositionId),
  positionName,
  area,
  formats: items(rows),
});

export const axenMindOperationFormats: OperationFormatSet[] = [
  operationSet("director-general", "Director General UDN", [
    ["Crecimiento institucional", "Reporte mensual de matrícula, retención y posicionamiento"],
    ["Sostenibilidad financiera", "Tablero de rentabilidad y cumplimiento presupuestal"],
    ["Cumplimiento estratégico", "Matriz de avance de objetivos institucionales"],
  ], "Dirección", "director-general"),
  operationSet("gerente-experiencia-comunidad", "Gerente de Experiencia y Comunidad", [
    ["Satisfacción de comunidad educativa", "Encuesta mensual de satisfacción a padres, alumnos y staff"],
    ["Participación estudiantil", "Registro de participación en actividades institucionales"],
    ["Convivencia escolar", "Bitácora de incidencias conductuales y seguimiento"],
  ], "Experiencia y Comunidad", "gerente-experiencia-comunidad"),
  operationSet("gerente-administrativo", "Gerente Administrativo", [
    ["Control presupuestal", "Comparativo presupuesto vs gasto real"],
    ["Eficiencia administrativa", "Checklist de procesos administrativos clave"],
    ["Salud financiera", "Reporte de liquidez, pagos y obligaciones pendientes"],
  ], "Administración", "gerente-administrativo"),
  operationSet("gerente-operativo", "Gerencia Operativa", [
    ["Continuidad operativa", "Checklist diario de operación escolar"],
    ["Mantenimiento preventivo", "Calendario y bitácora de mantenimiento preventivo"],
    ["Incidencias operativas", "Registro de fallas, responsables y tiempo de solución"],
  ], "Operaciones", "gerente-operativo"),
  operationSet("gerente-academico", "Gerencia Académica", [
    ["Desempeño académico", "Reporte de avance académico por grupo/docente"],
    ["Calidad educativa", "Encuesta de satisfacción académica"],
    ["Cumplimiento metodológico", "Checklist de planeaciones, programas y estándares"],
  ], "Académica", "gerente-academico"),
  operationSet("psicopedagogo", "Psicopedagogo", [
    ["Seguimiento psicopedagógico", "Expediente de atención y seguimiento por alumno"],
    ["Mejora conductual", "Registro de evolución conductual y adaptación escolar"],
    ["Resolución de incidencias", "Bitácora de casos psicopedagógicos y acuerdos"],
  ], "Bienestar y Acompañamiento", "psicopedagogo"),
  operationSet("enfermera", "Enfermera", [
    ["Atención médica escolar", "Bitácora de atención médica e incidencias"],
    ["Prevención de salud", "Checklist de protocolos preventivos de salud"],
    ["Control documental", "Registro de expedientes médicos y autorizaciones"],
  ], "Bienestar y Acompañamiento", "enfermera"),
  operationSet("host", "Host", [
    ["Atención inicial", "Registro de visitantes, padres y prospectos"],
    ["Canalización efectiva", "Formato de canalización y seguimiento de visitas"],
    ["Tiempo de atención", "Bitácora de tiempos de respuesta en recepción"],
  ], "Experiencia y Comunidad", "host"),
  operationSet("coordinador-estudiantil", "Coordinador Estudiantil", [
    ["Participación estudiantil", "Registro de asistencia y participación en actividades"],
    ["Disciplina y convivencia", "Reporte de incidencias disciplinarias"],
    ["Integración institucional", "Checklist de participación en cultura y valores Mind"],
  ], "Bienestar y Acompañamiento", "coordinador-estudiantil"),
  operationSet("ejecutivo-finanzas", "Ejecutivo de Cuentas de Finanzas", [
    ["Recuperación y cobranza", "Reporte de pagos, adeudos y recuperación"],
    ["Seguimiento administrativo", "Bitácora de atención a padres y convenios"],
    ["Control de cuentas", "Conciliación mensual de cuentas escolares"],
  ], "Finanzas", "ejecutivo-finanzas"),
  operationSet("coordinador-control-escolar", "Coordinador de Control Escolar", [
    ["Expedientes y registros", "Checklist de expedientes completos y actualizados"],
    ["Conversión de matrículas", "Funnel de prospectos a alumnos inscritos"],
    ["Precisión documental", "Registro de errores, correcciones e incidencias"],
  ], "Control Escolar", "coordinador-control-escolar"),
  operationSet("coordinador-servicios-generales", "Coordinador de Servicios Generales", [
    ["Condiciones de instalaciones", "Checklist diario de limpieza, orden y funcionalidad"],
    ["Cumplimiento operativo", "Programa semanal de actividades operativas"],
    ["Infraestructura", "Registro de reportes, fallas y atención de espacios"],
  ], "Operaciones", "coordinador-servicios-generales"),
  operationSet("soporte-tecnico-ti", "Soporte Técnico TI", [
    ["Disponibilidad tecnológica", "Checklist de sistemas, red y plataformas activas"],
    ["Incidencias TI", "Ticketera de soporte y tiempos de solución"],
    ["Mantenimiento tecnológico", "Bitácora de actualizaciones y mantenimiento TI"],
  ], "Tecnología", "soporte-tecnico-ti"),
  operationSet("docentes", "Docentes", [
    ["Desempeño académico del grupo", "Reporte de aprovechamiento por alumno/grupo"],
    ["Cumplimiento académico", "Checklist de planeaciones, evaluaciones y contenidos"],
    ["Experiencia educativa", "Encuesta breve de satisfacción y participación estudiantil"],
  ], "Académica", "docentes"),
  operationSet("minders", "Minders", [
    ["Seguimiento y retención", "Registro de acompañamiento y permanencia de alumnos"],
    ["Desarrollo integral", "Matriz de hábitos, habilidades y avance formativo"],
    ["Impacto metodológico", "Evaluación de talleres y dinámicas formativas"],
  ], "Académica", "minders"),
  operationSet("guardian-escolar", "Guardián Escolar", [
    ["Seguridad institucional", "Bitácora diaria de seguridad y rondines"],
    ["Protocolos de acceso", "Registro de entradas, salidas y autorizaciones"],
    ["Supervisión preventiva", "Checklist de recorridos y prevención de riesgos"],
  ], "Seguridad", "guardian-escolar"),
  operationSet("encargado-mantenimiento", "Encargado de Mantenimiento", [
    ["Mantenimiento preventivo", "Calendario de mantenimiento programado"],
    ["Resolución de fallas", "Orden de trabajo y tiempo de atención"],
    ["Disponibilidad de infraestructura", "Checklist de espacios y equipos funcionales"],
  ], "Operaciones", "encargado-mantenimiento"),
  operationSet("enlace-comercial", "Enlace Comercial", [
    ["Prospección y seguimiento", "CRM de prospectos, contacto y etapa comercial"],
    ["Conversión comercial", "Reporte de leads, visitas y cierres de matrícula"],
    ["Relación con familias", "Bitácora de seguimiento a interesados y padres"],
  ], "Comercial", "enlace-comercial"),
  operationSet("ejecutivo-cuenta-mkt", "Ejecutivo de Cuenta MKT", [
    ["Comunicación institucional", "Calendario de campañas y contenidos"],
    ["Generación de demanda", "Reporte de leads por campaña/canal"],
    ["Posicionamiento de marca", "Reporte mensual de performance digital y reputación"],
  ], "Marketing", "ejecutivo-cuenta-mkt"),
];
