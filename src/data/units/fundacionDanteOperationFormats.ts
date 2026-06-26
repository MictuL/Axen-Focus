import { createPositionId } from "../../lib/catalog";
import type { OperationFormatItem, OperationFormatSet, OperationGuideDocument, OperationTemplate, OperationTemplateTable } from "../../types";
import { FUNDACION_DANTE_UNIT_ID } from "./fundacionDante";

const positionId = (id: string) => createPositionId(FUNDACION_DANTE_UNIT_ID, id);
type OperationFormatSource = [string, string] | [string, string, OperationGuideDocument | undefined, OperationTemplate];
const items = (rows: OperationFormatSource[]): OperationFormatItem[] => rows.map(([keyArea, format, guideDocument, template]) => ({ keyArea, format, guideDocument, template }));
const table = (title: string, columns: string[], rowLabels?: string[], blankRows?: number): OperationTemplateTable => ({ title, columns, rowLabels, blankRows });

const executiveOperationReportGuide: OperationGuideDocument = {
  title: "Reporte Ejecutivo de Operación General",
  subtitle: "Seguimiento diario, semanal y mensual",
  objective: "Convertir el reporte ejecutivo en una herramienta práctica para revisar, decidir, dar seguimiento y escalar la operación de la Fundación.",
  recommendedUse: "Registrar seguimiento diario para temas críticos, cierre semanal para control operativo y cierre mensual para reporte ejecutivo ante Dirección / Grupo Axen Capital.",
  sections: [
    {
      title: "Enfoque del formato",
      rows: [
        { label: "¿A quién estamos ayudando?", value: "Beneficiarios activos, casos urgentes y próximos seguimientos." },
        { label: "¿Qué está avanzando?", value: "Actividades, programas, eventos y responsables." },
        { label: "¿Qué recursos necesitamos?", value: "Donativos, apoyos en especie, aliados y necesidades financieras." },
        { label: "¿Qué debe documentarse?", value: "Evidencias, expedientes, minutas, convenios y reportes." },
        { label: "¿Qué riesgo puede detener la operación?", value: "Incidencias, responsables y acciones correctivas." },
        { label: "¿Qué decisión se debe escalar?", value: "Aprobaciones, presupuestos, convenios o prioridades estratégicas." },
      ],
    },
    {
      title: "Datos básicos del seguimiento",
      rows: [
        { label: "Fecha", value: "Campo de captura." },
        { label: "Responsable", value: "Director/a de Unidad." },
        { label: "Periodo revisado", value: "Diario / Semanal / Mensual." },
        { label: "Estado general", value: "Verde / Amarillo / Rojo." },
        { label: "Prioridad del día o semana", value: "Pendiente principal a resolver." },
        { label: "Observación ejecutiva breve", value: "Resumen del estado operativo." },
      ],
    },
    {
      title: "Semáforo operativo general",
      rows: [
        { label: "Áreas clave", value: "Beneficiarios, actividades/programas, recursos/donativos, alianzas, comunicación, documentación/cumplimiento y riesgos/incidencias." },
        { label: "Verde", value: "Avanza conforme a lo esperado." },
        { label: "Amarillo", value: "Requiere seguimiento o ajuste." },
        { label: "Rojo", value: "Requiere atención inmediata o decisión directiva." },
      ],
    },
    {
      title: "Pendientes críticos y beneficiarios",
      rows: [
        { label: "Pendientes críticos", value: "Pendiente, área, responsable, estatus y próximo paso." },
        { label: "Indicadores de beneficiarios", value: "Beneficiarios activos, atendidos, nuevos registros, casos pendientes, concluidos y urgentes." },
        { label: "Seguimientos prioritarios", value: "Beneficiario o grupo, tipo de apoyo, estatus, próxima acción y responsable." },
      ],
    },
    {
      title: "Actividades, recursos y alianzas",
      rows: [
        { label: "Actividades / programas", value: "Fecha, estado, resultado o avance y nivel de riesgo." },
        { label: "Próximas acciones operativas", value: "Acción, responsable, fecha compromiso y necesidad." },
        { label: "Recursos / donativos", value: "Donativos recibidos, especie, recursos pendientes, nuevos donadores, gastos relevantes y necesidad financiera prioritaria." },
        { label: "Alianzas", value: "Aliado, tipo de alianza, estado, siguiente paso y si requiere intervención directiva." },
      ],
    },
    {
      title: "Comunicación y control interno",
      rows: [
        { label: "Comunicación", value: "Acción, canal, objetivo, evidencia y resultado." },
        { label: "Indicadores de visibilidad", value: "Publicaciones realizadas, alcance, interacciones, solicitudes recibidas y leads de donadores o aliados." },
        { label: "Documentación", value: "Expedientes, donativos, evidencias, convenios, minutas y reportes financieros." },
      ],
    },
    {
      title: "Riesgos, decisiones y plan de acción",
      rows: [
        { label: "Riesgos e incidencias", value: "Riesgo, nivel, consecuencia, acción correctiva y responsable." },
        { label: "Regla operativa", value: "Todo riesgo alto debe generar una acción inmediata o una decisión requerida." },
        { label: "Decisiones requeridas", value: "Decisión, motivo, impacto, fecha límite y quién aprueba." },
        { label: "Plan de acción inmediato", value: "Prioridad, acción, responsable, fecha compromiso e indicador relacionado." },
      ],
    },
    {
      title: "Vista compacta para plataforma",
      rows: [
        { label: "Estado general", value: "Semáforo global, prioridad y resumen del periodo." },
        { label: "Beneficiarios", value: "Atención, casos activos y seguimientos urgentes." },
        { label: "Actividades", value: "Programas, eventos y próximas acciones." },
        { label: "Recursos y alianzas", value: "Donativos, fondos, aliados y oportunidades." },
        { label: "Comunicación", value: "Difusión, evidencias e impacto básico." },
        { label: "Control interno", value: "Documentación, cumplimiento y reportes." },
        { label: "Riesgos y decisiones", value: "Incidencias, alertas y aprobaciones necesarias." },
      ],
    },
    {
      title: "Rutina sugerida del Director de Unidad",
      rows: [
        { label: "Diario", value: "Revisar casos urgentes, pendientes críticos, actividades del día y riesgos activos para dejar acciones inmediatas claras." },
        { label: "Semanal", value: "Revisar semáforo operativo, beneficiarios atendidos, recursos, alianzas y documentación para ajustar prioridades." },
        { label: "Mensual", value: "Revisar indicadores, avances, sostenibilidad, decisiones escaladas y plan de acción para Dirección / Grupo Axen Capital." },
      ],
    },
  ],
};

