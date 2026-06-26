import { createPositionId, hasOfficialKpis } from "../../lib/catalog";
import type { BusinessUnit, Kpi, Position } from "../../types";
import {
  HALCONES_FORMAT_ADMIN,
  HALCONES_FORMAT_COMMERCIAL,
  HALCONES_FORMAT_DIRECTIVE,
  HALCONES_FORMAT_OPERATIONS,
  HALCONES_FORMAT_PLAYERS,
  HALCONES_FORMAT_TECHNICAL_STAFF,
  HALCONES_FORMAT_WELLNESS,
} from "./halconesChecklistFormats";

export const HALCONES_UNIT_ID = "halcones-futbol-club";

export const halconesBusinessUnit: BusinessUnit = {
  id: HALCONES_UNIT_ID,
  name: "Halcones Fútbol Club",
  description: "Unidad deportiva de Axen Capital enfocada en operación institucional, formación y rendimiento competitivo.",
  status: "active",
  createdAt: "2026-06-02",
  responsible: "Dirección General UDN",
  observations: "Primera unidad integrada al sistema de evaluación de rendimiento.",
};

const defaults = {
  suggestedFrequency: "Mensual",
  suggestedEvidence: "Formato de campo, seguimiento operativo y evidencia documental",
  suggestedEvaluator: "Responsable directo del área",
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
  id: createPositionId(HALCONES_UNIT_ID, id),
  businessUnitId: HALCONES_UNIT_ID,
  area,
  name,
  rep,
  kpis,
  ...overrides,
  isEvaluable: overrides.isEvaluable ?? Boolean(rep.trim() && hasOfficialKpis(kpis)),
});

