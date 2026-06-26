import { useEffect, useMemo, useState } from "react";
import type { BusinessUnit, CollaboratorProfile, DocumentRecord, Evaluation, OperationalCondition, OperationFormatItem, OperationFormatSet, OperationTemplate, OperationTemplateTable, Position, WeeklyPositionIndicatorEvaluation } from "../types";
import { calculateFocusDailyProgress, focusDailySummaryValues, FOCUS_DAILY_COLUMNS, FOCUS_DAILY_COLUMN_INDEX, FOCUS_DAILY_PRIORITIES, FOCUS_DAILY_ROW_COUNT_KEY, FOCUS_DAILY_STATUSES, FOCUS_DAILY_TABLE_TITLE, FOCUS_FIELD_COLLABORATOR, FOCUS_FIELD_DATE, FOCUS_FIELD_GOAL, FOCUS_FIELD_GOAL_TYPE, FOCUS_FIELD_INDICATOR, FOCUS_FIELD_PERCENTAGE, FOCUS_FIELD_PRODUCT, FOCUS_FIELD_PRODUCT_STATUS, FOCUS_FIELD_RESULT, FOCUS_SUMMARY_ACTION, FOCUS_SUMMARY_CAUSE, getFocusDailyActivitySemaphore, getFocusDailyEntries, getFocusDailyRowCount, getFocusDailyValidationErrors, normalizeFocusDailyStatus } from "../lib/focusDaily";
import { Icon } from "./Icon";
import { ConditionBadge } from "./ConditionBadge";
import { getOperationalLevel, groupByOperationalLevel } from "../lib/catalog";
import { getEvaluationProfileKey, OPERATIONAL_CONDITIONS } from "../lib/evaluation";
import { getIndicatorStatusMeta } from "../lib/positionIndicators";

const unique = (values: string[]) => [...new Set(values.filter(Boolean))].sort();
const csvCell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