const directorExecutiveTemplate: OperationTemplate = {
  title: "Reporte Ejecutivo de Operación General",
  subtitle: "Formato concentrador para Dirección General UDN",
  sourceFile: "Guia_Operativa_Direccion_FDE_Reporte_Ejecutivo.docx",
  frequency: "Diario / Semanal / Mensual",
  fields: ["Fecha de llenado", "Periodo revisado", "Responsable", "Estado general", "Prioridad ejecutiva del periodo", "Observación ejecutiva breve"],
  questions: ["¿Cómo se encuentra la operación general?", "¿Cuál es el avance más relevante del periodo?", "¿Cuál es el principal bloqueo o riesgo?", "¿Qué decisión debe escalarse?", "¿Qué tablero especializado respalda la información?"],
  tables: [
    table("Semáforo ejecutivo consolidado", ["Frente ejecutivo", "Documento fuente", "Estado", "Causa breve", "Acción inmediata", "Responsable", "Fecha", "Evidencia / link"], ["Operación general", "Impacto social", "Sostenibilidad", "Control interno", "Riesgos y decisiones"]),
    table("Indicadores ejecutivos mínimos", ["Indicador ejecutivo", "Fuente", "Meta", "Resultado", "Estado", "Nota ejecutiva"], ["Beneficiarios atendidos", "Casos urgentes abiertos", "Actividades ejecutadas", "Recursos gestionados", "Alianzas estratégicas activas", "Riesgos altos abiertos", "Decisiones pendientes"]),
    table("Pendientes, riesgos y decisiones críticas", ["Tipo", "Descripción", "Área afectada", "Nivel", "Acción requerida", "Responsable", "Fecha límite", "Estatus", "Evidencia"], undefined, 3),
    table("Plan de acción inmediato", ["Prioridad", "Acción", "Área relacionada", "Responsable", "Fecha compromiso", "Resultado esperado"], ["Alta", "Alta", "Media", "Media", "Baja"]),
    table("Checklist de cierre ejecutivo", ["Validación", "Sí / No", "Observaciones"], ["El estado general tiene causa clara", "Todo amarillo/rojo tiene acción, responsable y fecha", "No se duplicó detalle de beneficiarios; solo se citó el tablero fuente", "No se duplicó detalle de recursos/alianzas; solo se citó el reporte fuente", "Las decisiones pendientes están identificadas y escaladas", "El plan de acción tiene máximo 5 prioridades"]),
  ],
};

