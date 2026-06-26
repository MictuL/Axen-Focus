import { useState } from "react";
import { matchesDocumentReset, type EvaluationResetRequest } from "../lib/evaluationReset";
import { getNextDocumentFolio, normalizeDocumentFolio } from "../lib/folios";
import type { DocumentRecord, DocumentRecordInput } from "../types";

const STORAGE_KEY = "axen-document-registry-v1";

function loadDocuments(): DocumentRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) as DocumentRecord[] : [];
  } catch {
    return [];
  }
}

export function useDocumentRegistry() {
  const [documents, setDocuments] = useState<DocumentRecord[]>(loadDocuments);

  function save(next: DocumentRecord[]) {
    setDocuments(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function createDocument(input: DocumentRecordInput) {
    const now = new Date().toISOString();
    const folio = input.folio ? normalizeDocumentFolio(input.folio) : getNextDocumentFolio(input.type, documents, new Date(now));
    if (documents.some((item) => item.folio === folio)) throw new Error(`El folio ${folio} ya existe en el historial documental.`);
    const record: DocumentRecord = {
      ...input,
      folio,
      createdAt: now,
      updatedAt: now,
      printedAt: input.printedAt ?? (input.status === "printed" || input.status === "printed-digital" ? now : undefined),
      digitalCapturedAt: input.digitalCapturedAt ?? (input.status === "digital" ? now : undefined),
    };
    save([record, ...documents]);
    return record;
  }

  function updateDocument(folioValue: string, patch: Partial<DocumentRecord>) {
    const folio = normalizeDocumentFolio(folioValue);
    const now = new Date().toISOString();
    let updated: DocumentRecord | undefined;
    const next = documents.map((item) => {
      if (item.folio !== folio) return item;
      updated = { ...item, ...patch, folio, updatedAt: now };
      return updated;
    });
    if (!updated) throw new Error(`No se encontró el folio ${folio}.`);
    save(next);
    return updated;
  }

  function getDocument(folioValue: string) {
    const folio = normalizeDocumentFolio(folioValue);
    return documents.find((item) => item.folio === folio);
  }

  function removeDocumentsByEvaluationIds(evaluationIds: string[]) {
    const ids = new Set(evaluationIds);
    const removed = documents.filter((document) => document.type === "evaluation" && document.linkedEvaluationId && ids.has(document.linkedEvaluationId));
    save(documents.filter((document) => !removed.some((candidate) => candidate.folio === document.folio)));
    return removed.length;
  }

  function removeDocumentsByReset(request: EvaluationResetRequest, evaluationIds: string[] = []) {
    const ids = new Set(evaluationIds);
    const removed = documents.filter((document) => matchesDocumentReset(document, request, ids));
    if (removed.length) {
      const removedFolios = new Set(removed.map((document) => document.folio));
      save(documents.filter((document) => !removedFolios.has(document.folio)));
    }
    return removed.length;
  }

  function clearDocuments() {
    save([]);
  }

  return { documents, createDocument, updateDocument, getDocument, removeDocumentsByEvaluationIds, removeDocumentsByReset, clearDocuments };
}
