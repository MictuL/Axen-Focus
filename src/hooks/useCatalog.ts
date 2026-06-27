import { useState } from "react";
import { businessUnits as seedUnits, physicalChecklistFormats, positions as seedPositions } from "../data/catalog";
import { getFocusDailyOperationFormats } from "../data/units/focusDailyOperationFormats";
import { hasOfficialKpis } from "../lib/catalog";
import type { BusinessUnit, OperationFormatSet, PhysicalChecklistFormat, Position } from "../types";

const UNIT_KEY = "axen-performance-units-v2";
const POSITION_KEY = "axen-performance-positions-v2";
const deprecatedUnitIds = new Set(["halcones-futbol-club"]);
const scopedSeedUnits = seedUnits.filter((unit) => !deprecatedUnitIds.has(unit.id));
const scopedSeedPositions = seedPositions.filter((position) => !deprecatedUnitIds.has(position.businessUnitId));
const scopedPhysicalChecklistFormats = (physicalChecklistFormats as PhysicalChecklistFormat[]).filter((format) => !deprecatedUnitIds.has(format.businessUnitId));
const validPhysicalFormatIds = new Set(scopedPhysicalChecklistFormats.map((format) => format.id));
const seedPositionIds = new Set(scopedSeedPositions.map((position) => position.id));
const deprecatedPositionNames = new Set(["ceo", "ceo / patronato", "ceo/patronato", "dueno", "dueño", "patronato"]);

function normalizeDeprecatedPositionValue(value: string) {
  return value.trim().normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es-MX").replace(/\s+/g, " ");
}

function isDeprecatedPosition(position: Position) {
  const name = normalizeDeprecatedPositionValue(position.name);
  const id = normalizeDeprecatedPositionValue(position.id);
  return deprecatedPositionNames.has(name) || id.endsWith(":dueno") || id.endsWith(":patronato") || id.endsWith(":ceo") || id.endsWith(":ceo-patronato");
}

function hasCompleteDefinition(position: Position) {
  return Boolean(position.rep.trim() && hasOfficialKpis(position.kpis));
}

function load<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function mergePositionSeedMetadata(saved: Position[]) {
  const activeSaved = saved.filter((position) =>
    !deprecatedUnitIds.has(position.businessUnitId)
    && !isDeprecatedPosition(position)
    && hasCompleteDefinition(position)
  );
  const savedById = new Map(activeSaved.map((position) => [position.id, position]));
  const cleanPhysicalFormatIds = (ids: string[] | undefined, fallback: string[] | undefined) => {
    const cleaned = (ids ?? []).filter((id) => validPhysicalFormatIds.has(id));
    if (cleaned.length) return cleaned;
    return (fallback ?? []).filter((id) => validPhysicalFormatIds.has(id));
  };

  const mergedSeeds = scopedSeedPositions.map((position) => {
    const savedPosition = savedById.get(position.id);
    if (!savedPosition) return { ...position, physicalFormatIds: cleanPhysicalFormatIds(position.physicalFormatIds, undefined) };
    const seedDefinitionChanged = Boolean(position.definitionSource && savedPosition.definitionSource !== position.definitionSource);
    return {
      ...position,
      ...savedPosition,
      ...(seedDefinitionChanged ? {
        definitionSource: position.definitionSource,
        isEvaluable: position.isEvaluable,
        kpis: position.kpis,
        rep: position.rep,
      } : {}),
      physicalFormatIds: cleanPhysicalFormatIds(savedPosition.physicalFormatIds, position.physicalFormatIds),
    };
  });
  const normalizedSeeds = mergedSeeds.map((position) => {
    const seed = scopedSeedPositions.find((item) => item.id === position.id);
    return seed
      ? { ...position, physicalFormatIds: cleanPhysicalFormatIds(position.physicalFormatIds, seed.physicalFormatIds) }
      : { ...position, physicalFormatIds: cleanPhysicalFormatIds(position.physicalFormatIds, undefined) };
  });
  const savedExtras = activeSaved
    .filter((position) => !seedPositionIds.has(position.id))
    .map((position) => ({ ...position, physicalFormatIds: cleanPhysicalFormatIds(position.physicalFormatIds, undefined) }));
  return [...normalizedSeeds, ...savedExtras];
}

function mergeUnitSeeds(saved: BusinessUnit[]) {
  const scopedSaved = saved.filter((unit) => !deprecatedUnitIds.has(unit.id));
  const savedById = new Map(scopedSaved.map((unit) => [unit.id, unit]));
  const mergedSeeds = scopedSeedUnits.map((unit) => ({ ...unit, ...(savedById.get(unit.id) ?? {}) }));
  const seedUnitIds = new Set(scopedSeedUnits.map((unit) => unit.id));
  return [...mergedSeeds, ...scopedSaved.filter((unit) => !seedUnitIds.has(unit.id))];
}

export function useCatalog() {
  const [units, setUnits] = useState<BusinessUnit[]>(() => mergeUnitSeeds(load(UNIT_KEY, scopedSeedUnits)));
  const [positions, setPositions] = useState<Position[]>(() => mergePositionSeedMetadata(load(POSITION_KEY, scopedSeedPositions)));

  function addUnit(unit: BusinessUnit) {
    if (deprecatedUnitIds.has(unit.id)) return;
    const next = [...units, unit];
    setUnits(next);
    localStorage.setItem(UNIT_KEY, JSON.stringify(next));
  }

  function updateUnit(unit: BusinessUnit) {
    if (deprecatedUnitIds.has(unit.id)) return;
    const next = units.map((item) => item.id === unit.id ? unit : item);
    setUnits(next);
    localStorage.setItem(UNIT_KEY, JSON.stringify(next));
  }

  function addPosition(position: Position) {
    if (deprecatedUnitIds.has(position.businessUnitId) || isDeprecatedPosition(position)) return;
    const next = [...positions, position];
    setPositions(next);
    localStorage.setItem(POSITION_KEY, JSON.stringify(next));
  }

  function updatePosition(position: Position) {
    if (deprecatedUnitIds.has(position.businessUnitId) || isDeprecatedPosition(position)) return;
    const next = positions.map((item) => item.id === position.id ? position : item);
    setPositions(next);
    localStorage.setItem(POSITION_KEY, JSON.stringify(next));
  }

  function restoreCatalog() {
    setUnits(scopedSeedUnits);
    setPositions(scopedSeedPositions);
    localStorage.removeItem(UNIT_KEY);
    localStorage.removeItem(POSITION_KEY);
  }

  return {
    units,
    positions,
    physicalChecklistFormats: scopedPhysicalChecklistFormats,
    operationFormats: getFocusDailyOperationFormats(positions) as OperationFormatSet[],
    addUnit,
    updateUnit,
    addPosition,
    updatePosition,
    restoreCatalog,
  };
}