const directorBeneficiariesTemplate: OperationTemplate = {
  title: "Tablero de Beneficiarios e Impacto Social",
  subtitle: "Formato especializado para impacto social y cobertura",
  sourceFile: "Tablero_Beneficiarios_Impacto_Social_FDE.docx",
  frequency: "Semanal / Mensual",
  fields: ["Fecha de actualización", "Periodo revisado", "Responsable del tablero", "Estado de atención social", "Prioridad social del periodo", "Fuente de información"],
  questions: ["¿A quién se atendió en el periodo?", "¿Qué necesidad principal se detectó?", "¿Qué apoyo o intervención se brindó?", "¿Qué cambio o resultado observable hubo?", "¿Qué caso requiere prioridad o escalamiento?"],
  tables: [
    table("Indicadores de beneficiarios e impacto", ["Indicador", "Meta", "Resultado", "Estado", "Evidencia / fuente", "Observación"], ["Beneficiarios activos", "Beneficiarios atendidos en el periodo", "Nuevos beneficiarios registrados", "Casos urgentes abiertos", "Casos con seguimiento completo", "Casos canalizados a otra institución", "Expedientes completos", "Evidencias de atención actualizadas"]),
    table("Registro maestro de beneficiarios", ["Código / folio", "Rango de edad", "Municipio", "Necesidad detectada", "Tipo de apoyo", "Estatus", "Próxima acción", "Responsable", "Fecha", "Evidencia"], undefined, 4),
    table("Seguimiento de casos prioritarios", ["Caso / folio", "Motivo de prioridad", "Nivel", "Acción requerida", "Responsable", "Fecha límite", "Estatus", "Evidencia"], undefined, 3),
    table("Registro de apoyos, servicios o actividades de impacto", ["Fecha", "Beneficiario / grupo", "Apoyo / servicio", "Objetivo", "Resultado observado", "Evidencia", "Responsable"], undefined, 3),
    table("Documentación social y expediente", ["Documento / evidencia", "Aplica", "Estado", "Responsable", "Fecha actualización", "Observación"], ["Ficha de beneficiario", "Consentimiento / autorización de uso de datos o imagen", "Diagnóstico / necesidad documentada", "Evidencia de apoyo brindado", "Seguimiento posterior"]),
    table("Riesgos y decisiones específicas de beneficiarios", ["Tipo", "Descripción", "Caso / área", "Nivel", "Acción", "Responsable", "Fecha", "Estatus"], undefined, 2),
    table("Plan de acción social inmediato", ["Prioridad", "Acción", "Caso / indicador relacionado", "Responsable", "Fecha compromiso", "Resultado esperado"], ["Alta", "Alta", "Media", "Media", "Baja"]),
    table("Checklist de cierre del tablero", ["Validación", "Sí / No", "Observaciones"], ["Los totales de beneficiarios coinciden con el registro maestro", "Los casos prioritarios tienen acción, responsable y fecha", "Toda atención reportada tiene evidencia o fuente", "No se duplicó información financiera o estratégica que corresponde al Reporte de Sostenibilidad", "Los datos sensibles están protegidos o registrados por folio/código", "Los indicadores que alimentan el Reporte Ejecutivo están actualizados"]),
  ],
};