function exportCsv(evaluations: Evaluation[]) {
  const rows = [["Folio", "ID", "Perfil ID", "Nivel", "Escalón operativo", "Unidad", "Área", "Puesto", "Producto", "Evaluado", "Evaluador", "Fecha", "Año", "Periodo", "Semana", "Mes", "Temporada", "Fuente", "Estadísticas", "Cumplimiento meta", "Condición", "Problemática", "Datos", "Solución", "Nueva meta", "Seguimiento", "Tendencia"], ...evaluations.map((item) => [item.documentFolio ?? "", item.id, getEvaluationProfileKey(item), item.subjectType === "unit" ? "Unidad" : "Colaborador", getOperationalLevel(item.positionName), item.businessUnitId, item.area, item.positionName, item.productDefinition ?? item.rep, item.evaluatedPersonName, item.evaluatorName, item.date, item.date.slice(0, 4), item.period, item.week, item.month, item.season, item.captureSource, (item.statistics ?? []).map((statistic) => `${statistic.name}: ${statistic.currentValue} ${statistic.measurementUnit} / ${statistic.targetValue} = ${statistic.targetAttainment}% (${statistic.condition})`).join(" | "), item.finalScore, item.condition ?? "", item.problemStatement ?? item.incidents, item.dataAnalysis ?? item.observations, item.solutionPlan ?? item.improvementAction, item.nextTarget ?? "", item.followUpDate, item.trend])];
  const blob = new Blob([`\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\n")}`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `evaluaciones-axen-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

const documentTypeLabel = {
  evaluation: "Evaluación",
  operation: "Operación",
} as const;

const documentStatusLabel = {
  printed: "Impreso - incompleto",
  digital: "Digital",
  "printed-digital": "Impreso - completo",
} as const;

type DocumentEditorField = {
  key: string;
  label: string;
  section: string;
  value: string;
  description?: string;
  readOnly?: boolean;
  requiredByFormat?: boolean;
  options?: string[];
  maxLength?: number;
};

const evaluationMethodFields = [
  ["evaluation::field::Fecha", "Fecha", "Datos generales"],
  ["evaluation::field::Periodo", "Periodo", "Datos generales"],
  ["evaluation::field::Persona evaluada", "Persona / unidad evaluada", "Datos generales"],
  ["evaluation::productDefinition", "Producto final a obtener", "Producto"],
  ["evaluation::statistics", "Estadísticas comparables", "Estadísticas"],
  ["evaluation::previousValue", "Valor del periodo anterior", "Estadísticas"],
  ["evaluation::currentValue", "Valor del periodo actual", "Estadísticas"],
  ["evaluation::targetValue", "Meta del periodo", "Estadísticas"],
  ["evaluation::measurementUnit", "Unidad de medida", "Estadísticas"],
  ["evaluation::targetAttainment", "Cumplimiento contra meta", "Resultado"],
  ["evaluation::condition", "Condición operativa", "Resultado"],
  ["evaluation::problemStatement", "Problemática", "Problemática · Datos · Solución"],
  ["evaluation::dataAnalysis", "Datos", "Problemática · Datos · Solución"],
  ["evaluation::solutionPlan", "Solución / plan de acción", "Problemática · Datos · Solución"],
  ["evaluation::nextTarget", "Nueva meta", "Seguimiento"],
  ["evaluation::followUpDate", "Fecha de seguimiento", "Seguimiento"],
  ["evaluation::observations", "Observaciones", "Seguimiento"],
] as const;

function valueKey(...parts: Array<string | number>) {
  return parts.map(String).join("::");
}

function formatDateTime(value?: string) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatDisplayDate(value?: string) {
  if (!value) return "Sin fecha";
  const normalized = value.includes("T") ? value : `${value}T00:00:00`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function indicatorRecordDate(record?: WeeklyPositionIndicatorEvaluation) {
  return record?.createdAt || record?.weekStartDate || "";
}

function formatValueKey(key: string) {
  const labels: Record<string, string> = {
    businessUnit: "Unidad de negocio",
    position: "Puesto",
    format: "Formato",
    frequency: "Frecuencia",
    keyArea: "Área clave",
    evaluatedPersonName: "Persona evaluada",
    evaluatorName: "Evaluador",
    date: "Fecha",
    period: "Periodo",
    week: "Semana",
    month: "Mes",
    season: "Temporada",
    finalScore: "Puntaje final",
    status: "Estatus",
    condition: "Condición",
    subjectType: "Nivel de evaluación",
    productDefinition: "Producto final",
    statistics: "Estadísticas",
    problemStatement: "Problemática",
    dataAnalysis: "Datos",
    solutionPlan: "Solución",
    nextTarget: "Nueva meta",
    followUpDate: "Fecha de seguimiento",
    observations: "Observaciones",
    incidents: "Incidencias",
    improvementAction: "Acción de mejora",
  };
  if (labels[key]) return labels[key];

  const parts = key.split("::");
  if (parts[0] === "evaluation" && parts[1] === "field") return parts.slice(2).join(" ");
  if (parts[0] === "evaluation" && parts[1] === "final") return parts.slice(2).join(" ");
  if (parts[0] === "evaluation" && parts[1] === "checklist") return `Checklist ${Number(parts[2]) + 1} · ${parts[3] === "status" ? "Estatus" : "Observaciones"}`;
  if (parts[0] === "evaluation" && parts[1] === "status-option") return `Estatus · ${parts.slice(2).join(" ")}`;
  if (parts[0] === "field") return parts.slice(1).join(" ");
  if (parts[0] === "summary") return parts.slice(1).join(" ");
  if (parts[0] === "question") return parts.slice(1).join(" ");
  if (parts[0] === "table") return `${parts[1]} · Fila ${Number(parts[2]) + 1} · Columna ${Number(parts[3]) + 1}`;
  return key;
}

function sortDocumentValues(values: Record<string, string>) {
  const priority = ["businessUnit", "position", "format", "frequency", "keyArea", "date", "period", "evaluatedPersonName", "evaluatorName"];
  return Object.entries(values).sort(([a], [b]) => {
    const aIndex = priority.indexOf(a);
    const bIndex = priority.indexOf(b);
    if (aIndex !== -1 || bIndex !== -1) return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    return formatValueKey(a).localeCompare(formatValueKey(b), "es-MX");
  });
}

function getRows(tableData: OperationTemplateTable) {
  const labels = tableData.rowLabels ?? [];
  const totalRows = Math.max(labels.length, tableData.blankRows ?? 0, 1);
  return Array.from({ length: totalRows }, (_, index) => labels[index] ?? "");
}

const table = (title: string, columns: string[], rowLabels?: string[], blankRows?: number): OperationTemplateTable => ({ title, columns, rowLabels, blankRows });

function getOperationFrequency(item: OperationFormatItem, position: Position | undefined) {
  return item.template?.frequency ?? position?.suggestedFrequency ?? "Semanal / Mensual";
}

function buildFallbackOperationTemplate(item: OperationFormatItem, operation: OperationFormatSet, position: Position | undefined): OperationTemplate {
  return {
    title: item.format,
    subtitle: `${operation.positionName} · ${item.keyArea}`,
    sourceFile: "Plantilla generada en plataforma",
    frequency: getOperationFrequency(item, position),
    fields: ["Fecha de actualización", "Periodo revisado", "Responsable", "Estado general"],
    summaryFields: ["Objetivo del periodo", "Prioridad operativa", "Observación ejecutiva"],
    questions: ["¿Qué avance debe registrarse?", "¿Qué bloqueo o necesidad requiere seguimiento?", "¿Qué evidencia debe adjuntarse?", "¿Qué decisión debe escalarse?"],
    tables: [
      table("Control operativo", ["Frente / actividad", "Frecuencia", "Responsable", "Estatus", "Evidencia", "Observaciones"], [item.keyArea], 3),
      table("Seguimiento inmediato", ["Prioridad", "Acción", "Responsable", "Fecha compromiso", "Resultado esperado"], ["Alta", "Media", "Baja"]),
    ],
  };
}

function buildFocusPrintTemplate(record: DocumentRecord): OperationTemplate {
  return {
    title: record.formatTitle,
    subtitle: record.positionName ?? "Perfil operativo",
    sourceFile: "Formato Focus Diario generado en plataforma",
    frequency: "Diario",
    objective: "Registrar actividades, estado, prioridad, deadline, avance y barreras del Focus Diario.",
    scoreSource: "focus-daily",
    fields: ["Fecha", "Periodo", "Puesto", "Producto diario terminado"],
    summaryFields: ["Cumplimiento diario", "Semáforo general", "Condición resultante"],
    tables: [table(FOCUS_DAILY_TABLE_TITLE, [...FOCUS_DAILY_COLUMNS], undefined, 10)],
  };
}

function withStoredValue(field: Omit<DocumentEditorField, "value">, values: Record<string, string>, defaultValue = ""): DocumentEditorField {
  return { ...field, value: values[field.key] ?? defaultValue };
}

function getEvaluationDocumentFields(record: DocumentRecord, values: Record<string, string>, positions: Position[]): DocumentEditorField[] {
  const position = positions.find((item) => item.id === record.positionId);
  const defaults: Record<string, string> = {
    "evaluation::subjectType": values.subjectType ?? (record.positionId?.startsWith("unit:") ? "Unidad de negocio" : "Colaborador"),
    "evaluation::field::Fecha": values.date ?? "",
    "evaluation::field::Periodo": values.period ?? "",
    "evaluation::field::Persona evaluada": values.evaluatedPersonName ?? "",
    "evaluation::productDefinition": values.productDefinition ?? position?.rep ?? "",
    "evaluation::statistics": values.statistics ?? "",
    "evaluation::targetAttainment": values.finalScore ? `${values.finalScore}%` : "",
    "evaluation::condition": values.condition ?? "",
    "evaluation::problemStatement": values.problemStatement ?? "",
    "evaluation::dataAnalysis": values.dataAnalysis ?? "",
    "evaluation::solutionPlan": values.solutionPlan ?? "",
    "evaluation::nextTarget": values.nextTarget ?? "",
    "evaluation::followUpDate": values.followUpDate ?? "",
    "evaluation::observations": values.observations ?? "",
  };
  return [
    ...evaluationMethodFields.map(([key, label, section]) => withStoredValue({
      key,
      label,
      section,
      description: key === "evaluation::productDefinition" ? "Debe expresar un resultado terminado y verificable." : key === "evaluation::statistics" ? "Registra el mismo concepto y unidad para el periodo anterior, actual y meta." : undefined,
      requiredByFormat: true,
    }, values, defaults[key] ?? "")),
  ];
}

function getOperationFormatByRecord(record: DocumentRecord, operationFormats: OperationFormatSet[]) {
  const [operationId, indexValue] = (record.formatId ?? "").split("::");
  const operation = operationFormats.find((item) => item.id === operationId) ?? operationFormats.find((item) => item.positionId === record.positionId && item.businessUnitId === record.businessUnitId);
  const index = Number(indexValue);
  const item = operation?.formats[Number.isFinite(index) ? index : 0];
  return { operation, item };
}

function getOperationDocumentFields(record: DocumentRecord, values: Record<string, string>, operationFormats: OperationFormatSet[], positions: Position[]): DocumentEditorField[] {
  const { operation, item } = getOperationFormatByRecord(record, operationFormats);
  const linkedPosition = positions.find((position) => position.id === (operation?.positionId ?? record.positionId));
  const template = record.formatId?.startsWith("focus-print::")
    ? buildFocusPrintTemplate(record)
    : item && operation ? item.template ?? buildFallbackOperationTemplate(item, operation, linkedPosition) : undefined;
  const isFocusDaily = template?.scoreSource === "focus-daily";
  const focusRowCount = isFocusDaily ? getFocusDailyRowCount(values, template?.tables[0]?.blankRows ?? 5) : 0;
  const focusProgress = isFocusDaily ? calculateFocusDailyProgress(values, focusRowCount) : undefined;
  const focusSummary: Record<string, string> = focusProgress ? focusDailySummaryValues(focusProgress, values) : {};
  const fields: DocumentEditorField[] = [];
  if (isFocusDaily) {
    fields.push(withStoredValue({
      key: FOCUS_DAILY_ROW_COUNT_KEY,
      label: "Número de actividades",
      section: "Datos del archivo",
      description: "Puedes cambiar este número para agregar o quitar filas del documento archivado.",
      requiredByFormat: true,
    }, values, String(focusRowCount)));
  }

  const operationFields = template?.fields ?? ["Fecha de actualización", "Periodo revisado", "Responsable", "Estado general"];
  operationFields.forEach((field) => {
    const key = valueKey("field", field);
    const descriptions: Record<string, string> = {
      [FOCUS_FIELD_PRODUCT]: "Describe un entregable terminado y verificable, no una actividad.",
      [FOCUS_FIELD_PERCENTAGE]: "Si la meta es numérica, se recalculará con resultado ÷ meta × 100. No se limita a 100%.",
    };
    const options: Record<string, string[]> = {
      [FOCUS_FIELD_INDICATOR]: linkedPosition?.kpis.map((kpi) => kpi.name) ?? [],
      [FOCUS_FIELD_PRODUCT_STATUS]: ["Terminado", "En proceso", "No iniciado"],
      [FOCUS_FIELD_GOAL_TYPE]: ["Numérica", "Porcentaje", "Entregable"],
    };
    const calculatedValue = key === FOCUS_FIELD_PERCENTAGE && typeof focusProgress?.score === "number" ? String(focusProgress.score) : undefined;
    fields.push(withStoredValue({
      key,
      label: field,
      section: "Mi FOCUS de hoy",
      description: descriptions[key],
      options: options[key]?.length ? options[key] : undefined,
      maxLength: key === FOCUS_FIELD_PRODUCT ? 220 : undefined,
      readOnly: key === FOCUS_FIELD_PERCENTAGE && Boolean(values[FOCUS_FIELD_GOAL]?.trim() && values[FOCUS_FIELD_RESULT]?.trim()),
      requiredByFormat: [FOCUS_FIELD_COLLABORATOR, FOCUS_FIELD_DATE, FOCUS_FIELD_INDICATOR, FOCUS_FIELD_PRODUCT, FOCUS_FIELD_PRODUCT_STATUS, FOCUS_FIELD_GOAL_TYPE, FOCUS_FIELD_PERCENTAGE].includes(key),
    }, values, calculatedValue ?? ""));
  });

  const appendSummaryFields = () => template?.summaryFields?.forEach((field) => {
    const key = valueKey("summary", field);
    const isEditableFocusSummary = isFocusDaily && (key === FOCUS_SUMMARY_CAUSE || key === FOCUS_SUMMARY_ACTION);
    fields.push({
      key,
      label: field,
      section: isFocusDaily ? "Lectura y acción guiada" : "Resumen operativo",
      value: isFocusDaily ? focusSummary[key] ?? "" : values[key] ?? "",
      description: key === FOCUS_SUMMARY_CAUSE
        ? "Anota la causa real que vas a manejar, no una justificación."
        : key === FOCUS_SUMMARY_ACTION
          ? "Define una acción específica a partir del resultado diario. La condición se calculará al comparar semanas."
          : undefined,
      readOnly: isFocusDaily && !isEditableFocusSummary,
      maxLength: key === FOCUS_SUMMARY_CAUSE || key === FOCUS_SUMMARY_ACTION ? 180 : undefined,
      requiredByFormat: true,
    });
  });
  if (!isFocusDaily) appendSummaryFields();

  template?.questions?.forEach((question) => fields.push(withStoredValue({
    key: valueKey("question", question),
    label: question,
    section: "Preguntas guía",
    requiredByFormat: true,
  }, values)));

  template?.tables.forEach((tableData) => {
    const rows = isFocusDaily && tableData.title === FOCUS_DAILY_TABLE_TITLE
      ? Array.from({ length: focusRowCount }, () => "")
      : getRows(tableData);
    rows.forEach((rowLabel, rowIndex) => {
      tableData.columns.forEach((column, columnIndex) => {
        if (columnIndex === 0 && rowLabel) return;
        if (isFocusDaily && tableData.title === FOCUS_DAILY_TABLE_TITLE && column === "#") return;
        const focusActivity = isFocusDaily && tableData.title === FOCUS_DAILY_TABLE_TITLE
          ? {
              name: values[valueKey("table", tableData.title, rowIndex, FOCUS_DAILY_COLUMN_INDEX.activity)] ?? "",
              activityStatus: values[valueKey("table", tableData.title, rowIndex, FOCUS_DAILY_COLUMN_INDEX.status)] ?? "",
              activityPriority: values[valueKey("table", tableData.title, rowIndex, FOCUS_DAILY_COLUMN_INDEX.priority)] ?? "",
              deadline: values[valueKey("table", tableData.title, rowIndex, FOCUS_DAILY_COLUMN_INDEX.deadline)] ?? "",
              currentValue: Number(values[valueKey("table", tableData.title, rowIndex, FOCUS_DAILY_COLUMN_INDEX.progress)] ?? 0),
              description: values[valueKey("table", tableData.title, rowIndex, FOCUS_DAILY_COLUMN_INDEX.blockageReason)] ?? "",
            }
          : undefined;
        if (isFocusDaily && tableData.title === FOCUS_DAILY_TABLE_TITLE && column === "Semáforo") {
          const semaphore = getFocusDailyActivitySemaphore(focusActivity ?? {});
          fields.push({
            key: valueKey("table", tableData.title, rowIndex, columnIndex),
            label: `${rowLabel || `Fila ${rowIndex + 1}`} · ${column}`,
            section: tableData.title,
            value: focusActivity?.name ? `${semaphore.label} · ${semaphore.helper}` : "",
            readOnly: true,
            requiredByFormat: true,
          });
          return;
        }
        const field = withStoredValue({
          key: valueKey("table", tableData.title, rowIndex, columnIndex),
          label: `${rowLabel || `Fila ${rowIndex + 1}`} · ${column}`,
          section: tableData.title,
          description: isFocusDaily && tableData.title === FOCUS_DAILY_TABLE_TITLE && column === "Motivo / avance"
            ? "Obligatorio si el avance es menor a 100% o la actividad no ha iniciado."
            : undefined,
          options: isFocusDaily && tableData.title === FOCUS_DAILY_TABLE_TITLE && column === "Estado"
            ? [...FOCUS_DAILY_STATUSES]
            : isFocusDaily && tableData.title === FOCUS_DAILY_TABLE_TITLE && column === "Prioridad"
              ? [...FOCUS_DAILY_PRIORITIES]
              : undefined,
          maxLength: isFocusDaily && tableData.title === FOCUS_DAILY_TABLE_TITLE && column === "Motivo / avance" ? 180 : undefined,
          requiredByFormat: isFocusDaily && tableData.title === FOCUS_DAILY_TABLE_TITLE && column === "Motivo / avance"
            ? Boolean(focusActivity?.name && (normalizeFocusDailyStatus(focusActivity.activityStatus) === "No iniciado" || (focusActivity.currentValue ?? 0) < 100))
            : true,
        }, values);
        if (isFocusDaily && tableData.title === FOCUS_DAILY_TABLE_TITLE && column === "Estado") {
          field.value = normalizeFocusDailyStatus(field.value);
        }
        fields.push(field);
      });
    });
  });
  if (isFocusDaily) appendSummaryFields();

  return record.focusValidationStatus === "Aprobado"
    ? fields.map((field) => ({ ...field, readOnly: true }))
    : fields;
}

function getDocumentEditorFields(record: DocumentRecord | undefined, values: Record<string, string>, operationFormats: OperationFormatSet[], positions: Position[]): DocumentEditorField[] {
  if (!record) return [];
  const baseFields = record.type === "evaluation"
    ? getEvaluationDocumentFields(record, values, positions)
    : getOperationDocumentFields(record, values, operationFormats, positions);
  const knownKeys = new Set(baseFields.map((field) => field.key));
  const legacyMetadataKeys = new Set([
    "businessUnit",
    "position",
    "format",
    "evaluatedPersonName",
    "evaluatorName",
    "evaluation::field::Evaluador",
    "date",
    "period",
    "week",
    "month",
    "season",
    "subjectType",
    "productDefinition",
    "statistics",
    "finalScore",
    "condition",
    "problemStatement",
    "dataAnalysis",
    "solutionPlan",
    "nextTarget",
    "observations",
    "followUpDate",
  ]);
  const additionalFields: DocumentEditorField[] = sortDocumentValues(values)
    .filter(([key]) => !knownKeys.has(key) && !(record.type === "evaluation" && legacyMetadataKeys.has(key)))
    .map(([key, value]) => ({ key, label: formatValueKey(key), section: "Campos adicionales", value, requiredByFormat: false }));
  return [...baseFields, ...additionalFields];
}

function groupDocumentFields(fields: DocumentEditorField[]) {
  return fields.reduce<Array<{ title: string; fields: DocumentEditorField[] }>>((sections, field) => {
    const existing = sections.find((section) => section.title === field.section);
    if (existing) existing.fields.push(field);
    else sections.push({ title: field.section, fields: [field] });
    return sections;
  }, []);
}

export function EvaluationTable({
  canEditDocuments = true,
  documents,
  evaluations,
  indicatorRecords,
  operationFormats,
  positions,
  profiles,
  units,
  updateDocument,
}: {
  canEditDocuments?: boolean;
  documents: DocumentRecord[];
  evaluations: Evaluation[];
  indicatorRecords: WeeklyPositionIndicatorEvaluation[];
  operationFormats: OperationFormatSet[];
  positions: Position[];
  profiles: CollaboratorProfile[];
  units: BusinessUnit[];
  updateDocument: (folio: string, patch: Partial<DocumentRecord>) => DocumentRecord;
}) {
  const unitOptions = units.filter((unit) => evaluations.some((item) => item.businessUnitId === unit.id));
  const areaOptions = unique(evaluations.map((item) => item.area));
  const positionOptions = positions.filter((position) => evaluations.some((item) => item.positionId === position.id));
  const positionGroups = groupByOperationalLevel(positionOptions, (item) => item.name);
  const dateOptions = unique(evaluations.map((item) => item.date));
  const yearOptions = unique(evaluations.map((item) => item.date.slice(0, 4)));
  const conditionOptions = OPERATIONAL_CONDITIONS.filter((condition) => evaluations.some((item) => item.condition === condition));
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ search: "", unit: "", area: "", position: "", date: "", year: "", condition: "" });
  const [documentSearch, setDocumentSearch] = useState("");
  const [selectedFolio, setSelectedFolio] = useState("");
  const [selectedEvaluationId, setSelectedEvaluationId] = useState("");
  const [selectedIndicatorId, setSelectedIndicatorId] = useState("");
  const [documentValues, setDocumentValues] = useState<Record<string, string>>({});
  const [customField, setCustomField] = useState({ label: "", value: "" });
  const [editorNotice, setEditorNotice] = useState("");
  const [validationComment, setValidationComment] = useState("");
  const filtered = useMemo(() => evaluations.filter((item) => {
    const haystack = `${item.documentFolio ?? ""} ${getEvaluationProfileKey(item)} ${item.evaluatedPersonName} ${item.positionName} ${item.id}`.toLowerCase();
    return (!filters.search || haystack.includes(filters.search.toLowerCase())) && (!filters.unit || item.businessUnitId === filters.unit) && (!filters.area || item.area === filters.area) && (!filters.position || item.positionId === filters.position) && (!filters.date || item.date === filters.date) && (!filters.year || item.date.startsWith(filters.year)) && (!filters.condition || item.condition === filters.condition);
  }), [evaluations, filters]);
  const filteredDocuments = useMemo(() => {
    const term = documentSearch.trim().toLowerCase();
    if (!term) return documents;
    return documents.filter((item) => `${item.folio} ${documentTypeLabel[item.type]} ${documentStatusLabel[item.status]} ${item.businessUnitName} ${item.positionName ?? ""} ${item.formatTitle} ${item.formatCode ?? ""}`.toLowerCase().includes(term));
  }, [documentSearch, documents]);
  const selectedDocument = useMemo(() => documents.find((item) => item.folio === selectedFolio), [documents, selectedFolio]);
  const selectedEvaluation = useMemo(() => evaluations.find((item) => item.id === selectedEvaluationId), [evaluations, selectedEvaluationId]);
  const selectedIndicatorRecord = useMemo(() => indicatorRecords.find((item) => item.id === selectedIndicatorId), [indicatorRecords, selectedIndicatorId]);
  const selectedOperationContext = useMemo(() => selectedDocument?.type === "operation" ? getOperationFormatByRecord(selectedDocument, operationFormats) : undefined, [operationFormats, selectedDocument]);
  const selectedOperationTemplate = useMemo(() => {
    if (!selectedDocument) return undefined;
    if (selectedDocument.type === "operation" && selectedDocument.formatId?.startsWith("focus-print::")) return buildFocusPrintTemplate(selectedDocument);
    if (!selectedOperationContext?.operation || !selectedOperationContext.item) return undefined;
    const linkedPosition = positions.find((position) => position.id === (selectedOperationContext.operation?.positionId ?? selectedDocument.positionId));
    return selectedOperationContext.item.template ?? buildFallbackOperationTemplate(selectedOperationContext.item, selectedOperationContext.operation, linkedPosition);
  }, [positions, selectedDocument, selectedOperationContext]);
  const selectedIsFocus = selectedOperationTemplate?.scoreSource === "focus-daily";
  const selectedFocusProgress = selectedIsFocus
    ? calculateFocusDailyProgress(documentValues, getFocusDailyRowCount(documentValues, selectedOperationTemplate.tables[0]?.blankRows ?? 5))
    : undefined;
  const documentEditorFields = useMemo(() => getDocumentEditorFields(selectedDocument, documentValues, operationFormats, positions), [documentValues, operationFormats, positions, selectedDocument]);
  const documentEditorSections = useMemo(() => groupDocumentFields(documentEditorFields), [documentEditorFields]);
  const missingRequiredFields = useMemo(() => documentEditorFields.filter((field) => field.requiredByFormat && !field.readOnly && !field.value.trim()).length, [documentEditorFields]);
  const update = (name: keyof typeof filters, value: string) => setFilters((current) => ({ ...current, [name]: value }));

  useEffect(() => {
    if (!selectedDocument) return;
    setDocumentValues(selectedDocument.values ?? {});
    setCustomField({ label: "", value: "" });
    setValidationComment(selectedDocument.focusValidationComment ?? "");
    setEditorNotice("");
  }, [selectedDocument?.folio]);

  function selectDocument(record: DocumentRecord) {
    setSelectedFolio(record.folio);
    window.requestAnimationFrame(() => window.document.getElementById("document-editor")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function selectEvaluation(record: Evaluation) {
    setSelectedEvaluationId(record.id);
    window.requestAnimationFrame(() => window.document.getElementById("evaluation-record-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function selectIndicatorRecord(record: WeeklyPositionIndicatorEvaluation) {
    setSelectedIndicatorId(record.id);
    window.requestAnimationFrame(() => window.document.getElementById("indicator-record-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function updateDocumentValue(key: string, value: string) {
    if (!canEditDocuments) return;
    setDocumentValues((current) => ({ ...current, [key]: value }));
    setEditorNotice("");
  }

  function removeDocumentValue(key: string) {
    if (!canEditDocuments) return;
    setDocumentValues((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setEditorNotice("");
  }

  function addCustomField() {
    if (!canEditDocuments) return;
    const label = customField.label.trim();
    if (!label) return;
    setDocumentValues((current) => {
      let key = label;
      let index = 2;
      while (key in current) {
        key = `${label} (${index})`;
        index += 1;
      }
      return { ...current, [key]: customField.value };
    });
    setCustomField({ label: "", value: "" });
    setEditorNotice("");
  }

  function saveDocument(markComplete: boolean) {
    if (!canEditDocuments || !selectedDocument) return;
    const completedPrinted = markComplete && selectedDocument.status === "printed";
    const nextStatus = completedPrinted ? "printed-digital" : selectedDocument.status;
    const completeValues = documentEditorFields.reduce<Record<string, string>>((next, field) => ({ ...next, [field.key]: field.value }), { ...documentValues });
    const operationFormat = selectedDocument.type === "operation" ? getOperationFormatByRecord(selectedDocument, operationFormats) : undefined;
    const linkedPosition = selectedDocument.type === "operation" ? positions.find((position) => position.id === (operationFormat?.operation?.positionId ?? selectedDocument.positionId)) : undefined;
    const operationTemplate = selectedDocument.type === "operation" && operationFormat?.operation && operationFormat.item
      ? operationFormat.item.template ?? buildFallbackOperationTemplate(operationFormat.item, operationFormat.operation, linkedPosition)
      : undefined;
    const progress = operationTemplate?.scoreSource === "focus-daily"
      ? calculateFocusDailyProgress(completeValues, getFocusDailyRowCount(completeValues, operationTemplate.tables[0]?.blankRows ?? 5))
      : undefined;
    const focusErrors = progress && operationTemplate
      ? getFocusDailyValidationErrors(completeValues, getFocusDailyRowCount(completeValues, operationTemplate.tables[0]?.blankRows ?? 5))
      : [];
    if (progress && markComplete && focusErrors.length) {
      setEditorNotice(focusErrors[0]);
      return;
    }
    if (progress && markComplete) {
      const collaborator = completeValues[FOCUS_FIELD_COLLABORATOR]?.trim().toLocaleLowerCase("es-MX");
      const date = completeValues[FOCUS_FIELD_DATE]?.slice(0, 10);
      const duplicate = getFocusDailyEntries(documents).find((entry) => entry.folio !== selectedDocument.folio
        && entry.positionId === (selectedDocument.positionId ?? selectedDocument.positionName)
        && entry.collaborator.toLocaleLowerCase("es-MX") === collaborator
        && entry.date.slice(0, 10) === date);
      if (collaborator && date && duplicate) {
        setEditorNotice(`Ya existe un FOCUS para este colaborador en la fecha indicada (${duplicate.folio}).`);
        return;
      }
    }
    updateDocument(selectedDocument.folio, {
      status: nextStatus,
      digitalCapturedAt: markComplete ? new Date().toISOString() : selectedDocument.digitalCapturedAt,
      values: completeValues,
      score: progress?.score,
      semaphore: progress?.semaphore,
      focusPreliminaryCondition: progress?.trendCondition === "Sin histórico suficiente" ? undefined : progress?.trendCondition,
      focusTrendCondition: progress?.trendCondition,
      focusTrendDeltaPP: progress?.trendDeltaPP,
      focusPreviousWeightedScore: progress?.previousWeightedScore,
      focusRollingAverageLast4: progress?.rollingAverageLast4,
      focusRollingMinimumLast4: progress?.rollingMinimumLast4,
      focusIsPowerCondition: progress?.isPowerCondition,
      focusPeakStreakCount: progress?.peakStreakCount,
      focusIsPeakRecoveryPower: progress?.isPeakRecoveryPower,
      focusValidationStatus: progress ? "Pendiente" : selectedDocument.focusValidationStatus,
    });
    setEditorNotice(markComplete ? "Archivo actualizado y marcado como completo." : "Avance guardado en el historial documental.");
  }

  function validateFocus(status: "Aprobado" | "Requiere ajuste") {
    if (!canEditDocuments || !selectedDocument) return;
    updateDocument(selectedDocument.folio, {
      focusValidationStatus: status,
      focusValidationComment: validationComment.trim(),
      focusValidatedAt: new Date().toISOString(),
    });
    setEditorNotice(status === "Aprobado" ? "FOCUS aprobado. Ya alimenta la tendencia semanal." : "FOCUS devuelto para ajuste.");
  }

  return <section className="panel table-panel">
    <div className="panel-heading table-heading"><div><p className="eyebrow">Histórico de evaluaciones</p><h2>Registros con trazabilidad</h2></div><div className="button-row"><button className="secondary-button" onClick={() => setShowFilters((value) => !value)} type="button"><Icon name="filter" size={16} /> Filtros</button><button className="primary-button" disabled={!filtered.length} onClick={() => exportCsv(filtered)} type="button"><Icon name="download" size={16} /> Exportar CSV</button></div></div>
    {showFilters && <div className="table-tools"><label className="search-field"><Icon name="search" size={16} /><input placeholder="Buscar por nombre, puesto o ID" value={filters.search} onChange={(event) => update("search", event.target.value)} /></label><div className="filters-grid">
      {unitOptions.length > 1 ? <label><span>Unidad</span><select value={filters.unit} onChange={(event) => update("unit", event.target.value)}><option value="">Todas</option>{unitOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label> : null}
      {areaOptions.length > 1 ? <label><span>Área</span><select value={filters.area} onChange={(event) => update("area", event.target.value)}><option value="">Todas</option>{areaOptions.map((item) => <option key={item}>{item}</option>)}</select></label> : null}
      {positionOptions.length > 1 ? <label><span>Puesto</span><select value={filters.position} onChange={(event) => update("position", event.target.value)}><option value="">Todos</option>{positionGroups.map((group) => <optgroup key={group.level} label={group.level}>{group.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</optgroup>)}</select></label> : null}
      {dateOptions.length > 1 ? <label><span>Fecha</span><select value={filters.date} onChange={(event) => update("date", event.target.value)}><option value="">Todas</option>{dateOptions.map((item) => <option key={item} value={item}>{formatDisplayDate(item)}</option>)}</select></label> : null}
      {yearOptions.length > 1 ? <label><span>Año</span><select value={filters.year} onChange={(event) => update("year", event.target.value)}><option value="">Todos</option>{yearOptions.map((item) => <option key={item}>{item}</option>)}</select></label> : null}
      {conditionOptions.length > 1 ? <label><span>Condición</span><select value={filters.condition} onChange={(event) => update("condition", event.target.value)}><option value="">Todas</option>{conditionOptions.map((item: OperationalCondition) => <option key={item}>{item}</option>)}</select></label> : null}
    </div></div>}
    <div className="table-count">{filtered.length} registros visibles</div>
    {filtered.length ? <div className="table-scroll"><table><thead><tr><th>Evaluado</th><th>Unidad / puesto</th><th>Producto</th><th>Fecha</th><th>Cumplimiento</th><th>Condición</th><th>Tendencia</th><th>Acción</th></tr></thead><tbody>{filtered.sort((a, b) => b.date.localeCompare(a.date)).map((item) => <tr key={item.id}><td><b>{item.evaluatedPersonName}</b><small>{item.documentFolio ?? item.id}</small></td><td>{item.positionName}<small>{getOperationalLevel(item.positionName)} · {item.area}</small></td><td className="table-product">{item.productDefinition ?? item.rep}</td><td>{formatDisplayDate(item.date)}<small>{item.captureSource}</small></td><td><strong className="table-score">{item.finalScore}%</strong></td><td>{item.condition ? <ConditionBadge condition={item.condition} /> : <span>Sin condición</span>}</td><td><span className={`trend-text ${item.trend.toLowerCase().replace(" ", "-")}`}>{item.trend}</span></td><td><button className="document-row-action" onClick={() => selectEvaluation(item)} type="button"><Icon name="file" size={14} /> Consultar</button></td></tr>)}</tbody></table></div> : <div className="empty-state table-empty"><Icon name="clipboard" size={26} /><strong>Histórico en cero</strong><span>Los registros aparecerán aquí cuando se guarde la primera evaluación real.</span></div>}

    {selectedEvaluation ? <section className="record-detail-panel" id="evaluation-record-detail">
      <div className="document-editor-heading">
        <div>
          <p className="eyebrow">Detalle del registro</p>
          <h3>{selectedEvaluation.evaluatedPersonName}</h3>
          <span>{selectedEvaluation.positionName} · {formatDisplayDate(selectedEvaluation.date)}</span>
        </div>
        {selectedEvaluation.condition ? <ConditionBadge condition={selectedEvaluation.condition} /> : <span className="count-badge">Sin condición</span>}
      </div>
      <div className="document-editor-summary">
        <div><b>Folio / ID</b><span>{selectedEvaluation.documentFolio ?? selectedEvaluation.id}</span></div>
        <div><b>Fecha</b><span>{formatDisplayDate(selectedEvaluation.date)}</span></div>
        <div><b>Cumplimiento</b><span>{selectedEvaluation.finalScore}%</span></div>
        <div><b>Tendencia</b><span>{selectedEvaluation.trend}</span></div>
      </div>
      <div className="record-detail-grid">
        <article><span>Producto</span><p>{selectedEvaluation.productDefinition ?? selectedEvaluation.rep}</p></article>
        {selectedEvaluation.problemStatement ? <article><span>Problemática</span><p>{selectedEvaluation.problemStatement}</p></article> : null}
        {selectedEvaluation.dataAnalysis ? <article><span>Datos</span><p>{selectedEvaluation.dataAnalysis}</p></article> : null}
        {selectedEvaluation.solutionPlan ? <article><span>Solución</span><p>{selectedEvaluation.solutionPlan}</p></article> : null}
        {selectedEvaluation.observations ? <article><span>Observaciones</span><p>{selectedEvaluation.observations}</p></article> : null}
      </div>
      {(selectedEvaluation.statistics ?? []).length ? <div className="record-detail-table-wrap">
        <table className="record-detail-table"><thead><tr><th>Campo / actividad</th><th>Estado</th><th>Avance</th><th>Comentario</th></tr></thead><tbody>{(selectedEvaluation.statistics ?? []).map((statistic, index) => <tr key={`${selectedEvaluation.id}-${statistic.name}-${index}`}>
          <td><b>{statistic.name}</b><small>{statistic.description ? "" : statistic.measurementUnit}</small></td>
          <td>{statistic.activityStatus ?? statistic.currentSelection ?? "Registrado"}</td>
          <td>{statistic.currentValue}{statistic.measurementUnit === "%" ? "%" : ` ${statistic.measurementUnit}`}</td>
          <td>{statistic.description || statistic.condition || "Sin comentario"}</td>
        </tr>)}</tbody></table>
      </div> : null}
    </section> : null}

    <div className="document-history-panel indicator-records-panel">
      <div className="panel-heading table-heading">
        <div><p className="eyebrow">Historial de indicadores</p><h2>Registros semanales de indicadores</h2></div>
        <span className="count-badge">{indicatorRecords.length} registros</span>
      </div>
      {indicatorRecords.length ? <div className="table-scroll"><table className="document-history-table"><thead><tr><th>Perfil</th><th>Puesto</th><th>Fecha</th><th>Score</th><th>Condición</th><th>Acción</th></tr></thead><tbody>{indicatorRecords.map((record) => {
        const profile = profiles.find((item) => item.id === record.collaboratorProfileId);
        const position = positions.find((item) => item.id === record.positionId);
        return <tr key={record.id}>
          <td><b>{profile?.name ?? "Perfil"}</b><small>{record.id}</small></td>
          <td>{position?.name ?? "Puesto"}<small>{position?.area ?? "Sin área"}</small></td>
          <td>{formatDisplayDate(indicatorRecordDate(record))}<small>{record.evaluatorName}</small></td>
          <td><strong className="table-score">{record.weightedScore}%</strong></td>
          <td><ConditionBadge condition={record.weeklyCondition} /></td>
          <td><button className="document-row-action" onClick={() => selectIndicatorRecord(record)} type="button"><Icon name="file" size={14} /> Consultar</button></td>
        </tr>;
      })}</tbody></table></div> : <div className="empty-state table-empty"><Icon name="clipboard" size={26} /><strong>Sin indicadores registrados</strong><span>Cuando se guarde una evaluación semanal de indicadores, aparecerá aquí con sus comentarios.</span></div>}

      {selectedIndicatorRecord ? <section className="record-detail-panel" id="indicator-record-detail">
        <div className="document-editor-heading">
          <div>
            <p className="eyebrow">Detalle de indicadores</p>
            <h3>{profiles.find((item) => item.id === selectedIndicatorRecord.collaboratorProfileId)?.name ?? "Perfil"}</h3>
            <span>{positions.find((item) => item.id === selectedIndicatorRecord.positionId)?.name ?? "Puesto"} · {formatDisplayDate(indicatorRecordDate(selectedIndicatorRecord))}</span>
          </div>
          <ConditionBadge condition={selectedIndicatorRecord.weeklyCondition} />
        </div>
        <div className="document-editor-summary">
          <div><b>Fecha</b><span>{formatDisplayDate(indicatorRecordDate(selectedIndicatorRecord))}</span></div>
          <div><b>Resultado</b><span>{selectedIndicatorRecord.weightedScore}%</span></div>
          <div><b>Condición semanal</b><span>{selectedIndicatorRecord.weeklyConditionDescription ?? selectedIndicatorRecord.weeklyCondition}</span></div>
          <div><b>Fuente</b><span>Indicadores de puesto</span></div>
        </div>
        <div className="record-detail-table-wrap">
          <table className="record-detail-table"><thead><tr><th>Indicador</th><th>Estado</th><th>Avance</th><th>Comentario</th></tr></thead><tbody>{selectedIndicatorRecord.indicators.map((indicator) => <tr key={indicator.indicatorId}>
            <td><b>{indicator.indicatorName}</b></td>
            <td><span className={`indicator-status-pill is-${indicator.statusColor ?? getIndicatorStatusMeta(indicator.score).color}`}><i />{indicator.result}</span></td>
            <td>{indicator.score}%</td>
            <td>{indicator.observations || "Sin comentario"}</td>
          </tr>)}</tbody></table>
        </div>
      </section> : null}
    </div>

    <div className="document-history-panel">
      <div className="panel-heading table-heading">
        <div><p className="eyebrow">Historial documental</p><h2>Consulta por folio</h2></div>
        <span className="count-badge">{filteredDocuments.length} documentos</span>
      </div>
      <div className="document-search-row">
        <label className="search-field"><Icon name="search" size={16} /><input placeholder="Buscar folio EV00026 / OP00026" value={documentSearch} onChange={(event) => setDocumentSearch(event.target.value)} /></label>
      </div>
      {filteredDocuments.length ? <div className="table-scroll"><table className="document-history-table"><thead><tr><th>Folio</th><th>Tipo</th><th>Documento</th><th>Unidad / puesto</th><th>Estado</th><th>Registro</th><th>Acción</th></tr></thead><tbody>{filteredDocuments.map((item) => <tr key={item.folio}>
        <td><b>{item.folio}</b><small>{item.formatCode ?? documentTypeLabel[item.type]}</small></td>
        <td>{documentTypeLabel[item.type]}</td>
        <td>{item.formatTitle}<small>{item.linkedEvaluationId ? `Evaluación ${item.linkedEvaluationId}` : "Sin evaluación ligada"}</small></td>
        <td>{item.businessUnitName}<small>{item.positionName ?? "Sin puesto ligado"}</small></td>
        <td><span className={`document-status ${item.status}`}>{documentStatusLabel[item.status]}</span></td>
        <td>{formatDateTime(item.updatedAt)}<small>{item.printedAt ? `Impreso: ${formatDateTime(item.printedAt)}` : item.digitalCapturedAt ? `Digital: ${formatDateTime(item.digitalCapturedAt)}` : ""}</small></td>
        <td><button className="document-row-action" onClick={() => selectDocument(item)} type="button"><Icon name="file" size={14} /> {canEditDocuments ? "Consultar / editar" : "Consultar"}</button></td>
      </tr>)}</tbody></table></div> : <div className="empty-state table-empty"><Icon name="file" size={26} /><strong>Sin documentos registrados</strong><span>Al guardar o imprimir un formato se asignará un folio y aparecerá en este historial.</span></div>}

      {selectedDocument ? <section className="document-editor-panel" id="document-editor">
        <div className="document-editor-heading">
          <div>
            <p className="eyebrow">Expediente documental</p>
            <h3>{selectedDocument.folio}</h3>
            <span>{documentTypeLabel[selectedDocument.type]} · {selectedDocument.formatTitle}</span>
          </div>
          <span className={`document-status ${selectedDocument.status}`}>{documentStatusLabel[selectedDocument.status]}</span>
        </div>

        <div className="document-editor-summary">
          <div><b>Unidad</b><span>{selectedDocument.businessUnitName}</span></div>
          <div><b>Puesto</b><span>{selectedDocument.positionName ?? "Sin puesto ligado"}</span></div>
          <div><b>Última actualización</b><span>{formatDateTime(selectedDocument.updatedAt)}</span></div>
          <div><b>Campos pendientes</b><span>{missingRequiredFields}</span></div>
          {selectedIsFocus ? <div><b>Validación FOCUS</b><span>{selectedDocument.focusValidationStatus ?? "Pendiente"}</span></div> : null}
        </div>

        <div className="document-section-stack">
          {documentEditorSections.length ? documentEditorSections.map((section) => <section className="document-editor-section" key={section.title}>
            <div className="document-editor-section-heading"><h4>{section.title}</h4><span>{section.fields.filter((field) => !field.value.trim() && !field.readOnly).length} pendientes</span></div>
            <div className="document-value-grid">
              {section.fields.map((field) => {
                const readOnly = field.readOnly || !canEditDocuments;
                return <label className={`document-field ${!field.value.trim() && !readOnly ? "is-empty" : ""} ${readOnly ? "is-readonly" : ""}`} key={field.key}>
                  <span>{field.label}</span>
                  {field.description ? <small>{field.description}</small> : null}
                  {field.options?.length ? <select disabled={readOnly} value={field.value} onChange={(event) => updateDocumentValue(field.key, event.target.value)}>
                    <option value="">Selecciona una opción</option>
                    {field.options.map((option) => <option key={option}>{option}</option>)}
                  </select> : <textarea maxLength={field.maxLength} readOnly={readOnly} value={field.value} onChange={(event) => updateDocumentValue(field.key, event.target.value)} rows={field.value.length > 72 || field.description ? 3 : 1} />}
                  {field.maxLength && !readOnly ? <em>{field.value.length}/{field.maxLength}</em> : null}
                  {!field.requiredByFormat && canEditDocuments ? <button className="mini-link-button" onClick={() => removeDocumentValue(field.key)} type="button">Quitar campo</button> : null}
                </label>;
              })}
            </div>
          </section>) : <div className="empty-state table-empty"><Icon name="file" size={24} /><strong>Archivo sin estructura disponible</strong><span>Agrega campos para completar el registro digital del folio.</span></div>}
        </div>

        {selectedIsFocus && canEditDocuments ? <section className="focus-validation-panel">
          <div className="focus-validation-heading">
            <div><p className="eyebrow">Validación FOCUS</p><h4>Estadística diaria para la tendencia semanal</h4></div>
            <div className="focus-validation-result">
              <strong>{selectedFocusProgress?.score ?? 0}%</strong>
              <span>{selectedFocusProgress?.semaphore ?? "Sin semáforo"} · {selectedFocusProgress?.trendCondition ?? "Sin histórico suficiente"}</span>
            </div>
          </div>
          <label><span>Comentario del responsable</span><textarea maxLength={180} rows={3} value={validationComment} onChange={(event) => setValidationComment(event.target.value)} /></label>
          <div className="focus-validation-actions">
            <button className="secondary-button" onClick={() => validateFocus("Requiere ajuste")} type="button"><Icon name="refresh" size={16} /> Requiere ajuste</button>
            <button className="primary-button" disabled={!selectedFocusProgress?.score && selectedFocusProgress?.score !== 0} onClick={() => validateFocus("Aprobado")} type="button"><Icon name="check" size={16} /> Aprobar FOCUS</button>
          </div>
        </section> : null}

        {canEditDocuments ? <div className="document-add-field">
          <label><span>Nuevo campo</span><input placeholder="Ej. Observación de cierre" value={customField.label} onChange={(event) => setCustomField((current) => ({ ...current, label: event.target.value }))} /></label>
          <label><span>Valor</span><input placeholder="Dato capturado" value={customField.value} onChange={(event) => setCustomField((current) => ({ ...current, value: event.target.value }))} /></label>
          <button className="secondary-button" disabled={!customField.label.trim()} onClick={addCustomField} type="button"><Icon name="plus" size={16} /> Agregar campo</button>
        </div> : null}

        {editorNotice && <p className="document-notice"><Icon name="check" size={14} /> {editorNotice}</p>}
        {canEditDocuments ? <div className="document-editor-actions">
          <button className="secondary-button" disabled={selectedDocument.focusValidationStatus === "Aprobado"} onClick={() => saveDocument(false)} type="button"><Icon name="check" size={16} /> Guardar avance</button>
          <button className="primary-button" disabled={selectedDocument.focusValidationStatus === "Aprobado"} onClick={() => saveDocument(true)} type="button"><Icon name="check" size={16} /> Guardar y marcar completo</button>
        </div> : <p className="document-readonly-note"><Icon name="archive" size={14} /> Modo consulta. Solo el perfil maestro puede editar expedientes.</p>}
      </section> : null}
    </div>
  </section>;
}
