import { useState } from "react";
import { matchesUnitConditionReviewReset, type EvaluationResetRequest } from "../lib/evaluationReset";
import type { UnitConditionReview, UnitConditionReviewDraft } from "../types";

const STORAGE_KEY = "axen-unit-condition-reviews-v2";
const LEGACY_STORAGE_KEY = "axen-unit-condition-reviews-v1";

function loadReviews(): UnitConditionReview[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as UnitConditionReview[]).map((review) => ({
      ...review,
      operationalLevel: review.operationalLevel ?? "Planeación",
      positionId: review.positionId ?? "",
      positionName: review.positionName ?? "Dirección UDN",
      sourceLevel: review.sourceLevel ?? "Supervisión",
      sourceReviewIds: review.sourceReviewIds ?? [],
    })) : [];
  } catch {
    return [];
  }
}

export function useUnitConditionReviews() {
  const [reviews, setReviews] = useState<UnitConditionReview[]>(loadReviews);

  function addReview(draft: UnitConditionReviewDraft) {
    if (!draft.businessUnitId || (!draft.evaluationIds.length && !draft.sourceReviewIds.length)) throw new Error("Este escalón todavía no tiene resultados de la capa inferior.");
    if (!draft.positionId || !draft.positionName) throw new Error("Selecciona el responsable del escalón.");
    if (!draft.reviewerName.trim() || !draft.finalComments.trim() || !draft.detectedCauses.trim() || !draft.actionPlan.trim()) {
      throw new Error("Completa responsable, comentarios finales, causas detectadas y plan de acción.");
    }
    const review: UnitConditionReview = {
      ...draft,
      id: `UDN-${Date.now()}`,
      reviewerName: draft.reviewerName.trim(),
      finalComments: draft.finalComments.trim(),
      detectedCauses: draft.detectedCauses.trim(),
      actionPlan: draft.actionPlan.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = [review, ...reviews];
    setReviews(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return review;
  }

  function removeReviewsByEvaluationIds(evaluationIds: string[]) {
    const ids = new Set(evaluationIds);
    const next = reviews.filter((review) => !review.evaluationIds.some((id) => ids.has(id)));
    const removed = reviews.length - next.length;
    setReviews(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return removed;
  }

  function removeReviewsByReset(request: EvaluationResetRequest, evaluationIds: string[] = []) {
    const evaluationIdSet = new Set(evaluationIds);
    const removedIds = new Set<string>();
    let next = reviews;
    let changed = true;

    while (changed) {
      changed = false;
      const remaining = next.filter((review) => {
        const shouldRemove = matchesUnitConditionReviewReset(review, request, evaluationIdSet)
          || review.sourceReviewIds.some((id) => removedIds.has(id));
        if (shouldRemove) {
          removedIds.add(review.id);
          changed = true;
        }
        return !shouldRemove;
      });
      next = remaining;
    }

    const removed = reviews.length - next.length;
    if (removed) {
      setReviews(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
    return removed;
  }

  function clearReviews() {
    setReviews([]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }

  return { reviews, addReview, removeReviewsByEvaluationIds, removeReviewsByReset, clearReviews };
}