const directorSustainabilityTemplate: OperationTemplate = {
  title: "Reporte de Sostenibilidad y Avance Estratégico",
  subtitle: "Formato especializado para recursos, alianzas y avance institucional",
  sourceFile: "Reporte_Sostenibilidad_Avance_Estrategico_FDE.docx",
  frequency: "Semanal / Mensual",
  fields: ["Fecha de actualización", "Periodo revisado", "Responsable", "Estado de sostenibilidad", "Prioridad estratégica del periodo", "Fuente de información"],
  questions: ["¿Qué tan sostenible es la operación en este periodo?", "¿Cuál fue el avance estratégico más relevante?", "¿Cuál es la brecha principal de recursos o gestión?", "¿Qué alianza, fondo o decisión debe priorizarse?", "¿Qué impacto institucional puede generar?"],
  tables: [
    table("Indicadores de sostenibilidad y avance", ["Indicador", "Meta", "Resultado", "Estado", "Brecha / lectura ejecutiva", "Evidencia"], ["Recursos económicos gestionados", "Donativos recibidos", "Donativos en especie valorizados", "Prospectos de donador activos", "Alianzas estratégicas activas", "Convenios en proceso", "Iniciativas estratégicas en avance", "Necesidad financiera prioritaria cubierta (%)"]),
    table("Pipeline de recursos y donativos", ["Fuente / donador", "Tipo de recurso", "Monto / valor estimado", "Estado", "Probabilidad", "Próxima acción", "Responsable", "Fecha", "Evidencia"], undefined, 3),
    table("Alianzas estratégicas y vinculación institucional", ["Aliado / institución", "Tipo", "Objetivo estratégico", "Estado", "Valor esperado", "Siguiente paso", "Responsable", "Fecha"], undefined, 3),
    table("Avance de iniciativas estratégicas", ["Iniciativa", "Objetivo", "Avance real", "Brecha / bloqueo", "Acción correctiva", "Responsable", "Fecha", "Evidencia"], undefined, 3),
    table("Alineación con Grupo Axen Capital", ["Eje de alineación", "Estado", "Evidencia", "Brecha detectada", "Acción requerida"], ["Propósito social y narrativa institucional", "Gobernanza y reporteo", "Uso de marca y comunicación institucional", "Relación con unidades / aliados del grupo", "Cumplimiento documental y trazabilidad"]),
    table("Riesgos y decisiones de sostenibilidad", ["Tipo", "Descripción", "Nivel", "Impacto potencial", "Decisión / acción requerida", "Responsable", "Fecha", "Estatus"], undefined, 2),
    table("Plan de acción estratégico inmediato", ["Prioridad", "Acción estratégica", "Indicador / brecha relacionada", "Responsable", "Fecha compromiso", "Resultado esperado"], ["Alta", "Alta", "Media", "Media", "Baja"]),
    table("Checklist de cierre del reporte", ["Validación", "Sí / No", "Observaciones"], ["Los montos, recursos o alianzas tienen fuente/evidencia", "Toda brecha estratégica tiene acción, responsable y fecha", "No se duplicó detalle de beneficiarios ni seguimiento social", "Los riesgos estratégicos o financieros están escalados cuando aplica", "Los datos que alimentan el Reporte Ejecutivo están actualizados", "La alineación con Grupo Axen Capital fue revisada"]),
  ],
};

const pipelineProcuracionTemplate: OperationTemplate = {
  title: "Pipeline de Procuración de Fondos",
  subtitle: "Control práctico de prospectos, solicitudes, propuestas y cierre de recursos",
  sourceFile: "Pipeline_Procuracion_Fondos_FDE.docx",
  frequency: "Semanal / Mensual",
  fields: ["Unidad", "Puesto responsable", "Periodo de seguimiento", "Fecha de actualización"],
  summaryFields: ["Meta de procuración del periodo", "Total prospectado", "Total probable ponderado", "Estatus general"],
  tables: [
    table("Indicadores ejecutivos del pipeline", ["Indicador", "Meta", "Resultado", "Estado", "Lectura operativa / acción"], ["Prospectos nuevos", "Propuestas enviadas", "Recursos confirmados", "Recursos recibidos", "Tasa de cierre", "Oportunidades vencidas sin seguimiento"]),
    table("Pipeline principal de oportunidades", ["ID", "Prospecto / fuente", "Tipo de apoyo", "Etapa", "Monto / valor estimado", "Probabilidad", "Siguiente acción", "Responsable", "Fecha límite", "Evidencia / link"], undefined, 5),
    table("Oportunidades que requieren acción esta semana", ["Prioridad", "ID oportunidad", "Bloqueo / necesidad", "Acción puntual", "Responsable", "Fecha compromiso", "Resultado esperado"], undefined, 3),
    table("Cierre y evidencia de recursos", ["ID oportunidad", "Recurso confirmado", "Recurso recibido", "Fecha de recepción", "Comprobante / evidencia", "¿Pasa a fidelización?", "Observación"], undefined, 3),
  ],
};

