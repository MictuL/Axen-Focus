import { createPositionId } from "../../lib/catalog";
import type { OperationFormatItem, OperationFormatSet } from "../../types";
import { HALCONES_UNIT_ID } from "./halcones";

const positionId = (id: string) => createPositionId(HALCONES_UNIT_ID, id);
const items = (rows: [string, string][]): OperationFormatItem[] => rows.map(([keyArea, format]) => ({ keyArea, format }));

const operationSet = (
  id: string,
  positionName: string,
  rows: [string, string][],
  area?: string,
  linkedPositionId?: string,
): OperationFormatSet => ({
  id: `${HALCONES_UNIT_ID}:operation:${id}`,
  businessUnitId: HALCONES_UNIT_ID,
  positionId: linkedPositionId ? positionId(linkedPositionId) : undefined,
  positionName,
  area,
  formats: items(rows),
});

export const halconesOperationFormats: OperationFormatSet[] = [
  operationSet("director-general", "Director General UDN", [
    ["Cumplimiento integral", "Reporte Ejecutivo General del Club"],
    ["Sostenibilidad operativa-financiera", "Tablero de Presupuesto y Eficiencia"],
    ["Crecimiento institucional", "Plan de Profesionalización y Consolidación"],
  ], "Dirección", "director-general"),
  operationSet("director-deportivo", "Director Deportivo", [
    ["Rendimiento deportivo", "Tablero de Resultados Deportivos"],
    ["Desarrollo de talento", "Matriz de Promoción de Jugadores"],
    ["Metodología deportiva", "Checklist de Cumplimiento Metodológico"],
  ], "Deportiva", "director-deportivo"),
  operationSet("gerente-deportivo", "Gerente Deportivo e Inteligencia", [
    ["Operación deportiva", "Plan Operativo Deportivo Semanal"],
    ["Logística deportiva", "Checklist Logístico Deportivo"],
    ["Soporte competitivo", "Reporte de Apoyo a Cuerpos Técnicos"],
  ], "Deportiva", "gerente-deportivo"),
  operationSet("dt-premier", "Director Técnico Premier", [
    ["Rendimiento competitivo", "Reporte de Partido y Resultados"],
    ["Desarrollo de jugadores", "Evaluación Integral de Jugadores"],
    ["Cumplimiento metodológico", "Plan Semanal de Entrenamiento"],
  ], "Deportiva", "dt-premier"),
  operationSet("dt-tdp-varonil", "Director Técnico TDP Varonil", [
    ["Competitividad del equipo", "Reporte de Resultados TDP Varonil"],
    ["Formación de jugadores", "Matriz de Desarrollo Formativo"],
    ["Metodología institucional", "Plan de Entrenamiento Metodológico"],
  ], "Deportiva", "dt-tdp-varonil"),
  operationSet("dt-tdp-femenil", "Director Técnico TDP Femenil", [
    ["Competitividad del equipo", "Reporte de Resultados TDP Femenil"],
    ["Formación de jugadoras", "Matriz de Desarrollo Formativo"],
    ["Metodología institucional", "Plan de Entrenamiento Metodológico"],
  ], "Deportiva", "dt-tdp-femenil"),
  operationSet("doctor", "Doctor Deportivo", [
    ["Control de lesiones/enfermedades", "Expediente Médico Deportivo"],
    ["Disponibilidad competitiva", "Tablero de Jugadores Disponibles"],
    ["Atención médica oportuna", "Bitácora de Incidencias Médicas"],
  ], "Salud Deportiva", "doctor"),
  operationSet("fisioterapeuta", "Fisioterapeuta Deportivo", [
    ["Recuperación física", "Plan de Rehabilitación Individual"],
    ["Cumplimiento terapéutico", "Bitácora de Sesiones Fisioterapéuticas"],
    ["Prevención de recaídas", "Registro de Reincidencia de Lesiones"],
  ], "Salud Deportiva", "fisioterapeuta"),
  operationSet("preparador-fisico", "Preparador Físico", [
    ["Condición física", "Evaluación Física de Jugadores"],
    ["Planificación física", "Plan de Cargas y Entrenamiento Físico"],
    ["Prevención de lesiones", "Reporte de Riesgo Físico y Fatiga"],
  ], "Deportiva", "preparador-fisico"),
  operationSet("utileros", "Utileros", [
    ["Disponibilidad de material", "Inventario de Utilería Deportiva"],
    ["Orden y control", "Checklist de Equipamiento por Equipo"],
    ["Apoyo operativo", "Bitácora de Entrega y Recepción de Material"],
  ], "Operación Deportiva", "utileros"),
  operationSet("auxiliar-tecnico", "Auxiliar Técnico", [
    ["Apoyo en entrenamientos", "Checklist de Sesión Técnica"],
    ["Seguimiento táctico", "Reporte de Observación Táctica"],
    ["Continuidad operativa", "Bitácora de Apoyo Técnico"],
  ], "Deportiva", "auxiliar-tecnico"),
  operationSet("entrenador-porteros", "Entrenador de Porteros", [
    ["Desarrollo técnico", "Evaluación Técnica de Porteros"],
    ["Rendimiento competitivo", "Reporte de Desempeño de Porteros"],
    ["Metodología especializada", "Plan de Entrenamiento de Porteros"],
  ], "Deportiva", "entrenador-porteros"),
  operationSet("jugadores", "Jugadores", [
    ["Rendimiento individual", "Ficha de Evaluación Deportiva Individual"],
    ["Disciplina y asistencia", "Control de Asistencia y Conducta"],
    ["Desarrollo integral", "Plan de Evolución del Jugador"],
  ], "Deportiva", "jugadores"),
  operationSet("coordinador-administrativo", "Coordinador Administrativo", [
    ["Control administrativo", "Tablero Administrativo Institucional"],
    ["Cumplimiento financiero-operativo", "Checklist de Procesos Administrativos"],
    ["Soporte a áreas", "Matriz de Solicitudes y Atención Interna"],
  ], "Administración", "coordinador-administrativo"),
  operationSet("ejecutivo-finanzas", "Ejecutivo de Cuentas de Finanzas", [
    ["Control financiero", "Tablero de Ingresos, Egresos y Presupuesto"],
    ["Seguimiento de cobranza", "Control de Pagos y Compromisos"],
    ["Estabilidad financiera", "Reporte Financiero Mensual"],
  ], "Finanzas", "ejecutivo-finanzas"),
  operationSet("enlace-fmf", "Especialista Enlace FMF", [
    ["Cumplimiento federativo", "Calendario de Trámites FMF"],
    ["Control documental", "Expediente Federativo por Categoría"],
    ["Normativa oficial", "Checklist de Cumplimiento Reglamentario FMF"],
  ], "Administración Deportiva", "enlace-fmf"),
  operationSet("director-operativo", "Director Operativo", [
    ["Continuidad operativa", "Reporte Operativo Institucional"],
    ["Eficiencia operativa", "Checklist de Operación Diaria"],
    ["Soporte funcional", "Matriz de Requerimientos por Área"],
  ], "Operaciones", "director-operativo"),
  operationSet("secretario-premier", "Secretario Técnico Premier", [
    ["Control administrativo deportivo", "Expediente Operativo Premier"],
    ["Seguimiento operativo", "Calendario de Partidos, Registros y Logística"],
    ["Cumplimiento organizacional", "Checklist de Procesos del Equipo"],
  ], "Administración Deportiva", "secretario-premier"),
  operationSet("secretario-tdp-varonil", "Secretario Técnico TDP Varonil", [
    ["Control administrativo deportivo", "Expediente Operativo TDP Varonil"],
    ["Seguimiento operativo", "Calendario de Partidos, Registros y Logística"],
    ["Cumplimiento organizacional", "Checklist de Procesos del Equipo"],
  ], "Administración Deportiva", "secretario-tdp-varonil"),
  operationSet("secretario-tdp-femenil", "Secretario Técnico TDP Femenil", [
    ["Control administrativo deportivo", "Expediente Operativo TDP Femenil"],
    ["Seguimiento operativo", "Calendario de Partidos, Registros y Logística"],
    ["Cumplimiento organizacional", "Checklist de Procesos del Equipo"],
  ], "Administración Deportiva", "secretario-tdp-femenil"),
  operationSet("infraestructura", "Coordinador de Gestión e Infraestructura", [
    ["Disponibilidad de instalaciones", "Tablero de Uso de Instalaciones"],
    ["Mantenimiento", "Plan de Mantenimiento Preventivo y Correctivo"],
    ["Seguridad funcional", "Checklist de Condiciones Operativas"],
  ], "Infraestructura", "infraestructura"),
  operationSet("chofer", "Chofer", [
    ["Puntualidad en traslados", "Bitácora de Traslados"],
    ["Seguridad vehicular", "Checklist de Unidad y Seguridad"],
    ["Cumplimiento logístico", "Agenda de Rutas e Itinerarios"],
  ], "Operaciones", "chofer"),
  operationSet("campero", "Campero", [
    ["Condición de cancha", "Checklist de Estado de Campo"],
    ["Preparación operativa", "Bitácora de Preparación de Canchas"],
    ["Mantenimiento preventivo", "Plan de Conservación de Áreas Deportivas"],
  ], "Infraestructura", "campero"),
  operationSet("experiencia-cliente", "Experiencia al Cliente", [
    ["Satisfacción y fidelización", "Encuesta y Tablero de Satisfacción"],
    ["Seguimiento postventa", "CRM de Atención y Seguimiento"],
    ["Vinculación comercial-marketing", "Matriz de Coordinación Comercial/MKT"],
  ], "Experiencia / Comercial", "experiencia-cliente"),
  operationSet("nutriologo", "Nutriólogo Deportivo", [
    ["Condición nutricional", "Evaluación Nutricional de Jugadores"],
    ["Seguimiento nutricional", "Plan Alimenticio y Monitoreo"],
    ["Impacto en rendimiento", "Reporte de Evolución Física-Nutricional"],
  ], "Salud Deportiva", "nutriologo"),
  operationSet("psicologo", "Psicólogo Deportivo", [
    ["Bienestar emocional", "Ficha de Seguimiento Psicológico"],
    ["Acompañamiento psicológico", "Bitácora de Sesiones y Casos"],
    ["Fortaleza mental competitiva", "Evaluación de Enfoque, Crisis y Disciplina"],
  ], "Salud Deportiva", "psicologo"),
  operationSet("fuerzas-basicas", "Fuerzas Básicas", [
    ["Formación deportiva", "Matriz de Desarrollo de Talento Base"],
    ["Captación y seguimiento", "Registro de Prospectos y Evaluaciones"],
    ["Metodología institucional", "Plan Formativo por Categoría"],
  ], "Deportiva", "fuerzas-basicas"),
  operationSet("enlace-comercial", "Enlace Comercial", [
    ["Prospección comercial", "Pipeline de Prospectos Comerciales"],
    ["Cierre de patrocinios", "Matriz de Propuestas y Convenios"],
    ["Seguimiento de aliados", "CRM de Patrocinadores y Aliados"],
  ], "Experiencia / Comercial", "enlace-comercial"),
  operationSet("ejecutivo-mkt", "Ejecutivo de Cuenta MKT", [
    ["Comunicación institucional", "Calendario de Contenidos y Campañas"],
    ["Performance de marketing", "Reporte de Métricas Digitales"],
    ["Evidencia y posicionamiento", "Banco de Evidencias y Activos de Marca"],
  ], "Marketing", "ejecutivo-mkt"),
];