export const halconesPositions: Position[] = [
  position("director-general", "Director General UDN", "Dirección", "Un club consolidado, competitivo y sostenible con proyección institucional y deportiva.", [
    kpi("Consolidación integral del club", "Mide el cumplimiento global de metas deportivas, administrativas, comerciales e institucionales."),
    kpi("Sostenibilidad operativa y financiera", "Mide apego presupuestal, eficiencia de recursos y continuidad operativa."),
    kpi("Proyección institucional y deportiva", "Mide avance en reputación, profesionalización, estabilidad organizacional y crecimiento del club."),
  ], physicalFormats(HALCONES_FORMAT_DIRECTIVE)),
  position("director-deportivo", "Director Deportivo", "Deportiva", "Un modelo deportivo con alto porcentaje de partidos ganados.", [
    kpi("Efectividad competitiva del modelo deportivo", "Mide resultados deportivos, objetivos competitivos y porcentaje de partidos ganados."),
    kpi("Desarrollo y promoción de talento", "Mide jugadores desarrollados, promovidos o con avance competitivo comprobable."),
    kpi("Alineación metodológica deportiva", "Mide cumplimiento de metodología, filosofía deportiva y coherencia entre categorías."),
  ], physicalFormats(HALCONES_FORMAT_DIRECTIVE)),
  position("gerente-deportivo", "Gerente Deportivo e Inteligencia", "Deportiva", "Operaciones deportivas organizadas, funcionales y alineadas al rendimiento competitivo del club.", [
    kpi("Organización operativa deportiva", "Mide planeación, coordinación y ejecución de actividades deportivas."),
    kpi("Cumplimiento logístico deportivo", "Mide procesos deportivos realizados en tiempo, forma y sin fricciones operativas."),
    kpi("Soporte funcional al rendimiento competitivo", "Mide apoyo efectivo a cuerpos técnicos, jugadores y necesidades de competencia."),
  ], physicalFormats(HALCONES_FORMAT_DIRECTIVE)),
  position("dt-premier", "Director Técnico Premier", "Deportiva", "Un equipo competitivo de alto rendimiento con visión de ascender a la siguiente categoría.", [
    kpi("Rendimiento competitivo del equipo Premier", "Mide resultados, cumplimiento de objetivos deportivos y nivel competitivo."),
    kpi("Desarrollo integral del jugador Premier", "Mide evolución técnica, táctica, disciplinaria y comportamental."),
    kpi("Aplicación metodológica de alto rendimiento", "Mide alineación del entrenamiento, competencia y gestión del equipo al modelo institucional."),
  ], physicalFormats(HALCONES_FORMAT_DIRECTIVE)),
  position("doctor", "Doctor Deportivo", "Salud Deportiva", "Jugadores en óptimas condiciones para el rendimiento deportivo.", [
    kpi("Control médico preventivo y correctivo", "Mide seguimiento oportuno de enfermedades, lesiones e incidencias físicas."),
    kpi("Disponibilidad competitiva de jugadores", "Mide reincorporaciones, aptitud física y reducción de bajas médicas."),
    kpi("Respuesta médica oportuna y efectiva", "Mide tiempo de atención, calidad del diagnóstico y seguimiento clínico."),
  ], physicalFormats(HALCONES_FORMAT_WELLNESS)),
  position("fisioterapeuta", "Fisioterapeuta Deportivo", "Salud Deportiva", "Jugadores rehabilitados y recuperados eficientemente para su reincorporación deportiva.", [
    kpi("Eficiencia de recuperación física", "Mide porcentaje de jugadores recuperados y reincorporados exitosamente."),
    kpi("Cumplimiento del proceso de rehabilitación", "Mide ejecución de terapias, programas preventivos y seguimiento individual."),
    kpi("Prevención de recaídas", "Mide reincidencia de lesiones y efectividad del proceso fisioterapéutico."),
  ], physicalFormats(HALCONES_FORMAT_WELLNESS)),
  position("preparador-fisico", "Preparador Físico", "Deportiva", "Jugadores preparados físicamente con alto rendimiento, resistencia y condición competitiva.", [
    kpi("Condición física competitiva", "Mide rendimiento físico, resistencia, fuerza, velocidad y estado atlético."),
    kpi("Cumplimiento de planificación física", "Mide ejecución de programas físicos conforme a lo planificado."),
    kpi("Prevención física de lesiones", "Mide lesiones asociadas a carga física, fatiga o deficiencias de preparación."),
  ], physicalFormats(HALCONES_FORMAT_WELLNESS)),
  position("utileros", "Utileros", "Operación Deportiva", "Material deportivo disponible, organizado y funcional para entrenamientos y competencias.", [
    kpi("Disponibilidad funcional de utilería", "Mide si uniformes, balones y equipo están listos para entrenamientos y partidos."),
    kpi("Orden y control de inventario deportivo", "Mide organización, resguardo, control de pérdidas, daños y faltantes."),
    kpi("Eficiencia del soporte operativo", "Mide puntualidad, preparación y capacidad de respuesta ante necesidades del equipo."),
  ], physicalFormats(HALCONES_FORMAT_OPERATIONS)),
  position("auxiliar-tecnico", "Auxiliar Técnico", "Deportiva", "Apoyo operativo eficiente y alineado a la metodología del Director Técnico y del club.", [
    kpi("Eficiencia del apoyo técnico-operativo", "Mide cumplimiento de tareas en entrenamientos, partidos y sesiones."),
    kpi("Alineación táctica y metodológica", "Mide apego a instrucciones del Director Técnico y metodología del club."),
    kpi("Continuidad del soporte deportivo", "Mide capacidad de mantener orden, seguimiento y ejecución técnica sin interrupciones."),
  ], physicalFormats(HALCONES_FORMAT_TECHNICAL_STAFF)),
  position("entrenador-porteros", "Entrenador de Porteros", "Deportiva", "Porteros desarrollados técnica, física y tácticamente para el alto rendimiento competitivo.", [
    kpi("Desarrollo técnico-táctico de porteros", "Mide evolución en técnica, reacción, posicionamiento, juego aéreo y toma de decisiones."),
    kpi("Rendimiento competitivo de porteros", "Mide efectividad en competencia, intervenciones clave, errores evitables y seguridad."),
    kpi("Cumplimiento metodológico especializado", "Mide aplicación de entrenamientos específicos alineados al modelo deportivo."),
  ], physicalFormats(HALCONES_FORMAT_TECHNICAL_STAFF)),
  position("jugadores", "Jugadores", "Deportiva", "Desempeño competitivo, alineación con la visión y los valores del Club.", [
    kpi("Desempeño deportivo individual", "Mide rendimiento en entrenamientos, partidos y actividades institucionales."),
    kpi("Disciplina y compromiso institucional", "Mide asistencia, puntualidad, conducta, respeto a normas y compromiso con el club."),
    kpi("Desarrollo integral del jugador", "Mide evolución técnica, física, táctica, formativa y actitudinal."),
  ], physicalFormats(HALCONES_FORMAT_PLAYERS)),
  position("dt-tdp-varonil", "Director Técnico TDP Varonil", "Deportiva", "Un equipo formativo y competitivo alineado a la metodología deportiva institucional.", [
    kpi("Competitividad del equipo TDP Varonil", "Mide cumplimiento de resultados y objetivos deportivos."),
    kpi("Formación integral de jugadores", "Mide desarrollo técnico, táctico, competitivo y disciplinario."),
    kpi("Alineación metodológica institucional", "Mide aplicación del modelo deportivo del club en formación y competencia."),
  ], physicalFormats(HALCONES_FORMAT_DIRECTIVE)),
  position("dt-tdp-femenil", "Director Técnico TDP Femenil", "Deportiva", "Un equipo formativo y competitivo, alineado a la metodología deportiva institucional.", [
    kpi("Competitividad del equipo TDP Femenil", "Mide cumplimiento de resultados y objetivos deportivos."),
    kpi("Formación integral de jugadoras", "Mide desarrollo técnico, táctico, competitivo y disciplinario."),
    kpi("Alineación metodológica institucional", "Mide aplicación del modelo deportivo del club en formación y competencia."),
  ], physicalFormats(HALCONES_FORMAT_DIRECTIVE)),
  position("coordinador-administrativo", "Coordinador Administrativo", "Administración", "Procesos administrativos ordenados, eficientes y alineados a la operación del club.", [
    kpi("Orden administrativo institucional", "Mide control, documentación, organización y cumplimiento administrativo."),
    kpi("Eficiencia financiero-operativa", "Mide procesos administrativos ejecutados correctamente y en tiempo."),
    kpi("Soporte administrativo a la operación", "Mide calidad, oportunidad y utilidad del soporte brindado a las áreas."),
  ], physicalFormats(HALCONES_FORMAT_DIRECTIVE, HALCONES_FORMAT_ADMIN)),
  position("ejecutivo-finanzas", "Ejecutivo de Cuentas de Finanzas", "Finanzas", "Recursos financieros controlados y administrados con estabilidad y cumplimiento.", [
    kpi("Control financiero y presupuestal", "Mide exactitud, comprobación, registro y control de cuentas."),
    kpi("Cumplimiento de pagos y cobranza", "Mide seguimiento de pagos, compromisos, vencimientos y recuperación."),
    kpi("Estabilidad administrativa financiera", "Mide orden financiero, trazabilidad y cumplimiento institucional."),
  ], physicalFormats(HALCONES_FORMAT_ADMIN)),
  position("enlace-fmf", "Especialista Enlace FMF", "Administración Deportiva", "Procesos federativos gestionados correctamente y alineados a normativas oficiales.", [
    kpi("Cumplimiento federativo", "Mide trámites, registros y entregas correctas ante FMF."),
    kpi("Control documental deportivo", "Mide actualización, orden, trazabilidad y disponibilidad de documentos."),
    kpi("Alineación normativa institucional", "Mide cumplimiento de reglamentos y reducción de riesgos federativos."),
  ], physicalFormats(HALCONES_FORMAT_ADMIN)),
  position("director-operativo", "Director Operativo", "Operaciones", "Una operación eficiente, segura y funcional alineada a la operación deportiva del club.", [
    kpi("Continuidad operativa institucional", "Mide funcionamiento logístico, administrativo e infraestructura sin interrupciones."),
    kpi("Eficiencia operativa", "Mide operaciones ejecutadas en tiempo, forma y con recursos adecuados."),
    kpi("Soporte funcional a las áreas", "Mide satisfacción y resolución de necesidades deportivas y administrativas."),
  ], physicalFormats(HALCONES_FORMAT_OPERATIONS)),
  position("secretario-premier", "Secretario Técnico Premier", "Administración Deportiva", "Procesos administrativos y deportivos ejecutados con control y seguimiento eficiente.", [
    kpi("Control administrativo-deportivo del equipo Premier", "Mide registros, documentación, programación y logística."),
    kpi("Seguimiento operativo eficiente", "Mide procesos ejecutados correctamente y con trazabilidad."),
    kpi("Cumplimiento organizacional", "Mide puntualidad, orden y control de compromisos institucionales."),
  ], physicalFormats(HALCONES_FORMAT_OPERATIONS)),
  position("secretario-tdp-varonil", "Secretario Técnico TDP Varonil", "Administración Deportiva", "Procesos administrativos y deportivos ejecutados con control y seguimiento eficiente.", [
    kpi("Control administrativo-deportivo TDP Varonil", "Mide registros, documentación, programación y logística."),
    kpi("Seguimiento operativo eficiente", "Mide procesos ejecutados correctamente y con trazabilidad."),
    kpi("Cumplimiento organizacional", "Mide puntualidad, orden y control de compromisos institucionales."),
  ], physicalFormats(HALCONES_FORMAT_OPERATIONS)),
  position("secretario-tdp-femenil", "Secretario Técnico TDP Femenil", "Administración Deportiva", "Procesos administrativos y deportivos ejecutados con control y seguimiento eficiente.", [
    kpi("Control administrativo-deportivo TDP Femenil", "Mide registros, documentación, programación y logística."),
    kpi("Seguimiento operativo eficiente", "Mide procesos ejecutados correctamente y con trazabilidad."),
    kpi("Cumplimiento organizacional", "Mide puntualidad, orden y control de compromisos institucionales."),
  ], physicalFormats(HALCONES_FORMAT_OPERATIONS)),
  position("infraestructura", "Coordinador de Gestión e Infraestructura", "Infraestructura", "Instalaciones deportivas, infraestructura y equipamiento seguros y disponibles para la operación del club.", [
    kpi("Disponibilidad de instalaciones y equipamiento", "Mide porcentaje de espacios, vehículos y recursos funcionales."),
    kpi("Cumplimiento de mantenimiento preventivo y correctivo", "Mide ejecución, seguimiento y cierre de mantenimientos."),
    kpi("Seguridad y funcionalidad operativa", "Mide condiciones seguras, óptimas y listas para operación."),
  ], physicalFormats(HALCONES_FORMAT_OPERATIONS)),
  position("chofer", "Chofer", "Operaciones", "Traslados seguros, puntuales y eficientes para equipos y personal del club.", [
    kpi("Puntualidad de traslados", "Mide cumplimiento de horarios, rutas e itinerarios."),
    kpi("Seguridad operativa vehicular", "Mide incidentes, protocolos, conducción responsable y estado del vehículo."),
    kpi("Eficiencia logística del transporte", "Mide disponibilidad, orden, comunicación y cumplimiento del servicio."),
  ], physicalFormats(HALCONES_FORMAT_OPERATIONS)),
  position("campero", "Campero", "Infraestructura", "Campos funcionales y en óptimas condiciones para entrenamiento y competencias.", [
    kpi("Condición funcional de cancha", "Mide mantenimiento, estado del campo y funcionalidad deportiva."),
    kpi("Preparación operativa de campos", "Mide porcentaje de canchas listas para entrenamiento o competencia."),
    kpi("Conservación y presentación de áreas deportivas", "Mide limpieza, orden, marcaje, imagen y mantenimiento preventivo."),
  ], physicalFormats(HALCONES_FORMAT_OPERATIONS)),
  position("experiencia-cliente", "Experiencia al Cliente", "Experiencia / Comercial", "Clientes atendidos, acompañados y fidelizados alineados a la identidad y posicionamiento del club.", [
    kpi("Satisfacción y fidelización de clientes/patrocinadores", "Mide permanencia, satisfacción, recomendación y percepción del servicio."),
    kpi("Seguimiento y resolución efectiva", "Mide tiempos de respuesta, postventa, solución de incidencias y acompañamiento."),
    kpi("Vinculación comercial-comunicacional", "Mide coordinación entre comercial, marketing, operación y experiencia."),
  ], physicalFormats(HALCONES_FORMAT_COMMERCIAL)),
  position("nutriologo", "Nutriólogo Deportivo", "Salud Deportiva", "Nutrición adecuada para el alto rendimiento deportivo de los jugadores.", [
    kpi("Condición nutricional orientada al rendimiento", "Mide cumplimiento de planes y estado nutricional funcional."),
    kpi("Seguimiento nutricional efectivo", "Mide evaluaciones, monitoreos y control individual realizado."),
    kpi("Impacto nutricional en rendimiento y recuperación", "Mide mejora física, recuperación y soporte al desempeño deportivo."),
  ], physicalFormats(HALCONES_FORMAT_OPERATIONS)),
  position("psicologo", "Psicólogo Deportivo", "Salud Deportiva", "Jugadores emocionalmente fortalecidos, enfocados y alineados al alto rendimiento deportivo y humano.", [
    kpi("Bienestar emocional y motivacional", "Mide estabilidad emocional, motivación e integración del grupo."),
    kpi("Seguimiento psicológico deportivo", "Mide disponibilidad, continuidad y oportunidad de acompañamientos."),
    kpi("Fortalecimiento mental competitivo", "Mide manejo de presión, crisis, disciplina, enfoque y conducta competitiva."),
  ], physicalFormats(HALCONES_FORMAT_OPERATIONS)),
];