const matrizFidelizacionTemplate: OperationTemplate = {
  title: "Matriz de Fidelización de Donantes",
  subtitle: "Seguimiento práctico de relación, reconocimiento, permanencia y recurrencia",
  sourceFile: "Matriz_Fidelizacion_Donantes_FDE.docx",
  frequency: "Mensual / Trimestral",
  fields: ["Unidad", "Puesto responsable", "Periodo de revisión", "Fecha de actualización"],
  summaryFields: ["Donantes activos", "Donantes recurrentes", "Donantes por reactivar", "Estado general de fidelización"],
  tables: [
    table("Indicadores de fidelización", ["Indicador", "Meta", "Resultado", "Estado", "Acción de mejora"], ["Donantes contactados en el periodo", "Agradecimientos enviados a tiempo", "Donantes recurrentes activos", "Donantes inactivos reactivados", "Reportes de impacto enviados"]),
    table("Matriz principal de donantes", ["ID donante", "Donante / institución", "Segmento", "Historial resumido", "Estado de relación", "Último contacto", "Próxima acción de fidelización", "Responsable", "Fecha compromiso", "Evidencia"], undefined, 5),
    table("Plan de contacto y reconocimiento", ["ID donante", "Tipo de contacto", "Mensaje / motivo", "Canal", "Fecha programada", "Responsable", "Resultado"], undefined, 3),
    table("Alertas de relación", ["Donante", "Alerta", "Nivel", "Acción requerida", "Responsable", "Fecha límite", "Estatus"], undefined, 3),
  ],
};

const controlAlianzasTemplate: OperationTemplate = {
  title: "Control de Alianzas y Convenios Institucionales",
  subtitle: "Gestión práctica de aliados, convenios, compromisos y vigencias",
  sourceFile: "Control_Alianzas_Convenios_Institucionales_FDE.docx",
  frequency: "Mensual",
  fields: ["Unidad", "Puesto responsable", "Periodo de revisión", "Fecha de actualización"],
  summaryFields: ["Alianzas activas", "Convenios vigentes", "Convenios por renovar", "Estado general"],
  tables: [
    table("Indicadores de alianzas y convenios", ["Indicador", "Meta", "Resultado", "Estado", "Acción requerida"], ["Aliados institucionales activos", "Convenios vigentes", "Convenios en revisión", "Convenios por vencer en 60 días", "Compromisos vencidos"]),
    table("Control maestro de alianzas y convenios", ["ID", "Aliado / institución", "Tipo de alianza", "Objetivo del convenio", "Estado documental", "Compromiso de FDE", "Compromiso del aliado", "Vigencia", "Responsable", "Evidencia / archivo"], undefined, 4),
    table("Seguimiento de compromisos institucionales", ["ID alianza", "Compromiso / entregable", "Responsable", "Fecha compromiso", "Estado", "Riesgo si no se cumple", "Evidencia"], undefined, 4),
    table("Renovaciones, vencimientos y aprobaciones", ["ID alianza", "Situación", "Fecha crítica", "Decisión requerida", "Quién aprueba", "Acción inmediata", "Estatus"], undefined, 3),
  ],
};

const prospeccionDonantesTemplate: OperationTemplate = {
  title: "Prospección de Donantes",
  subtitle: "Identificación, calificación y canalización de posibles donantes",
  sourceFile: "Prospeccion_Donantes_Voluntariado_FDE.docx",
  frequency: "Semanal / Campaña",
  fields: ["Unidad", "Puesto responsable", "Periodo de búsqueda", "Fecha de actualización"],
  summaryFields: ["Responsable voluntario", "Coordinador asignado", "Meta de prospectos", "Estatus general"],
  tables: [
    table("Indicadores mínimos de prospección", ["Indicador", "Meta", "Resultado", "Estado", "Observación breve"], ["Prospectos identificados", "Prospectos calificados como viables", "Prospectos canalizados a conversión", "Prospectos descartados con motivo"]),
    table("Registro de prospectos detectados", ["ID", "Nombre / institución", "Tipo", "Fuente de identificación", "Afinidad con la causa", "Capacidad estimada", "Contacto disponible", "Estatus", "Siguiente paso", "Responsable"], undefined, 5),
    table("Calificación rápida del prospecto", ["ID prospecto", "Motivo de afinidad", "Necesidad que podría apoyar", "Restricción o alerta", "¿Canalizar a conversión?", "Fecha de canalización"], undefined, 3),
    table("Checklist de cierre", ["Validación", "Sí / No", "Comentario"], ["Todos los prospectos canalizados tienen datos mínimos de contacto", "Los prospectos descartados tienen motivo registrado", "No se registraron datos sensibles innecesarios", "Los prospectos viables fueron enviados al formato de Conversión de Prospectos"]),
  ],
};

