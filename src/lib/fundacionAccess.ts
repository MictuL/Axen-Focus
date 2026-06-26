import { AXEN_ENERGY_UNIT_ID, AXEN_HEALTH_UNIT_ID } from "../data/units/axenEnergyHealth";
import { FUNDACION_DANTE_UNIT_ID } from "../data/units/fundacionDante";
import { createPositionId, getOperationalLevel } from "./catalog";
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

function relationship(
  unitId: string,
  sourceSlug: string,
  targetSlug: string,
  relationshipType: FocusHierarchyRelationship["relationshipType"] = "Reporta directamente a",
): FocusHierarchyRelationship {
  const sourcePositionId = createPositionId(unitId, sourceSlug);
  const targetPositionId = createPositionId(unitId, targetSlug);
  const now = "2026-06-17";
  return {
    id: `REL::${unitId}::${sourceSlug}::${targetSlug}`,
    businessUnitId: unitId,
    sourceProfileId: getPositionProfileId(sourcePositionId),
    targetProfileId: getPositionProfileId(targetPositionId),
    relationshipType,
    weight: 1,
    startDate: now,
    status: "active",
    createdBy: "Sistema",
    createdAt: now,
    updatedAt: now,
  };
}

export const fundacionDefaultRelationships: FocusHierarchyRelationship[] = [
  relationship(FUNDACION_DANTE_UNIT_ID, "coordinador-procuracion-fondos", "director-general"),
  relationship(FUNDACION_DANTE_UNIT_ID, "coordinador-responsabilidad-social", "director-general"),
  relationship(FUNDACION_DANTE_UNIT_ID, "ejecutivo-cuentas-finanzas", "director-general"),
  relationship(FUNDACION_DANTE_UNIT_ID, "coordinador-activaciones", "director-general"),
  relationship(FUNDACION_DANTE_UNIT_ID, "voluntariado-procuracion-fondos", "coordinador-procuracion-fondos"),
  relationship(FUNDACION_DANTE_UNIT_ID, "voluntariado-activaciones", "coordinador-activaciones"),
];

export const axenEnergyDefaultRelationships: FocusHierarchyRelationship[] = [
  relationship(AXEN_ENERGY_UNIT_ID, "gerente-productos", "director-general"),
  relationship(AXEN_ENERGY_UNIT_ID, "gerente-operativo", "director-general"),
  relationship(AXEN_ENERGY_UNIT_ID, "coordinador-alianzas", "gerente-productos"),
  relationship(AXEN_ENERGY_UNIT_ID, "coordinador-b2b", "gerente-productos"),
  relationship(AXEN_ENERGY_UNIT_ID, "coordinador-b2c", "gerente-productos"),
  relationship(AXEN_ENERGY_UNIT_ID, "ejecutivo-cuentas-finanzas", "gerente-productos"),
  relationship(AXEN_ENERGY_UNIT_ID, "coordinador-investigacion-desarrollo", "gerente-productos"),
  relationship(AXEN_ENERGY_UNIT_ID, "servicio-cliente", "gerente-operativo"),
  relationship(AXEN_ENERGY_UNIT_ID, "coordinador-mantenimiento-correccion", "gerente-operativo"),
];

export const axenHealthDefaultRelationships: FocusHierarchyRelationship[] = [
  relationship(AXEN_HEALTH_UNIT_ID, "gerente-administrativo", "director-general"),
  relationship(AXEN_HEALTH_UNIT_ID, "gerente-operativo", "director-general"),
  relationship(AXEN_HEALTH_UNIT_ID, "ejecutivo-cuentas-finanzas", "gerente-administrativo"),
  relationship(AXEN_HEALTH_UNIT_ID, "coordinador-servicios-produccion", "gerente-operativo"),
  relationship(AXEN_HEALTH_UNIT_ID, "coordinador-produccion", "gerente-operativo"),
  relationship(AXEN_HEALTH_UNIT_ID, "servicio-cliente", "coordinador-servicios-produccion"),
  relationship(AXEN_HEALTH_UNIT_ID, "host", "coordinador-servicios-produccion"),
  relationship(AXEN_HEALTH_UNIT_ID, "coach-interno", "coordinador-produccion"),
  relationship(AXEN_HEALTH_UNIT_ID, "especialista-externo", "coordinador-produccion"),
];

export const defaultFocusRelationships: FocusHierarchyRelationship[] = [
  ...fundacionDefaultRelationships,
  ...axenEnergyDefaultRelationships,
  ...axenHealthDefaultRelationships,
];
