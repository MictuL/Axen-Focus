import type { DocumentRecord, DocumentType } from "../types";

export const getDocumentPrefix = (type: DocumentType) => type === "evaluation" ? "EV" : "OP";

export function getDocumentYearSuffix(date = new Date()) {
  return String(date.getFullYear()).slice(-2);
}

export function formatDocumentFolio(type: DocumentType, sequence: number, date = new Date()) {
  return `${getDocumentPrefix(type)}${String(sequence).padStart(3, "0")}${getDocumentYearSuffix(date)}`;
}

export function parseDocumentFolio(folio: string) {
  const normalized = folio.trim().toUpperCase();
  const match = normalized.match(/^([A-Z]{2})(\d+)(\d{2})$/);
  if (!match) return undefined;
  return {
    folio: normalized,
    prefix: match[1],
    sequence: Number(match[2]),
    yearSuffix: match[3],
  };
}

export function getNextDocumentFolio(type: DocumentType, records: DocumentRecord[], date = new Date()) {
  const prefix = getDocumentPrefix(type);
  const yearSuffix = getDocumentYearSuffix(date);
  const lastSequence = records.reduce((max, item) => {
    const parsed = parseDocumentFolio(item.folio);
    if (!parsed || parsed.prefix !== prefix || parsed.yearSuffix !== yearSuffix) return max;
    return Math.max(max, parsed.sequence);
  }, -1);
  return formatDocumentFolio(type, lastSequence + 1, date);
}

export const normalizeDocumentFolio = (folio: string) => folio.trim().toUpperCase();