const apoyoCampanasTemplate: OperationTemplate = {
  title: "Apoyo en Campañas de Procuración",
  subtitle: "Control práctico de tareas, difusión, materiales y evidencias de campaña",
  sourceFile: "Apoyo_Campanas_Procuracion_Voluntariado_FDE.docx",
  frequency: "Por campaña",
  fields: ["Unidad", "Puesto responsable", "Nombre de campaña", "Periodo de campaña"],
  summaryFields: ["Responsable voluntario", "Coordinador asignado", "Objetivo de campaña", "Estatus general"],
  questions: ["¿Qué acción de apoyo se está realizando?", "¿Qué canal o dinámica se está usando?", "¿Qué avance relevante hubo?", "¿Qué bloqueo o necesidad existe?"],
  tables: [
    table("Tablero de tareas de campaña", ["ID tarea", "Tarea", "Canal / frente", "Responsable", "Fecha límite", "Estado", "Evidencia", "Observación"], undefined, 5),
    table("Materiales y mensajes utilizados", ["Material / mensaje", "Uso previsto", "Canal", "Validado por", "Estado", "Link / ubicación"], undefined, 3),
    table("Registro de interacción de campaña", ["Fecha", "Canal", "Acción realizada", "Resultado operativo", "Prospectos generados", "Prospectos interesados", "Observación"], undefined, 3),
    table("Incidencias y necesidades de apoyo", ["Incidencia / necesidad", "Nivel", "Impacto en campaña", "Acción requerida", "Responsable", "Fecha límite", "Estatus"], undefined, 2),
    table("Checklist de cierre", ["Validación", "Sí / No", "Comentario"], ["Las tareas realizadas tienen evidencia", "Los materiales usados estaban validados", "Los prospectos nuevos fueron enviados a Prospección de Donantes", "Los interesados fueron enviados a Conversión de Prospectos"]),
  ],
};

const conversionProspectosTemplate: OperationTemplate = {
  title: "Conversión de Prospectos",
  subtitle: "Seguimiento de prospectos interesados hasta su compromiso o descarte",
  sourceFile: "Conversion_Prospectos_Voluntariado_FDE.docx",
  frequency: "Semanal / Campaña",
  fields: ["Unidad", "Puesto responsable", "Periodo de seguimiento", "Fecha de actualización"],
  summaryFields: ["Responsable voluntario", "Coordinador asignado", "Meta de conversiones", "Estatus general"],
  tables: [
    table("Indicadores mínimos de conversión", ["Indicador", "Meta", "Resultado", "Estado", "Lectura / acción"], ["Prospectos interesados en seguimiento", "Compromisos obtenidos", "Prospectos sin respuesta", "Prospectos descartados con motivo"]),
    table("Seguimiento de prospectos interesados", ["ID", "Prospecto", "Origen", "Interés detectado", "Tipo de apoyo probable", "Etapa de conversión", "Último contacto", "Próxima acción", "Fecha límite", "Responsable"], undefined, 5),
    table("Seguimiento de contacto y objeciones", ["ID prospecto", "Canal de contacto", "Respuesta obtenida", "Objeción / duda", "Respuesta sugerida o apoyo requerido", "¿Escalar a coordinador?", "Evidencia"], undefined, 3),
    table("Cierre de intención y canalización", ["ID prospecto", "Resultado", "Apoyo comprometido", "Fecha tentativa", "Datos mínimos para seguimiento", "Canalizado a", "Observación"], undefined, 3),
    table("Checklist de cierre", ["Validación", "Sí / No", "Comentario"], ["Los prospectos confirmados fueron canalizados al Coordinador", "Los prospectos descartados tienen motivo registrado", "Los casos sin respuesta tienen fecha de último intento", "No se duplicaron prospectos que pertenecen a Prospección o Campañas"]),
  ],
};

const operationSet = (
  id: string,
  positionName: string,
  rows: OperationFormatSource[],
  area: string,
  linkedPositionId?: string,
): OperationFormatSet => ({
  id: `${FUNDACION_DANTE_UNIT_ID}:operation:${id}`,
  businessUnitId: FUNDACION_DANTE_UNIT_ID,
  positionId: linkedPositionId ? positionId(linkedPositionId) : undefined,
  positionName,
  area,
  formats: items(rows),
});

