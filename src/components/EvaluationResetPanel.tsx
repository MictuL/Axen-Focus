import { useMemo, useState } from "react";
import { getEvaluationProfileKey } from "../lib/evaluation";
import { getEvaluationResetRange, matchesDocumentReset, matchesEvaluationReset, matchesOperationalGoalReset, matchesUnitConditionReviewReset, matchesWeeklyIndicatorReset, type EvaluationResetRequest, type EvaluationResetResult } from "../lib/evaluationReset";
import type { BusinessUnit, DocumentRecord, Evaluation, OperationalGoalAssignment, UnitConditionReview, WeeklyPositionIndicatorEvaluation } from "../types";
import { Icon } from "./Icon";

export function EvaluationResetPanel({
  documents,
  evaluations,
  goals,
  indicatorRecords,
  initialUnitId,
  onReset,
  reviews,
  units,
}: {
  documents: DocumentRecord[];
  evaluations: Evaluation[];
  goals: OperationalGoalAssignment[];
  indicatorRecords: WeeklyPositionIndicatorEvaluation[];
  initialUnitId: string;
  onReset: (request: EvaluationResetRequest) => EvaluationResetResult;
  reviews: UnitConditionReview[];
  units: BusinessUnit[];
}) {
  const [request, setRequest] = useState<EvaluationResetRequest>({
    businessUnitId: initialUnitId,
    scope: "all",
    referenceDate: new Date().toISOString().slice(0, 10),
  });
  const [confirmation, setConfirmation] = useState("");
  const [notice, setNotice] = useState("");
  const range = getEvaluationResetRange(request.scope, request.referenceDate);
  const matches = useMemo(() => evaluations.filter((evaluation) => matchesEvaluationReset(evaluation, request)), [evaluations, request]);
  const matchingEvaluationIds = useMemo(() => new Set(matches.map((evaluation) => evaluation.id)), [matches]);
  const matchingDocuments = useMemo(() => documents.filter((document) => matchesDocumentReset(document, request, matchingEvaluationIds)), [documents, matchingEvaluationIds, request]);
  const matchingGoals = useMemo(() => goals.filter((goal) => matchesOperationalGoalReset(goal, request)), [goals, request]);
  const matchingIndicatorRecords = useMemo(() => indicatorRecords.filter((record) => matchesWeeklyIndicatorReset(record, request)), [indicatorRecords, request]);
  const matchingReviews = useMemo(() => reviews.filter((review) => matchesUnitConditionReviewReset(review, request, matchingEvaluationIds)), [matchingEvaluationIds, request, reviews]);
  const affectedPeople = new Set(matches.map(getEvaluationProfileKey)).size;
  const unitLabel = request.businessUnitId ? units.find((unit) => unit.id === request.businessUnitId)?.name ?? "Unidad seleccionada" : "Todas las unidades";
  const totalMatches = matches.length + matchingDocuments.length + matchingGoals.length + matchingIndicatorRecords.length + matchingReviews.length;

  function update<K extends keyof EvaluationResetRequest>(key: K, value: EvaluationResetRequest[K]) {
    setRequest((current) => ({ ...current, [key]: value }));
    setConfirmation("");
    setNotice("");
  }

  function reset() {
    if (confirmation !== "RESET" || !totalMatches) return;
    const removed = onReset(request);
    setConfirmation("");
    setNotice(`${removed.total} registros eliminados: ${removed.evaluations} Focus, ${removed.indicatorRecords} indicadores, ${removed.goals} metas, ${removed.documents} documentos y ${removed.reviews} cierres. Los tableros y condiciones ya fueron recalculados.`);
  }

  return <section className="panel evaluation-reset-panel">
    <div className="evaluation-reset-heading">
      <div className="evaluation-reset-icon"><Icon name="refresh" size={20} /></div>
      <div>
        <p className="eyebrow">Zona de control</p>
        <h2>RESET de evaluaciones</h2>
        <p>Elimina capturas operativas de la unidad elegida: Focus, indicadores, metas asignadas, folios, documentos digitales y cierres de condición.</p>
      </div>
    </div>

    <div className="evaluation-reset-grid evaluation-reset-grid-total">
      <label><span>Unidad de negocio</span><select value={request.businessUnitId} onChange={(event) => update("businessUnitId", event.target.value)}>
        <option value="">Todas las unidades</option>
        {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
      </select></label>
      <div className="evaluation-reset-total-note">
        <span>Alcance</span>
        <strong>RESET total</strong>
        <small>Todo el histórico capturado de la unidad seleccionada.</small>
      </div>
    </div>

    <div className="evaluation-reset-preview">
      <div><span>Alcance que se eliminará</span><strong>{range.label}</strong><small>{unitLabel}</small></div>
      <div><span>Focus</span><strong>{matches.length}</strong><small>Capturas diarias</small></div>
      <div><span>Indicadores</span><strong>{matchingIndicatorRecords.length}</strong><small>Evaluaciones semanales</small></div>
      <div><span>Metas</span><strong>{matchingGoals.length}</strong><small>Asignaciones activas</small></div>
      <div><span>Documentos</span><strong>{matchingDocuments.length}</strong><small>Folios e historial</small></div>
      <div><span>Cierres</span><strong>{matchingReviews.length}</strong><small>Condición de unidad</small></div>
      <div><span>Colaboradores</span><strong>{affectedPeople}</strong><small>Perfiles afectados</small></div>
    </div>

    <div className="evaluation-reset-confirm">
      <div>
        <b>Acción irreversible</b>
        <span>Escribe RESET para habilitar la eliminación definitiva del histórico seleccionado.</span>
      </div>
      <label><span>Confirmación</span><input autoComplete="off" placeholder="RESET" value={confirmation} onChange={(event) => setConfirmation(event.target.value.toUpperCase())} /></label>
      <button className="danger-button" disabled={confirmation !== "RESET" || !totalMatches} onClick={reset} type="button"><Icon name="refresh" size={16} /> RESET total</button>
    </div>

    {notice ? <p className="evaluation-reset-notice"><Icon name="check" size={15} /> {notice}</p> : null}
  </section>;
}
