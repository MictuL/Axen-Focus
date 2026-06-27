import { getOperationalLevel } from "./catalog";
import { updatedDefaultRelationships } from "../data/units/updatedOperationalGuides";
import type { CollaboratorProfile, FocusHierarchyRelationship, OperationalLevel, PlatformRole, Position } from "../types";

export const MASTER_ACCESS_ID = "master";
export const MASTER_PROFILE_NAME = "Perfil maestro";

export function getPositionProfileId(positionId: string) {
  return `PROFILE::${positionId}`;
}

export function buildPositionProfiles(positions: Position[]): CollaboratorProfile[] {
  const now = new Date().toISOString();
  return positions
    .filter((position) => position.status === "active")
    .map((position) => ({
      id: getPositionProfileId(position.id),
      businessUnitId: position.businessUnitId,
      positionId: position.id,
      name: position.name,
      status: "active" as const,
      createdAt: now,
      updatedAt: now,
    }));
}

export function roleForPosition(position?: Position): PlatformRole {
  if (!position) return "Colaborador";
  const level = getOperationalLevel(position);
  if (level === "Planeación") return "Director de Unidad";
  if (level === "Supervisión") {
    const normalizedName = position.name.toLocaleLowerCase("es-MX");
    return normalizedName.includes("gerente") ? "Gerente" : "Coordinador";
  }
  return "Colaborador";
}

export function labelForOperationalLevel(level?: OperationalLevel) {
  if (level === "Planeación") return "Dirección";
  if (level === "Supervisión") return "Responsable de área";
  return "Colaborador";
}

export const defaultFocusRelationships: FocusHierarchyRelationship[] = [
  ...updatedDefaultRelationships,
];