export const fundacionDanteOperationFormats: OperationFormatSet[] = [
  operationSet("director-general", "Director General UDN", [
    ["Operación integral de la Fundación", "Reporte Ejecutivo de Operación General", executiveOperationReportGuide, directorExecutiveTemplate],
    ["Impacto social y cobertura", "Tablero de Beneficiarios e Impacto Social", undefined, directorBeneficiariesTemplate],
    ["Sostenibilidad y alineación corporativa", "Reporte de Sostenibilidad y Avance Estratégico", undefined, directorSustainabilityTemplate],
  ], "Dirección", "director-general"),
  operationSet("coordinador-procuracion-fondos", "Coordinador de Procuración de Fondos", [
    ["Captación de fondos", "Pipeline de Procuración de Fondos", undefined, pipelineProcuracionTemplate],
    ["Donantes recurrentes", "Matriz de Fidelización de Donantes", undefined, matrizFidelizacionTemplate],
    ["Alianzas corporativas", "Control de Alianzas y Convenios Institucionales", undefined, controlAlianzasTemplate],
  ], "Procuración de Fondos", "coordinador-procuracion-fondos"),
  operationSet("voluntariado-procuracion-fondos", "Voluntariado de Procuración de Fondos", [
    ["Prospección de donantes", "Prospección de Donantes", undefined, prospeccionDonantesTemplate],
    ["Apoyo en campañas de procuración", "Apoyo en Campañas de Procuración", undefined, apoyoCampanasTemplate],
    ["Conversión de prospectos", "Conversión de Prospectos", undefined, conversionProspectosTemplate],
  ], "Voluntariado", "voluntariado-procuracion-fondos"),
  operationSet("coordinador-responsabilidad-social", "Coordinador de Responsabilidad Social", [
    ["Atención de solicitudes", "Matriz de Solicitudes Recibidas y Procesadas"],
    ["Seguimiento a beneficiarios", "Expediente de Beneficiario y Seguimiento Social"],
    ["Satisfacción familiar", "Encuesta de Satisfacción de Familias Beneficiarias"],
  ], "Responsabilidad Social", "coordinador-responsabilidad-social"),
  operationSet("ejecutivo-cuentas-finanzas", "Ejecutivo de Cuentas y Finanzas", [
    ["Control financiero", "Tablero de Ingresos, Egresos y Presupuesto"],
    ["Reportes financieros", "Reporte Financiero Mensual para Dirección y Corporativo"],
    ["Cumplimiento fiscal/contable", "Checklist de Cumplimiento Fiscal y Contable A.C."],
  ], "Finanzas", "ejecutivo-cuentas-finanzas"),
  operationSet("coordinador-activaciones", "Coordinador de Activaciones", [
    ["Planeación de activaciones", "Plan Maestro de Activaciones y Campañas"],
    ["Ejecución logística", "Checklist Logístico de Activación"],
    ["Impacto comunitario", "Reporte de Alcance e Impacto de Activación"],
  ], "Activaciones", "coordinador-activaciones"),
  operationSet("voluntariado-activaciones", "Voluntariado de Activaciones", [
    ["Participación en activaciones", "Lista de Asistencia y Participación de Voluntarios"],
    ["Cumplimiento de tareas asignadas", "Checklist de Tareas Operativas por Activación"],
    ["Calidad del apoyo operativo", "Evaluación de Desempeño Operativo del Voluntariado"],
  ], "Voluntariado", "voluntariado-activaciones"),
  operationSet("enlace-comercial", "Enlace Comercial", [
    ["Vinculación con empresas/aliados", "Matriz de Contactos y Vinculación Comercial"],
    ["Seguimiento de oportunidades", "Pipeline de Oportunidades Comerciales e Institucionales"],
    ["Cierre de acuerdos", "Registro de Acuerdos, Convenios y Compromisos Comerciales"],
  ], "Comercial", "enlace-comercial"),
  operationSet("ejecutivo-cuenta-mkt", "Ejecutivo de Cuenta MKT", [
    ["Comunicación institucional", "Calendario de Contenidos y Campañas"],
    ["Alcance e impacto", "Reporte de Métricas Digitales y Medios"],
    ["Soporte a procuración de fondos", "Banco de Materiales para Donantes y Patrocinadores"],
  ], "Marketing", "ejecutivo-cuenta-mkt"),
];
