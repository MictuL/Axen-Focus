import { useState } from "react";
import type { FocusHierarchyRelationship } from "../types";
import { validateRelationshipConfiguration } from "../lib/focusConsolidation";
import { defaultFocusRelationships } from "../lib/fundacionAccess";

const STORAGE_KEY = "axen-focus-hierarchy-relationships-v1";

function loadRelationships() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as FocusHierarchyRelationship[];
    const merged = new Map([...defaultFocusRelationships, ...stored].map((relationship) => [relationship.id, relationship]));
    return [...merged.values()];
  } catch {
    return defaultFocusRelationships;
  }
}

function createRelationshipId() {
  return `REL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function orderRelationships(left: FocusHierarchyRelationship, right: FocusHierarchyRelationship) {
  return left.businessUnitId.localeCompare(right.businessUnitId)
    || left.targetProfileId.localeCompare(right.targetProfileId)
    || left.sourceProfileId.localeCompare(right.sourceProfileId);
}

export function useFocusRelationships() {
  const [relationships, setRelationships] = useState<FocusHierarchyRelationship[]>(loadRelationships);

  function save(next: FocusHierarchyRelationship[]) {
    const ordered = [...next].sort(orderRelationships);
    setRelationships(ordered);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ordered));
    return ordered;
  }

  function upsertRelationship(input: Omit<FocusHierarchyRelationship, "id" | "createdAt" | "updatedAt"> & { id?: string; createdAt?: string }) {
    const now = new Date().toISOString();
    const relationship: FocusHierarchyRelationship = {
      ...input,
      id: input.id || createRelationshipId(),
      weight: Number.isFinite(input.weight) && input.weight > 0 ? input.weight : 1,
      createdAt: input.createdAt || now,
      updatedAt: now,
    };
    const errors = validateRelationshipConfiguration(relationship, relationships);
    if (errors.length) throw new Error(errors[0]);
    const exists = relationships.some((item) => item.id === relationship.id);
    return save(exists
      ? relationships.map((item) => item.id === relationship.id ? relationship : item)
      : [...relationships, relationship]);
  }

  function deactivateRelationship(id: string) {
    save(relationships.map((item) => item.id === id ? { ...item, status: "inactive", updatedAt: new Date().toISOString() } : item));
  }

  function deleteRelationship(id: string) {
    save(relationships.filter((item) => item.id !== id));
  }

  return { relationships, upsertRelationship, deactivateRelationship, deleteRelationship };
}
